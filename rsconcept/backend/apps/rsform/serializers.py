''' Serializers for conceptual schema API. '''
from typing import Optional
from rest_framework import serializers
from django.db import transaction

from .utils import fix_old_references
from .models import Constituenta, RSForm

_CST_TYPE = 'constituenta'
_TRS_TYPE = 'rsform'
_TRS_VERSION_MIN = 16
_TRS_VERSION = 16
_TRS_HEADER = 'Exteor 4.8.13.1000 - 30/05/2022'


class FileSerializer(serializers.Serializer):
    ''' Serializer: File input. '''
    file = serializers.FileField(allow_empty_file=False)


class ExpressionSerializer(serializers.Serializer):
    ''' Serializer: RSLang expression. '''
    expression = serializers.CharField()


class RSFormMetaSerializer(serializers.ModelSerializer):
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


class RSFormContentsSerializer(serializers.ModelSerializer):
    ''' Serializer: Detailed data for RSForm. '''
    class Meta:
        ''' serializer metadata. '''
        model = RSForm

    def to_representation(self, instance: RSForm):
        result = RSFormMetaSerializer(instance).data
        result['items'] = []
        for cst in instance.constituents().order_by('order'):
            result['items'].append(ConstituentaSerializer(cst).data)
        return result


class RSFormTRSSerializer(serializers.Serializer):
    ''' Serializer: TRS file production and loading for RSForm. '''
    class Meta:
        ''' serializer metadata. '''
        model = RSForm

    def to_representation(self, instance: RSForm) -> dict:
        result = self._prepare_json_rsform(instance)
        items = instance.constituents().order_by('order')
        for cst in items:
            result['items'].append(self._prepare_json_constituenta(cst))
        return result

    @staticmethod
    def _prepare_json_rsform(schema: RSForm) -> dict:
        return {
            'type': _TRS_TYPE,
            'title': schema.title,
            'alias': schema.alias,
            'comment': schema.comment,
            'items': [],
            'claimed': False,
            'selection': [],
            'version': _TRS_VERSION,
            'versionInfo': _TRS_HEADER
        }

    @staticmethod
    def _prepare_json_constituenta(cst: Constituenta) -> dict:
        return {
            'entityUID': cst.pk,
            'type': _CST_TYPE,
            'cstType': cst.cst_type,
            'alias': cst.alias,
            'convention': cst.convention,
            'term': {
                'raw': cst.term_raw,
                'resolved': cst.term_resolved,
                'forms': cst.term_forms
            },
            'definition': {
                'formal': cst.definition_formal,
                'text': {
                    'raw': cst.definition_raw,
                    'resolved': cst.definition_resolved
                },
            },
        }

    def to_internal_value(self, data):
        result = super().to_internal_value(data)
        if 'owner' in data:
            result['owner'] = data['owner']
        if 'is_common' in data:
            result['is_common'] = data['is_common']
        result['items'] = data.get('items', [])
        if self.context['load_meta']:
            result['title'] = data.get('title', 'Без названия')
            result['alias'] = data.get('alias', '')
            result['comment']= data.get('comment', '')
        if 'id' in data:
            result['id'] = data['id']
            self.instance = RSForm.objects.get(pk=result['id'])
        return result

    def validate(self, attrs: dict):
        if 'version' not in self.initial_data \
                or self.initial_data['version'] < _TRS_VERSION_MIN  \
                or self.initial_data['version'] > _TRS_VERSION:
            raise serializers.ValidationError({
                'version': 'Некорректная версия файла Экстеор. Пересохраните файл в новой версии'
            })
        return attrs

    @transaction.atomic
    def create(self, validated_data: dict) -> RSForm:
        self.instance = RSForm(
            owner=validated_data.get('owner', None),
            alias=validated_data['alias'],
            title=validated_data['title'],
            comment=validated_data['comment'],
            is_common=validated_data['is_common']
        )
        self.instance.save()
        order = 1
        for cst_data in validated_data['items']:
            cst = Constituenta(
                alias=cst_data['alias'],
                schema=self.instance,
                order=order,
                cst_type=cst_data['cstType'],
            )
            self._load_cst_texts(cst, cst_data)
            cst.save()
            order += 1
        self.instance.resolve_all_text()
        return self.instance

    @transaction.atomic
    def update(self, instance: RSForm, validated_data) -> RSForm:
        if 'alias' in validated_data:
            instance.alias = validated_data['alias']
        if 'title' in validated_data:
            instance.title = validated_data['title']
        if 'comment' in validated_data:
            instance.comment = validated_data['comment']

        order = 1
        prev_constituents = instance.constituents()
        loaded_ids = set()
        for cst_data in validated_data['items']:
            uid = int(cst_data['entityUID'])
            if prev_constituents.filter(pk=uid).exists():
                cst: Constituenta = prev_constituents.get(pk=uid)
                cst.order = order
                cst.alias = cst_data['alias']
                cst.cst_type = cst_data['cstType']
                self._load_cst_texts(cst, cst_data)
                cst.save()
            else:
                cst = Constituenta(
                    alias=cst_data['alias'],
                    schema=instance,
                    order=order,
                    cst_type=cst_data['cstType'],
                )
                self._load_cst_texts(cst, cst_data)
                cst.save()
                uid = cst.pk
            loaded_ids.add(uid)
            order += 1
        for prev_cst in prev_constituents:
            if prev_cst.pk not in loaded_ids:
                prev_cst.delete()

        instance.update_order()
        instance.resolve_all_text()
        instance.save()
        return instance

    @staticmethod
    def _load_cst_texts(cst: Constituenta, data: dict):
        cst.convention = data.get('convention', '')
        if 'definition' in data:
            cst.definition_formal = data['definition'].get('formal', '')
            if 'text' in data['definition']:
                cst.definition_raw = fix_old_references(data['definition']['text'].get('raw', ''))
            else:
                cst.definition_raw = ''
        if 'term' in data:
            cst.term_raw = fix_old_references(data['term'].get('raw', ''))
            cst.term_forms = data['term'].get('forms', [])
        else:
            cst.term_raw = ''
            cst.term_forms = []


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
            schema.on_term_change([result.alias])
            result.refresh_from_db()
        schema.save()
        return result


class CstStandaloneSerializer(serializers.ModelSerializer):
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
        child=CstStandaloneSerializer()
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


class CstMoveSerlializer(CstListSerlializer):
    ''' Serializer: Change constituenta position. '''
    move_to = serializers.IntegerField()
