''' Serializers for conceptual schema API. '''
import json
from typing import Optional
from rest_framework import serializers

import pyconcept
from .models import Constituenta, RSForm


class FileSerializer(serializers.Serializer):
    ''' Serializer: File input. '''
    file = serializers.FileField(allow_empty_file=False)

    def create(self, validated_data):
        raise NotImplementedError('unexpected `create()` call')

    def update(self, instance, validated_data):
        raise NotImplementedError('unexpected `update()` call')


class ExpressionSerializer(serializers.Serializer):
    ''' Serializer: RSLang expression. '''
    expression = serializers.CharField()

    def create(self, validated_data):
        raise NotImplementedError('unexpected `create()` call')

    def update(self, instance, validated_data):
        raise NotImplementedError('unexpected `update()` call')


class RSFormSerializer(serializers.ModelSerializer):
    ''' Serializer: General purpose RSForm data. '''
    class Meta:
        ''' serializer metadata. '''
        model = RSForm
        fields = '__all__'
        read_only_fields = ('owner', 'id')


class RSFormUploadSerializer(serializers.Serializer):
    ''' Upload data for RSForm serializer. '''
    file = serializers.FileField()
    load_metadata = serializers.BooleanField()

    def create(self, validated_data):
        raise NotImplementedError('unexpected `create()` call')

    def update(self, instance, validated_data):
        raise NotImplementedError('unexpected `update()` call')


class RSFormContentsSerializer(serializers.ModelSerializer):
    ''' Serializer: Detailed data for RSForm. '''
    class Meta:
        ''' serializer metadata. '''
        model = RSForm

    def to_representation(self, instance: RSForm):
        result = RSFormSerializer(instance).data
        result['items'] = []
        for cst in instance.constituents().order_by('order'):
            result['items'].append(ConstituentaSerializer(cst).data)
        return result


class RSFormDetailsSerlializer(serializers.BaseSerializer):
    ''' Serializer: Processed data for RSForm. '''
    class Meta:
        ''' serializer metadata. '''
        model = RSForm

    def to_representation(self, instance: RSForm):
        trs = pyconcept.check_schema(json.dumps(instance.to_trs()))
        trs = trs.replace('entityUID', 'id')
        result = json.loads(trs)
        result['id'] = instance.pk
        result['time_update'] = instance.time_update
        result['time_create'] = instance.time_create
        result['is_common'] = instance.is_common
        result['owner'] = (instance.owner.pk if instance.owner is not None else None)
        return result

    def create(self, validated_data):
        raise NotImplementedError('unexpected `create()` call')

    def update(self, instance, validated_data):
        raise NotImplementedError('unexpected `update()` call')


class ConstituentaSerializer(serializers.ModelSerializer):
    ''' Serializer: Constituenta data. '''
    class Meta:
        ''' serializer metadata. '''
        model = Constituenta
        fields = '__all__'
        read_only_fields = ('id', 'order', 'alias', 'cst_type', 'definition_resolved', 'term_resolved')

    def update(self, instance: Constituenta, validated_data) -> Constituenta:
        schema: RSForm = instance.schema
        definition: Optional[str] = validated_data['definition_raw'] if 'definition_raw' in validated_data else None
        term: Optional[str] = validated_data['term_raw'] if 'term_raw' in validated_data else None
        term_changed = False
        if definition is not None and definition != instance.definition_raw :
            validated_data['definition_resolved'] = schema.resolver().resolve(definition)
        if term is not None and term != instance.term_raw:
            validated_data['term_resolved'] = schema.resolver().resolve(term)
            if validated_data['term_resolved'] != instance.term_resolved:
                validated_data['term_forms'] = []
            term_changed = validated_data['term_resolved'] != instance.term_resolved
        result: Constituenta = super().update(instance, validated_data)
        if term_changed:
            schema.on_term_change(result.alias)
            result.refresh_from_db()
        schema.save()
        return result


class StandaloneCstSerializer(serializers.ModelSerializer):
    ''' Serializer: Constituenta in current context. '''
    id = serializers.IntegerField()

    class Meta:
        ''' serializer metadata. '''
        model = Constituenta
        exclude = ('schema', )

    def validate(self, attrs):
        try:
            attrs['object'] = Constituenta.objects.get(pk=attrs['id'])
        except Constituenta.DoesNotExist as exception:
            raise serializers.ValidationError({f"{attrs['id']}": 'Конституента не существует'}) from exception
        return attrs


class CstCreateSerializer(serializers.ModelSerializer):
    ''' Serializer: Constituenta creation. '''
    insert_after = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        ''' serializer metadata. '''
        model = Constituenta
        fields = 'alias', 'cst_type', 'convention', 'term_raw', 'definition_raw', 'definition_formal', 'insert_after'


class CstListSerlializer(serializers.Serializer):
    ''' Serializer: List of constituents from one origin. '''
    items = serializers.ListField(
        child=StandaloneCstSerializer()
    )

    def validate(self, attrs):
        schema = self.context['schema']
        cstList = []
        for item in attrs['items']:
            cst = item['object']
            if cst.schema != schema:
                raise serializers.ValidationError(
                    {'items': f'Конституенты должны относиться к данной схеме: {item}'})
            cstList.append(cst)
        attrs['constituents'] = cstList
        return attrs

    def create(self, validated_data):
        raise NotImplementedError('unexpected `create()` call')

    def update(self, instance, validated_data):
        raise NotImplementedError('unexpected `update()` call')


class CstMoveSerlializer(CstListSerlializer):
    ''' Serializer: Change constituenta position. '''
    move_to = serializers.IntegerField()

    def create(self, validated_data):
        raise NotImplementedError('unexpected `create()` call')

    def update(self, instance, validated_data):
        raise NotImplementedError('unexpected `update()` call')
