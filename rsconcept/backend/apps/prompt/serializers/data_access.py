''' Serializers for prompt template data access. '''

from rest_framework import serializers

from shared import messages as msg

from ..models import PromptTemplate


class PromptTemplateSerializer(serializers.ModelSerializer):
    '''Serializer for PromptTemplate, enforcing permissions and ownership logic.'''
    class Meta:
        ''' serializer metadata. '''
        model = PromptTemplate
        fields = ['id', 'owner', 'is_shared', 'label', 'description', 'text']
        read_only_fields = ['id', 'owner']

    def validate_label(self, value):
        user = self.context['request'].user
        if PromptTemplate.objects.filter(owner=user, label=value).exists():
            raise serializers.ValidationError(msg.promptLabelTaken(value))
        return value

    def validate_is_shared(self, value):
        user = self.context['request'].user
        if value and not (user.is_superuser or user.is_staff):
            raise serializers.ValidationError(msg.promptSharedPermissionDenied())
        return value

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        user = self.context['request'].user
        if 'is_shared' in validated_data:
            if validated_data['is_shared'] and not (user.is_superuser or user.is_staff):
                raise serializers.ValidationError(msg.promptSharedPermissionDenied())
        return super().update(instance, validated_data)


class PromptTemplateListSerializer(serializers.ModelSerializer):
    '''Serializer for listing PromptTemplates without the 'text' field.'''
    class Meta:
        ''' serializer metadata. '''
        model = PromptTemplate
        fields = ['id', 'owner', 'is_shared', 'label', 'description']
        read_only_fields = ['id', 'owner']
