''' Serializers for persistent data manipulation. '''
from typing import cast

from django.db import transaction
from rest_framework import serializers
from rest_framework.serializers import PrimaryKeyRelatedField as PKField

from apps.library.models import LibraryItem
from apps.library.models.LibraryItem import AccessPolicy, LocationHead
from apps.library.serializers import LibraryItemDetailsSerializer
from apps.rsform.models import Constituenta
from apps.rsform.models.RSForm import msg
from apps.rsform.serializers.io_files import RSFormSandboxImportSerializer, create_rsform_from_sandbox_data
from shared.serializers import StrictModelSerializer, StrictSerializer

from ..models import ConstituentData, RSModel


class RSModelConstituentSerializer(StrictModelSerializer):
    ''' Serializer: constituent binding (constituent_id, data). '''
    class Meta:
        ''' serializer metadata. '''
        model = ConstituentData
        fields = ('constituent', 'data')
        read_only_fields = ('constituent',)


class RSModelSerializer(StrictModelSerializer):
    ''' Serializer: Detailed data for RSModel. '''
    editors = serializers.ListField(
        child=serializers.IntegerField()
    )
    items = serializers.ListField(
        child=serializers.DictField()
    )
    schema = serializers.SerializerMethodField()

    class Meta:
        ''' serializer metadata. '''
        model = LibraryItem
        fields = '__all__'

    def get_schema(self, instance: LibraryItem):
        model = RSModel.objects.get(model=instance)
        return model.schema_id

    def to_representation(self, instance: LibraryItem) -> dict:
        result = LibraryItemDetailsSerializer(instance).data
        del result['versions']
        result['schema'] = self.get_schema(instance)
        result['items'] = []
        for binding in ConstituentData.objects.filter(model=instance).select_related('constituent'):
            result['items'].append({
                'id': binding.constituent_id,
                'type': binding.type,
                'value': binding.data
            })
        return result


class CstDataUpdateSerializer(StrictSerializer):
    ''' Serializer: constituent data update for RSModel. '''
    target = PKField(
        many=False,
        queryset=Constituenta.objects.all().only('schema_id')
    )
    type = serializers.CharField()
    data = serializers.JSONField()  # type: ignore

    def validate(self, attrs):
        schema = cast(LibraryItem, self.context.get('schema', None))
        cst = attrs['target']
        if schema and cst.schema_id != schema.pk:
            raise serializers.ValidationError({
                f'{cst.pk}': msg.constituentaNotInRSform(schema.title)
            })
        return attrs


class RSModelSandboxImportSerializer(StrictSerializer):
    ''' Import data from sandbox bundle into a new RSModel with its schema. '''
    ItemDataSerializer = RSFormSandboxImportSerializer.ItemDataSerializer
    SchemaDataSerializer = RSFormSandboxImportSerializer.SchemaDataSerializer

    class ModelDataSerializer(StrictSerializer):
        ''' Serializer: RSModel value bindings for sandbox import. '''

        class ItemSerializer(StrictSerializer):
            ''' Serializer: One RSModel value binding item. '''
            id = serializers.IntegerField()
            type = serializers.CharField()
            value = serializers.JSONField()  # type: ignore

        items = ItemSerializer(many=True)

    item_data = ItemDataSerializer()
    schema_data = SchemaDataSerializer()
    model_data = ModelDataSerializer()

    def validate(self, attrs):
        attrs = super().validate(attrs)
        schema_ids = {item['id'] for item in attrs['schema_data']['items']}
        for binding in attrs['model_data']['items']:
            if binding['id'] not in schema_ids:
                raise serializers.ValidationError({
                    'model_data': 'Model bindings must reference imported constituents'
                })
        return attrs

    @transaction.atomic
    def create(self, validated_data: dict) -> LibraryItem:
        schema, id_map = create_rsform_from_sandbox_data(
            item_data=validated_data['item_data'],
            schema_data=validated_data['schema_data'],
            owner=self.context.get('owner')
        )
        model = RSModel.create(
            schema=LibraryItem.objects.get(pk=schema.pk),
            owner=self.context.get('owner'),
            title=validated_data['item_data']['title'],
            alias=validated_data['item_data']['alias'],
            description=validated_data['item_data'].get('description', ''),
            visible=validated_data['item_data'].get('visible', True),
            read_only=validated_data['item_data'].get('read_only', False),
            access_policy=validated_data['item_data'].get('access_policy', AccessPolicy.PUBLIC),
            location=validated_data['item_data'].get('location', LocationHead.USER)
        ).model

        seen: set[int] = set()
        bindings: list[ConstituentData] = []
        for item in validated_data['model_data']['items']:
            constituent_id = id_map.get(item['id'])
            if constituent_id is None or constituent_id in seen:
                continue
            seen.add(constituent_id)
            bindings.append(ConstituentData(
                model_id=model.pk,
                constituent_id=constituent_id,
                type=item['type'],
                data=item['value']
            ))
        if bindings:
            ConstituentData.objects.bulk_create(bindings)
        return model
