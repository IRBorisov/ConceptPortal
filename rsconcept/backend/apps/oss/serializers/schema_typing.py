''' Utility serializers for REST API schema - SHOULD NOT BE ACCESSED DIRECTLY. '''
from rest_framework import serializers

from .data_access import OperationSchemaSerializer, OperationSerializer


class NewOperationResponse(serializers.Serializer):
    ''' Serializer: Create operation response. '''
    new_operation = OperationSerializer()
    oss = OperationSchemaSerializer()
