''' Utility serializers for REST API schema - SHOULD NOT BE ACCESSED DIRECTLY. '''
from rest_framework import serializers

from .data_access import ConstituentaSerializer, RSFormParseSerializer

class ResultTextResponse(serializers.Serializer):
    ''' Serializer: Text result of a function call. '''
    result = serializers.CharField()


class NewCstResponse(serializers.Serializer):
    ''' Serializer: Create cst response. '''
    new_cst = ConstituentaSerializer()
    schema = RSFormParseSerializer()

class NewVersionResponse(serializers.Serializer):
    ''' Serializer: Create cst response. '''
    version = serializers.IntegerField()
    schema = RSFormParseSerializer()
