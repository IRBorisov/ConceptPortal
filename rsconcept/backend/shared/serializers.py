from rest_framework import serializers

import shared.messages as msg
from shared.portal_json import PORTAL_JSON_CONTRACT_VERSION


class StrictSerializer(serializers.Serializer):
    def to_internal_value(self, data):
        extra_keys = set(data.keys()) - set(self.fields.keys())
        if extra_keys:
            raise serializers.ValidationError({
                key: msg.fieldNotAllowed() for key in extra_keys
            })
        return super().to_internal_value(data)


class StrictModelSerializer(serializers.ModelSerializer):
    def to_internal_value(self, data):
        extra_keys = set(data.keys()) - set(self.fields.keys())
        if extra_keys:
            raise serializers.ValidationError({
                key: msg.fieldNotAllowed() for key in extra_keys
            })
        return super().to_internal_value(data)


class PortalImportJsonMetadataSerializer(serializers.Serializer):
    ''' Serializer: mandatory Portal JSON file metadata. '''
    contract_version = serializers.CharField()
    title = serializers.CharField()
    alias = serializers.CharField()
    description = serializers.CharField(allow_blank=True)

    def validate_contract_version(self, value: str) -> str:
        if value != PORTAL_JSON_CONTRACT_VERSION:
            raise serializers.ValidationError(
                f'Unsupported contract_version: {value!r} (expected {PORTAL_JSON_CONTRACT_VERSION!r})'
            )
        return value
