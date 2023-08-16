import json
from rest_framework import serializers

import pyconcept
from .models import Constituenta, RSForm


class FileSerializer(serializers.Serializer):
    file = serializers.FileField(allow_empty_file=False)


class ExpressionSerializer(serializers.Serializer):
    expression = serializers.CharField()


class RSFormSerializer(serializers.ModelSerializer):
    class Meta:
        model = RSForm
        fields = '__all__'
        read_only_fields = ('owner', 'id')


class RSFormUploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    load_metadata = serializers.BooleanField()


class RSFormContentsSerializer(serializers.ModelSerializer):
    class Meta:
        model = RSForm

    def to_representation(self, instance: RSForm):
        result = RSFormSerializer(instance).data
        result['items'] = []
        for cst in instance.constituents().order_by('order'):
            result['items'].append(ConstituentaSerializer(cst).data)
        return result


class ConstituentaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Constituenta
        fields = '__all__'
        read_only_fields = ('id', 'order', 'alias', 'cst_type')

    def update(self, instance: Constituenta, validated_data) -> Constituenta:
        if ('term_raw' in validated_data):
            validated_data['term_resolved'] = validated_data['term_raw']
        if ('definition_raw' in validated_data):
            validated_data['definition_resolved'] = validated_data['definition_raw']

        result = super().update(instance, validated_data)
        instance.schema.save()
        return result


class StandaloneCstSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()

    class Meta:
        model = Constituenta
        exclude = ('schema', )

    def validate(self, attrs):
        try:
            attrs['object'] = Constituenta.objects.get(pk=attrs['id'])
        except Constituenta.DoesNotExist:
            raise serializers.ValidationError({f"{attrs['id']}": 'Конституента не существует'})
        return attrs


class CstCreateSerializer(serializers.ModelSerializer):
    insert_after = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = Constituenta
        fields = 'alias', 'cst_type', 'convention', 'term_raw', 'definition_raw', 'definition_formal', 'insert_after'

    def validate(self, attrs):
        if ('term_raw' in attrs):
            attrs['term_resolved'] = attrs['term_raw']
        if ('definition_raw' in attrs):
            attrs['definition_resolved'] = attrs['definition_raw']
        return attrs


class CstListSerlializer(serializers.Serializer):
    items = serializers.ListField(
        child=StandaloneCstSerializer()
    )

    def validate(self, attrs):
        schema = self.context['schema']
        cstList = []
        for item in attrs['items']:
            cst = item['object']
            if (cst.schema != schema):
                raise serializers.ValidationError(
                    {'items': f'Конституенты должны относиться к данной схеме: {item}'})
            cstList.append(cst)
        attrs['constituents'] = cstList
        return attrs


class CstMoveSerlializer(CstListSerlializer):
    move_to = serializers.IntegerField()


class RSFormDetailsSerlializer(serializers.BaseSerializer):
    class Meta:
        model = RSForm

    def to_representation(self, instance: RSForm):
        trs = pyconcept.check_schema(json.dumps(instance.to_trs()))
        trs = trs.replace('entityUID', 'id')
        result = json.loads(trs)
        result['id'] = instance.id
        result['time_update'] = instance.time_update
        result['time_create'] = instance.time_create
        result['is_common'] = instance.is_common
        result['owner'] = (instance.owner.pk if instance.owner is not None else None)
        return result
