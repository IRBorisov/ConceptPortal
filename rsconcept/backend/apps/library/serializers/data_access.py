''' Serializers for persistent data manipulation. '''
from typing import cast

from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied
from rest_framework.request import Request
from rest_framework.serializers import PrimaryKeyRelatedField as PKField

from apps.rsform.models import Constituenta
from shared import messages, permissions
from shared.serializers import StrictModelSerializer, StrictSerializer

from ..models import LibraryItem, LibraryItemType, Version
from ..services.location_access import assert_writable_item_data_location

_LIBRARY_ITEM_TIMESTAMP_FIELDS = ('time_create', 'time_update')


class LibraryItemBaseSerializer(StrictModelSerializer):
    ''' Serializer: LibraryItem entry full access. '''
    class Meta:
        ''' serializer metadata. '''
        model = LibraryItem
        fields = '__all__'
        read_only_fields = ('id', *_LIBRARY_ITEM_TIMESTAMP_FIELDS)


class LibraryItemCreateSerializer(LibraryItemBaseSerializer):
    ''' Serializer: LibraryItem creation data. '''
    schema = serializers.PrimaryKeyRelatedField(
        queryset=LibraryItem.objects.filter(item_type=LibraryItemType.RSFORM),
        required=False,
        allow_null=True,
        write_only=True
    )

    def validate_schema(self, value: LibraryItem | None) -> LibraryItem | None:
        ''' Restrict schema binding to readable RSForm items. '''
        if value is None:
            return value
        request = cast(Request | None, self.context.get('request'))
        if request is None:
            raise serializers.ValidationError('Request context is required')
        if not permissions.can_read_library_item(request.user, value):
            raise PermissionDenied({
                'message': messages.schemaForbidden(),
                'object_id': str(value.pk)
            })
        return value

    def validate(self, attrs):
        attrs = super().validate(attrs)
        item_type = attrs.get('item_type', LibraryItemType.RSFORM)
        if item_type == LibraryItemType.RSMODEL and attrs.get('schema') is None:
            raise serializers.ValidationError({
                'schema': 'Schema is required for RSModel'
            })
        return attrs

    def create(self, validated_data):
        '''Create LibraryItem without passing auxiliary `schema` to model.'''
        schema = validated_data.pop('schema', None)
        self._schema = schema
        return super().create(validated_data)

    class Meta:
        ''' serializer metadata. '''
        model = LibraryItem
        fields = '__all__'
        read_only_fields = ('id', 'owner', *_LIBRARY_ITEM_TIMESTAMP_FIELDS)


class LibraryItemBaseNonStrictSerializer(serializers.ModelSerializer):
    ''' Serializer: LibraryItem entry full access and no strict validation. '''
    class Meta:
        ''' serializer metadata. '''
        model = LibraryItem
        fields = '__all__'
        read_only_fields = ('id', *_LIBRARY_ITEM_TIMESTAMP_FIELDS)


class LibraryItemReferenceSerializer(StrictModelSerializer):
    ''' Serializer: reference to LibraryItem. '''
    class Meta:
        ''' serializer metadata. '''
        model = LibraryItem
        fields = 'id', 'alias'


class LibraryItemSerializer(StrictModelSerializer):
    ''' Serializer: LibraryItem entry limited access. '''
    class Meta:
        ''' serializer metadata. '''
        model = LibraryItem
        fields = '__all__'
        read_only_fields = (
            'id', 'item_type', 'owner', 'location', 'access_policy',
            'read_only', 'visible', *_LIBRARY_ITEM_TIMESTAMP_FIELDS
        )

    def validate(self, attrs):
        attrs = super().validate(attrs)
        forbidden = []
        initial_data = self.initial_data
        if isinstance(initial_data, dict):
            if 'read_only' in initial_data:
                forbidden.append('read_only')
            if 'visible' in initial_data:
                forbidden.append('visible')
        if forbidden:
            raise serializers.ValidationError({
                key: messages.fieldNotAllowed() for key in forbidden
            })
        return attrs


