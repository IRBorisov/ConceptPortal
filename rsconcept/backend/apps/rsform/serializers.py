''' Serializers for conceptual schema API. '''
import json
from typing import Optional, cast
from rest_framework import serializers
from django.db import transaction

import pyconcept
from cctext import Resolver, Reference, ReferenceType, EntityReference, SyntacticReference

from .utils import fix_old_references
from .models import Constituenta, LibraryItem, RSForm

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


class ResultTextSerializer(serializers.Serializer):
    ''' Serializer: Text result of a function call. '''
    result = serializers.CharField()


class TextSerializer(serializers.Serializer):
    ''' Serializer: Text with references. '''
    text = serializers.CharField()


class LibraryItemSerializer(serializers.ModelSerializer):
    ''' Serializer: LibraryItem entry. '''
    class Meta:
        ''' serializer metadata. '''
        model = LibraryItem
        fields = '__all__'
        read_only_fields = ('owner', 'id', 'item_type')


class LibraryItemDetailsSerializer(serializers.ModelSerializer):
    ''' Serializer: LibraryItem detailed data. '''
    class Meta:
        ''' serializer metadata. '''
        model = LibraryItem
        fields = '__all__'
        read_only_fields = ('owner', 'id', 'item_type')

    def to_representation(self, instance: LibraryItem):
        result = super().to_representation(instance)
        result['subscribers'] = [item.pk for item in instance.subscribers()]
        return result


class PyConceptAdapter:
    ''' RSForm adapter for interacting with pyconcept module. '''
    def __init__(self, instance: RSForm):
        self.schema = instance
        self.data = self._prepare_request()
        self._checked_data: Optional[dict] = None

    def parse(self) -> dict:
        ''' Check RSForm and return check results.
            Warning! Does not include texts. '''
        self._produce_response()
        if self._checked_data is None:
            raise ValueError('Invalid data response from pyconcept')
        return self._checked_data

    def _prepare_request(self) -> dict:
        result: dict = {
            'items': []
        }
        items = self.schema.constituents().order_by('order')
        for cst in items:
            result['items'].append({
                'entityUID': cst.pk,
                'cstType': cst.cst_type,
                'alias': cst.alias,
                'definition': {
                    'formal': cst.definition_formal
                }
            })
        return result

    def _produce_response(self):
        if self._checked_data is not None:
            return
        response = pyconcept.check_schema(json.dumps(self.data))
        data = json.loads(response)
        self._checked_data = {
            'items': []
        }
        for cst in data['items']:
            self._checked_data['items'].append({
                'id': cst['entityUID'],
                'cstType': cst['cstType'],
                'alias': cst['alias'],
                'definition': {
                    'formal': cst['definition']['formal']
                },
                'parse': cst['parse']
            })


class RSFormSerializer(serializers.ModelSerializer):
    ''' Serializer: Detailed data for RSForm. '''
    class Meta:
        ''' serializer metadata. '''
        model = RSForm

    def to_representation(self, instance: RSForm):
        result = LibraryItemDetailsSerializer(instance.item).data
        result['items'] = []
        for cst in instance.constituents().order_by('order'):
            result['items'].append(ConstituentaSerializer(cst).data)
        return result


class RSFormParseSerializer(serializers.ModelSerializer):
    ''' Serializer: Detailed data for RSForm including parse. '''
    class Meta:
        ''' serializer metadata. '''
        model = RSForm

    def to_representation(self, instance: RSForm):
        result = RSFormSerializer(instance).data
        parse = PyConceptAdapter(instance).parse()
        for cst_data in result['items']:
            cst_data['parse'] = next(
                cst['parse'] for cst in parse['items']
                if cst['id'] == cst_data['id']
            )
        return result


class RSFormUploadSerializer(serializers.Serializer):
    ''' Upload data for RSForm serializer. '''
    file = serializers.FileField()
    load_metadata = serializers.BooleanField()


