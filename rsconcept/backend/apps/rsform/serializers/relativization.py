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


class RelativizationTextSerializer(StrictSerializer):
    ''' The reviewed text of one projected row. '''
    id = serializers.IntegerField(min_value=1)
    clarified = serializers.BooleanField(default=False)
    term_raw = serializers.CharField(allow_blank=True, trim_whitespace=False)
    definition_raw = serializers.CharField(allow_blank=True, trim_whitespace=False)
    convention = serializers.CharField(allow_blank=True, trim_whitespace=False)


class RelativizationReviewSerializer(StrictSerializer):
    ''' Confirm the text review or accept the generated texts. '''
    skip_review = serializers.BooleanField(default=False)
    revision = serializers.CharField(min_length=64, max_length=64, required=False)
    reviewed = serializers.ListField(child=serializers.IntegerField(min_value=1), required=False)
    edits = RelativizationTextSerializer(many=True, required=False)

    def validate(self, attrs):
        validated = super().validate(attrs)
        fields = ('revision', 'reviewed', 'edits')
        if validated['skip_review']:
            errors = {field: 'Omit this field when skipping text review.' for field in fields if field in validated}
        else:
            errors = {field: 'This field is required for text review.' for field in fields if field not in validated}
        if errors:
            raise serializers.ValidationError(errors)
        return validated


class CreateStandaloneRelativizationSerializer(RelativizationInputSerializer, RelativizationReviewSerializer):
    ''' Create a new library schema from the projection. '''

    class ItemDataSerializer(StrictSerializer):
        ''' User-supplied metadata for the result. '''
        title = serializers.CharField()
        alias = serializers.CharField(max_length=255)
        description = serializers.CharField(required=False, allow_blank=True, default='')

    item_data = ItemDataSerializer()
