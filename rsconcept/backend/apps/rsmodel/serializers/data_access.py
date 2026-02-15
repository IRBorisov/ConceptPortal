''' Serializers for persistent data manipulation. '''
from typing import cast

from rest_framework import serializers
from rest_framework.serializers import PrimaryKeyRelatedField as PKField

from apps.library.models import LibraryItem
from apps.library.serializers import LibraryItemDetailsSerializer
from apps.rsform.models import Constituenta
from apps.rsform.models.RSForm import msg
from apps.rsform.serializers import RSFormSerializer
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
        return RSFormSerializer(model.schema).data

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
