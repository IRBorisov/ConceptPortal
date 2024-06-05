from rest_framework import serializers
from .data_access import InlineSynthesisSerializer

class SynthesisEdgeSerializer(serializers.Serializer):
    schema_from = serializers.IntegerField()
    schema_to = serializers.IntegerField()


class SynthesisNodeSerializer(serializers.Serializer):
    pk = serializers.IntegerField()
    vertical_coordinate = serializers.IntegerField()
    horizontal_coordinate = serializers.IntegerField()


class SynthesisGraphSerializer(serializers.Serializer):
    pk = serializers.IntegerField()
    user = serializers.CharField()
    edges_list = serializers.ListField(child=SynthesisEdgeSerializer())
