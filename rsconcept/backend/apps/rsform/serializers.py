from rest_framework import serializers

from .models import RSForm


class FileSerializer(serializers.Serializer):
    file = serializers.FileField(allow_empty_file=False)


class ExpressionSerializer(serializers.Serializer):
    expression = serializers.CharField()


class RSFormSerializer(serializers.ModelSerializer):
    class Meta:
        model = RSForm
        fields = '__all__'
        read_only_fields = ('owner', 'id')
