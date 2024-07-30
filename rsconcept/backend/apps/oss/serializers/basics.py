''' Basic serializers that do not interact with database. '''
from rest_framework import serializers


class OperationPositionSerializer(serializers.Serializer):
    ''' Operation position. '''
    id = serializers.IntegerField()
    position_x = serializers.FloatField()
    position_y = serializers.FloatField()


class PositionsSerializer(serializers.Serializer):
    ''' Operations position for OperationSchema. '''
    positions = serializers.ListField(
        child=OperationPositionSerializer()
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
