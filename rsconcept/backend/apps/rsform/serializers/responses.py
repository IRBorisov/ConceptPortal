''' Utility serializers for REST API schema - SHOULD NOT BE ACCESSED DIRECTLY. '''
from rest_framework import serializers

from .data_access import RSFormParseSerializer


class ResultTextResponse(serializers.Serializer):
    ''' Serializer: Text result of a function call. '''
    result = serializers.CharField()


class NewCstResponse(serializers.Serializer):
    ''' Serializer: Create cst response. '''
    new_cst = serializers.IntegerField()
    schema = RSFormParseSerializer()


class NewMultiCstResponse(serializers.Serializer):
    ''' Serializer: Create multiple cst response. '''
    cst_list = serializers.ListField(
        child=serializers.IntegerField()
    )
    schema = RSFormParseSerializer()
