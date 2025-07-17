''' Utility serializers for REST API schema - SHOULD NOT BE ACCESSED DIRECTLY. '''
from rest_framework import serializers

from shared.serializers import StrictSerializer


class NewVersionResponse(StrictSerializer):
    ''' Serializer: Create version response. '''
    version = serializers.IntegerField()
    schema = serializers.JSONField()
