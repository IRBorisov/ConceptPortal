''' Serializers for API keys and action logs. '''
from rest_framework import serializers

from shared.serializers import StrictModelSerializer, StrictSerializer

from ..models import AgentActionLog, ApiKey


class ApiKeySerializer(StrictModelSerializer):
    ''' Serializer: API key metadata (never includes secret). '''
    class Meta:
        model = ApiKey
        fields = (
            'id',
            'label',
            'prefix',
            'created_at',
            'last_used_at',
            'revoked_at',
        )
        read_only_fields = fields


class ApiKeyCreateSerializer(StrictSerializer):
    ''' Serializer: create API key. '''
    label = serializers.CharField(max_length=100)


class ApiKeyCreatedSerializer(StrictSerializer):
    ''' Serializer: create response including one-time secret. '''
    id = serializers.IntegerField()
    label = serializers.CharField()
    prefix = serializers.CharField()
    created_at = serializers.DateTimeField()
    secret = serializers.CharField()


class ApiKeyUpdateSerializer(StrictSerializer):
    ''' Serializer: rename API key. '''
    label = serializers.CharField(max_length=100)


class AgentActionLogSerializer(StrictModelSerializer):
    ''' Serializer: agent action log row. '''
    class Meta:
        model = AgentActionLog
        fields = (
            'id',
            'api_key',
            'key_label',
            'key_prefix',
            'action',
            'item_id',
            'item_alias',
            'item_title',
            'status_code',
            'summary',
            'created_at',
        )
        read_only_fields = fields
