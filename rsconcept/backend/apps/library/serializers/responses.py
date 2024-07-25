''' Utility serializers for REST API schema - SHOULD NOT BE ACCESSED DIRECTLY. '''
from rest_framework import serializers


class NewVersionResponse(serializers.Serializer):
    ''' Serializer: Create version response. '''
    version = serializers.IntegerField()
    schema = serializers.JSONField()
