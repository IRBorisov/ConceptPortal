''' Serializers for persistent data manipulation. '''
from rest_framework import serializers

from apps.library.models import LibraryItem
from apps.library.serializers import LibraryItemDetailsSerializer
from shared.serializers import StrictModelSerializer

from ..models import ConstituentData, RSModel


class RSModelConstituentSerializer(StrictModelSerializer):
    ''' Serializer: constituent binding (constituent_id, data). '''
    class Meta:
        ''' serializer metadata. '''
        model = ConstituentData
        fields = ('constituent', 'data')
        read_only_fields = ('constituent',)


class RSModelSerializer(StrictModelSerializer):
    ''' Serializer: Detailed data for RSModel (schema_id + constituents). '''
    editors = serializers.ListField(
        child=serializers.IntegerField()
    )
    schema_id = serializers.SerializerMethodField()
    constituents = serializers.ListField(
        child=serializers.DictField()
    )

    class Meta:
        ''' serializer metadata. '''
        model = LibraryItem
        fields = '__all__'

    def get_schema_id(self, instance: LibraryItem):
        ''' Schema (RSForm) id or null. '''
        try:
            data = RSModel.objects.get(model=instance)
            return data.schema_id
        except RSModel.DoesNotExist:
            return None

    def to_representation(self, instance: LibraryItem) -> dict:
        result = LibraryItemDetailsSerializer(instance).data
        result['schema_id'] = self.get_schema_id(instance)
        result['constituents'] = []
        for binding in ConstituentData.objects.filter(model=instance).select_related('constituent'):
            result['constituents'].append({
                'constituent_id': binding.constituent_id,
                'data': binding.data
            })
        return result
