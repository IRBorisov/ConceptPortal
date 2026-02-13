''' Serializers for persistent data manipulation. '''
from rest_framework import serializers

from apps.library.models import LibraryItem
from apps.library.serializers import LibraryItemDetailsSerializer
from apps.rsform.serializers import RSFormSerializer
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
                'value': binding.data
            })
        return result
