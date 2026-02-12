''' Serializers for persistent data manipulation. '''
from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework.serializers import PrimaryKeyRelatedField as PKField

from apps.rsform.models import Constituenta
from shared import messages
from shared.serializers import StrictModelSerializer, StrictSerializer

from ..models import LibraryItem, Version


class LibraryItemBaseSerializer(StrictModelSerializer):
    ''' Serializer: LibraryItem entry full access. '''
    class Meta:
        ''' serializer metadata. '''
        model = LibraryItem
        fields = '__all__'
        read_only_fields = ('id',)


class LibraryItemCreateSerializer(LibraryItemBaseSerializer):
    ''' Serializer: LibraryItem creation data. '''
    schema = serializers.PrimaryKeyRelatedField(
        queryset=LibraryItem.objects.all(),
        required=False,
        allow_null=True,
        write_only=True
    )

    def create(self, validated_data):
        '''Create LibraryItem without passing auxiliary `schema` to model.'''
        schema = validated_data.pop('schema', None)
        self._schema = schema
        return super().create(validated_data)

    class Meta:
        ''' serializer metadata. '''
        model = LibraryItem
        fields = '__all__'
        read_only_fields = ('id',)


class LibraryItemBaseNonStrictSerializer(serializers.ModelSerializer):
    ''' Serializer: LibraryItem entry full access and no strict validation. '''
    class Meta:
        ''' serializer metadata. '''
        model = LibraryItem
        fields = '__all__'
        read_only_fields = ('id',)


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
        read_only_fields = ('id', 'item_type', 'owner', 'location', 'access_policy')


class LibraryItemCloneSerializer(StrictSerializer):
    ''' Serializer: LibraryItem cloning. '''
    class ItemCloneData(StrictModelSerializer):
        ''' Serialize: LibraryItem cloning data. '''
        class Meta:
            ''' serializer metadata. '''
            model = LibraryItem
            exclude = ['id', 'item_type', 'owner', 'read_only']

    items = PKField(many=True, queryset=Constituenta.objects.all().only('schema_id'))
    item_data = ItemCloneData()

    def validate_items(self, value):
        schema = self.context.get('schema')
        invalid = [item.pk for item in value if item.schema_id != schema.id]
        if invalid:
            raise serializers.ValidationError(messages.constituentsInvalid(invalid))
        return value


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
        read_only_fields = ('owner', 'id', 'item_type')

    def get_editors(self, instance: LibraryItem) -> list[int]:
        return list(instance.getQ_editors().order_by('pk').values_list('pk', flat=True))

    def get_versions(self, instance: LibraryItem) -> list:
        return [VersionInnerSerializer(item).data for item in instance.getQ_versions().order_by('pk')]


class UserTargetSerializer(StrictSerializer):
    ''' Serializer: Target single User. '''
    user = PKField(many=False, queryset=User.objects.all().only('pk'))


class UsersListSerializer(StrictSerializer):
    ''' Serializer: List of Users. '''
    users = PKField(many=True, queryset=User.objects.all().only('pk'))
