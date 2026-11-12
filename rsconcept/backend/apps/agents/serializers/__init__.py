''' Serializers for API keys and action logs. '''
from django.utils import timezone
from rest_framework import serializers

from shared.serializers import StrictModelSerializer, StrictSerializer

from ..models import AgentActionLog, ApiKey
from ..models.ApiKey import API_KEY_SCOPES, default_api_key_scopes


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
            'scopes',
            'expires_at',
            'is_active',
        )
        read_only_fields = fields


class ApiKeyCreateSerializer(StrictSerializer):
    ''' Serializer: create API key. '''
    # ``label`` clashes with DRF Field.label in the type stubs.
    label = serializers.CharField(max_length=100)  # type: ignore[assignment]
    scopes = serializers.ListField(child=serializers.ChoiceField(choices=API_KEY_SCOPES),
                                   allow_empty=False, default=default_api_key_scopes)
    expires_at = serializers.DateTimeField(allow_null=True, required=False, default=None)

    def validate_scopes(self, value: list[str]) -> list[str]:
        """Store a deterministic set; unknown and empty scopes are rejected."""
        return [scope for scope in API_KEY_SCOPES if scope in value]

    def validate_expires_at(self, value):
        """New expiration must still be in the future at request validation."""
        if value is not None and value <= timezone.now():
            raise serializers.ValidationError('Expiration must be in the future.')
        return value


class ApiKeyCreatedSerializer(StrictSerializer):
    ''' Serializer: create response including one-time secret. '''
    id = serializers.IntegerField()
    label = serializers.CharField()  # type: ignore[assignment]
    prefix = serializers.CharField()
    created_at = serializers.DateTimeField()
    secret = serializers.CharField()
    scopes = serializers.ListField(child=serializers.ChoiceField(choices=API_KEY_SCOPES))
    expires_at = serializers.DateTimeField(allow_null=True)


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
