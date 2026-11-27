''' API contracts for standalone and OSS relativization. '''
from rest_framework import serializers

from shared.serializers import StrictSerializer


class RelativizationInputSerializer(StrictSerializer):
    ''' Parameters expressed as persistent constituent IDs. '''
    source_time_update = serializers.DateTimeField()
    target = serializers.IntegerField(min_value=1)
    excluded = serializers.ListField(child=serializers.IntegerField(min_value=1))
    locale = serializers.ChoiceField(choices=['en', 'ru', 'fr'])
    context_name = serializers.CharField(max_length=255)


class CreateStandaloneRelativizationSerializer(RelativizationInputSerializer):
    ''' Create a new library schema from the projection. '''

    class ItemDataSerializer(StrictSerializer):
        ''' User-supplied metadata for the result. '''
        title = serializers.CharField()
        alias = serializers.CharField(max_length=255)
        description = serializers.CharField(required=False, allow_blank=True, default='')

    item_data = ItemDataSerializer()
