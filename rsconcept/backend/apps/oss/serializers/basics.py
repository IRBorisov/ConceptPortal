''' Basic serializers that do not interact with database. '''
from rest_framework import serializers


class PositionSerializer(serializers.Serializer):
    ''' Serializer: Position data. '''
    x = serializers.FloatField()
    y = serializers.FloatField()
    width = serializers.FloatField()
    height = serializers.FloatField()


class NodeSerializer(serializers.Serializer):
    ''' Oss node serializer. '''
    nodeID = serializers.CharField()
    x = serializers.FloatField()
    y = serializers.FloatField()
    width = serializers.FloatField()
    height = serializers.FloatField()


class LayoutSerializer(serializers.Serializer):
    ''' Serializer: Layout data. '''
    data = serializers.ListField(child=NodeSerializer())  # type: ignore


class SubstitutionExSerializer(serializers.Serializer):
    ''' Serializer: Substitution extended data. '''
    operation = serializers.IntegerField()
    original = serializers.IntegerField()
    substitution = serializers.IntegerField()
    original_alias = serializers.CharField()
    original_term = serializers.CharField()
    substitution_alias = serializers.CharField()
    substitution_term = serializers.CharField()
