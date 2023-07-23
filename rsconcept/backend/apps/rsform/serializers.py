from rest_framework import serializers

from .models import Constituenta, RSForm


class FileSerializer(serializers.Serializer):
    file = serializers.FileField(allow_empty_file=False)


class ItemsListSerlializer(serializers.Serializer):
    items = serializers.ListField(
        child=serializers.IntegerField()
    )


class ExpressionSerializer(serializers.Serializer):
    expression = serializers.CharField()


class RSFormSerializer(serializers.ModelSerializer):
    class Meta:
        model = RSForm
        fields = '__all__'
        read_only_fields = ('owner', 'id')


class ConstituentaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Constituenta
        fields = '__all__'
        read_only_fields = ('id', 'order', 'alias', 'csttype')

    def update(self, instance: Constituenta, validated_data):
        instance.schema.save()
        return super().update(instance, validated_data)


class NewConstituentaSerializer(serializers.Serializer):
    alias = serializers.CharField(max_length=8)
    csttype = serializers.CharField(max_length=10)
    insert_after = serializers.IntegerField(required=False)
