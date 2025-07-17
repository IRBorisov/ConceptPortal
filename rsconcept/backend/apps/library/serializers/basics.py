''' Basic serializers that do not interact with database. '''
from rest_framework import serializers

from shared import messages as msg
from shared.serializers import StrictSerializer

from ..models import AccessPolicy, validate_location


class LocationSerializer(StrictSerializer):
    ''' Serializer: Item location. '''
    location = serializers.CharField(max_length=500)

    def validate(self, attrs):
        attrs = super().validate(attrs)
        if not validate_location(attrs['location']):
            raise serializers.ValidationError({
                'location': msg.invalidLocation()
            })
        return attrs


class RenameLocationSerializer(StrictSerializer):
    ''' Serializer: rename location. '''
    target = serializers.CharField(max_length=500)
    new_location = serializers.CharField(max_length=500)

    def validate(self, attrs):
        attrs = super().validate(attrs)
        if not validate_location(attrs['target']):
            raise serializers.ValidationError({
                'target': msg.invalidLocation()
            })
        if not validate_location(attrs['target']):
            raise serializers.ValidationError({
                'new_location': msg.invalidLocation()
            })
        return attrs


class AccessPolicySerializer(StrictSerializer):
    ''' Serializer: Constituenta renaming. '''
    access_policy = serializers.CharField()

    def validate(self, attrs):
        attrs = super().validate(attrs)
        if not attrs['access_policy'] in AccessPolicy.values:
            raise serializers.ValidationError({
                'access_policy': msg.invalidEnum(attrs['access_policy'])
            })
        return attrs
