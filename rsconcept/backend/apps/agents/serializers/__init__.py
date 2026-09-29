''' Serializers for API keys and action logs. '''
from rest_framework import serializers

from shared.serializers import StrictModelSerializer, StrictSerializer

from ..models import AgentActionLog, ApiKey


class ApiKeySerializer(StrictModelSerializer):
    ''' Serializer: API key metadata (never includes secret). '''
    class Meta:
        ''' Serializer metadata. '''
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
    # ``label`` clashes with DRF Field.label in the type stubs.
    label = serializers.CharField(max_length=100)  # type: ignore[assignment]


class ApiKeyCreatedSerializer(StrictSerializer):
    ''' Serializer: create response including one-time secret. '''
    id = serializers.IntegerField()
    label = serializers.CharField()  # type: ignore[assignment]
    prefix = serializers.CharField()
    created_at = serializers.DateTimeField()
    secret = serializers.CharField()


class ApiKeyUpdateSerializer(StrictSerializer):
    ''' Serializer: rename API key. '''
    label = serializers.CharField(max_length=100)  # type: ignore[assignment]


class AgentActionLogSerializer(StrictModelSerializer):
    ''' Serializer: agent action log row. '''
    class Meta:
        ''' Serializer metadata. '''
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
            'request_text',
            'created_at',
        )
        read_only_fields = fields


class AgentActionLogPageSerializer(serializers.Serializer):
    ''' Response: one page of the agent action log. '''
    count = serializers.IntegerField()
    results = AgentActionLogSerializer(many=True)
