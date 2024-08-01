''' Utility serializers for REST API schema - SHOULD NOT BE ACCESSED DIRECTLY. '''
from rest_framework import serializers

from apps.library.serializers import LibraryItemSerializer

from .data_access import OperationSchemaSerializer, OperationSerializer


class NewOperationResponse(serializers.Serializer):
    ''' Serializer: Create operation response. '''
    new_operation = OperationSerializer()
    oss = OperationSchemaSerializer()


class NewSchemaResponse(serializers.Serializer):
    ''' Serializer: Create RSForm for input operation response. '''
    new_schema = LibraryItemSerializer()
    oss = OperationSchemaSerializer()


class ConstituentaReferenceResponse(serializers.Serializer):
    ''' Serializer: Constituenta reference. '''
    id = serializers.IntegerField()
    schema = serializers.IntegerField()
