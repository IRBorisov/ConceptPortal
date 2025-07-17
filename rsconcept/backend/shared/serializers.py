from rest_framework import serializers

import shared.messages as msg


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
