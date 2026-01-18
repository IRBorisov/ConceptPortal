''' Basic serializers that do not interact with database. '''
from rest_framework import serializers

from shared.serializers import StrictSerializer


class PositionSerializer(StrictSerializer):
    ''' Serializer: Position data. '''
    x = serializers.FloatField()
    y = serializers.FloatField()
    width = serializers.FloatField()
    height = serializers.FloatField()


class NodeSerializer(StrictSerializer):
    ''' Oss node serializer. '''
    nodeID = serializers.CharField()
    x = serializers.FloatField()
    y = serializers.FloatField()
    width = serializers.FloatField()
    height = serializers.FloatField()


class LayoutSerializer(StrictSerializer):
    ''' Serializer: Layout data. '''
    data = serializers.ListField(child=NodeSerializer())  # type: ignore


class SubstitutionExSerializer(StrictSerializer):
    ''' Serializer: Substitution extended data. '''
    operation = serializers.IntegerField()
    original = serializers.IntegerField()
    original_schema = serializers.IntegerField()
    substitution = serializers.IntegerField()
    substitution_schema = serializers.IntegerField()
    original_alias = serializers.CharField()
    original_term = serializers.CharField()
    substitution_alias = serializers.CharField()
    substitution_term = serializers.CharField()
