''' Basic serializers that do not interact with database. '''
from rest_framework import serializers


class OperationNodeSerializer(serializers.Serializer):
    ''' Operation position. '''
    id = serializers.IntegerField()
    x = serializers.FloatField()
    y = serializers.FloatField()


class BlockNodeSerializer(serializers.Serializer):
    ''' Block position. '''
    id = serializers.IntegerField()
    x = serializers.FloatField()
    y = serializers.FloatField()
    width = serializers.FloatField()
    height = serializers.FloatField()


class LayoutSerializer(serializers.Serializer):
    ''' Layout for OperationSchema. '''
    blocks = serializers.ListField(
        child=BlockNodeSerializer()
    )
    operations = serializers.ListField(
        child=OperationNodeSerializer()
    )


class SubstitutionExSerializer(serializers.Serializer):
    ''' Serializer: Substitution extended data. '''
    operation = serializers.IntegerField()
    original = serializers.IntegerField()
    substitution = serializers.IntegerField()
    original_alias = serializers.CharField()
    original_term = serializers.CharField()
    substitution_alias = serializers.CharField()
    substitution_term = serializers.CharField()