class RSFormTRSSerializer(serializers.Serializer):
    ''' Serializer: TRS file production and loading for RSForm. '''
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
            'title': schema.item.title,
            'alias': schema.item.alias,
            'comment': schema.item.comment,
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
        if 'is_canonical' in data:
            result['is_canonical'] = data['is_canonical']
        result['items'] = data.get('items', [])
        if self.context['load_meta']:
            result['title'] = data.get('title', 'Без названия')
            result['alias'] = data.get('alias', '')
            result['comment']= data.get('comment', '')
        if 'id' in data:
            result['id'] = data['id']
            self.instance = RSForm(LibraryItem.objects.get(pk=result['id']))
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
        self.instance: RSForm = RSForm.create(
            owner=validated_data.get('owner', None),
            alias=validated_data['alias'],
            title=validated_data['title'],
            comment=validated_data['comment'],
            is_common=validated_data['is_common'],
            is_canonical=validated_data['is_canonical']
        )
        self.instance.item.save()
        order = 1
        for cst_data in validated_data['items']:
            cst = Constituenta(
                alias=cst_data['alias'],
                schema=self.instance.item,
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
            instance.item.alias = validated_data['alias']
        if 'title' in validated_data:
            instance.item.title = validated_data['title']
        if 'comment' in validated_data:
            instance.item.comment = validated_data['comment']

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
                    schema=instance.item,
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

        instance.resolve_all_text()
        instance.item.save()
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
        schema = RSForm(instance.schema)
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
        schema.item.save()
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


class CstRenameSerializer(serializers.ModelSerializer):
    ''' Serializer: Constituenta renaming. '''
    class Meta:
        ''' serializer metadata. '''
        model = Constituenta
        fields = 'id', 'alias', 'cst_type'

    def validate(self, attrs):
        schema = cast(RSForm, self.context['schema'])
        old_cst = Constituenta.objects.get(pk=self.initial_data['id'])
        if old_cst.schema != schema.item:
            raise serializers.ValidationError({
                'id': f'Изменяемая конституента должна относиться к изменяемой схеме: {schema.item.title}'
            })
        if old_cst.alias == self.initial_data['alias']:
            raise serializers.ValidationError({
                'alias': f'Имя конституенты должно отличаться от текущего: {self.initial_data["alias"]}'
            })
        self.instance = old_cst
        attrs['schema'] = schema.item
        attrs['id'] = self.initial_data['id']
        return attrs


class CstListSerializer(serializers.Serializer):
    ''' Serializer: List of constituents from one origin. '''
    # TODO: fix schema
    items = serializers.ListField(
        child=CstStandaloneSerializer()
    )

    def validate(self, attrs):
        schema = self.context['schema']
        cstList = []
        for item in attrs['items']:
            cst = item['object']
            if cst.schema != schema.item:
                raise serializers.ValidationError(
                    {'items': f'Конституенты должны относиться к данной схеме: {item}'})
            cstList.append(cst)
        attrs['constituents'] = cstList
        return attrs


class CstMoveSerializer(CstListSerializer):
    ''' Serializer: Change constituenta position. '''
    move_to = serializers.IntegerField()


class ResolverSerializer(serializers.Serializer):
    ''' Serializer: Resolver results serializer. '''
    # TODO: add schema
    def to_representation(self, instance: Resolver) -> dict:
        return {
            'input': instance.input,
            'output': instance.output,
            'refs': [{
                'type': ref.ref.get_type().value,
                'data': self._get_reference_data(ref.ref),
                'resolved': ref.resolved,
                'pos_input': {
                    'start': ref.pos_input.start,
                    'finish': ref.pos_input.finish
                },
                'pos_output': {
                    'start': ref.pos_output.start,
                    'finish': ref.pos_output.finish
                }
            } for ref in instance.refs]
        }

    @staticmethod
    def _get_reference_data(ref: Reference) -> dict:
        if ref.get_type() == ReferenceType.entity:
            return {
                'entity': cast(EntityReference, ref).entity,
                'form': cast(EntityReference, ref).form
            }
        else:
            return {
                'offset': cast(SyntacticReference, ref).offset,
                'nominal': cast(SyntacticReference, ref).nominal
            }