class LibraryItemCloneSerializer(StrictSerializer):
    ''' Serializer: LibraryItem cloning. '''
    class ItemCloneData(StrictModelSerializer):
        ''' Serialize: LibraryItem cloning data. '''
        class Meta:
            ''' serializer metadata. '''
            model = LibraryItem
            exclude = ['id', 'item_type', 'owner', 'read_only', 'time_create', 'time_update']

    items = PKField(many=True, queryset=Constituenta.objects.all().only('schema_id'))
    item_data = ItemCloneData()

    def validate_items(self, value):
        ''' Ensure selected constituents belong to the clone target schema. '''
        target = self.context.get('target')
        if target.item_type == LibraryItemType.OPERATION_SCHEMA and value:
            raise serializers.ValidationError('OSS clone does not support constituent selection')
        if target.item_type == LibraryItemType.RSFORM:
            invalid = [item.pk for item in value if item.schema_id != target.pk]
            if invalid:
                raise serializers.ValidationError(messages.constituentsInvalid(invalid))
        return value

    def validate(self, attrs):
        ''' Require request context and enforce shared-library / OSS location rules. '''
        location = attrs['item_data'].get('location', '')
        request = self.context.get('request')
        if request is None:
            raise serializers.ValidationError('Request context is required for clone')
        assert_writable_item_data_location(request.user, location)

        target = self.context.get('target')
        if target.item_type != LibraryItemType.OPERATION_SCHEMA:
            return attrs
        if location == target.location:
            raise serializers.ValidationError({
                'item_data': {'location': 'Clone target folder must differ from the source OSS location'}
            })
        return attrs


class VersionSerializer(StrictModelSerializer):
    ''' Serializer: Version data. '''
    class Meta:
        ''' serializer metadata. '''
        model = Version
        fields = 'id', 'version', 'item', 'description', 'time_create'
        read_only_fields = ('id', 'item', 'time_create')


class VersionInnerSerializer(StrictModelSerializer):
    ''' Serializer: Version data for list of versions. '''
    class Meta:
        ''' serializer metadata. '''
        model = Version
        fields = 'id', 'version', 'description', 'time_create'
        read_only_fields = ('id', 'item', 'time_create')


class VersionCreateSerializer(StrictModelSerializer):
    ''' Serializer: Version create data. '''
    items = PKField(many=True, required=False, default=None, queryset=Constituenta.objects.all().only('pk'))

    class Meta:
        ''' serializer metadata. '''
        model = Version
        fields = 'version', 'description', 'items'


class LibraryItemDetailsSerializer(StrictModelSerializer):
    ''' Serializer: LibraryItem detailed data. '''
    editors = serializers.SerializerMethodField()
    versions = serializers.SerializerMethodField()

    class Meta:
        ''' serializer metadata. '''
        model = LibraryItem
        fields = '__all__'
        read_only_fields = ('owner', 'id', 'item_type', *_LIBRARY_ITEM_TIMESTAMP_FIELDS)

    def get_editors(self, instance: LibraryItem) -> list[int]:
        ''' Editor user ids; empty for anonymous clients. '''
        request = self.context.get('request')
        if request is not None and getattr(request.user, 'is_anonymous', False):
            return []
        return list(instance.getQ_editors().order_by('pk').values_list('pk', flat=True))

    def get_versions(self, instance: LibraryItem) -> list:
        ''' Serialized version summaries for *instance*. '''
        return [VersionInnerSerializer(item).data for item in instance.getQ_versions().order_by('pk')]


class UserTargetSerializer(StrictSerializer):
    ''' Serializer: Target single User. '''
    user = PKField(many=False, queryset=User.objects.all().only('pk'))


class UsersListSerializer(StrictSerializer):
    ''' Serializer: List of Users. '''
    users = PKField(many=True, queryset=User.objects.all().only('pk'))
