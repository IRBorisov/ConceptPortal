''' Serializers for file interaction. '''
from django.db import transaction
from rest_framework import serializers

from apps.library.models import LibraryItem
from shared import messages as msg

from ..models import Constituenta, RSForm
from ..utils import fix_old_references

_CST_TYPE = 'constituenta'
_TRS_TYPE = 'rsform'
_TRS_VERSION_MIN = 16
_TRS_VERSION = 16
_TRS_HEADER = 'Exteor 4.8.13.1000 - 30/05/2022'


class FileSerializer(serializers.Serializer):
    ''' Serializer: File input. '''
    file = serializers.FileField(allow_empty_file=False)


class RSFormUploadSerializer(serializers.Serializer):
    ''' Upload data for RSForm serializer. '''
    file = serializers.FileField()
    load_metadata = serializers.BooleanField()


class RSFormTRSSerializer(serializers.Serializer):
    ''' Serializer: TRS file production and loading for RSForm. '''

    def to_representation(self, instance: RSForm) -> dict:
        result = self._prepare_json_rsform(instance.model)
        items = instance.constituents().order_by('order')
        for cst in items:
            result['items'].append(self._prepare_json_constituenta(cst))
        return result

    @staticmethod
    def _prepare_json_rsform(schema: LibraryItem) -> dict:
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

    def from_versioned_data(self, data: dict) -> dict:
        ''' Load data from version. '''
        result = {
            'type': _TRS_TYPE,
            'title': data['title'],
            'alias': data['alias'],
            'comment': data['comment'],
            'items': [],
            'claimed': False,
            'selection': [],
            'version': _TRS_VERSION,
            'versionInfo': _TRS_HEADER
        }
        for cst in data['items']:
            result['items'].append({
                'entityUID': cst['id'],
                'type': _CST_TYPE,
                'cstType': cst['cst_type'],
                'alias': cst['alias'],
                'convention': cst['convention'],
                'term': {
                    'raw': cst['term_raw'],
                    'resolved': cst['term_resolved'],
                    'forms': cst['term_forms']
                },
                'definition': {
                    'formal': cst['definition_formal'],
                    'text': {
                        'raw': cst['definition_raw'],
                        'resolved': cst['definition_resolved']
                    },
                },
            })
        return result

    def to_internal_value(self, data):
        result = super().to_internal_value(data)
        if 'owner' in data:
            result['owner'] = data['owner']
        if 'visible' in data:
            result['visible'] = data['visible']
        if 'read_only' in data:
            result['read_only'] = data['read_only']
        if 'access_policy' in data:
            result['access_policy'] = data['access_policy']
        if 'location' in data:
            result['location'] = data['location']
        result['items'] = data.get('items', [])
        if self.context['load_meta']:
            result['title'] = data.get('title', 'Без названия')
            result['alias'] = data.get('alias', '')
            result['comment'] = data.get('comment', '')
        if 'id' in data:
            result['id'] = data['id']
            self.instance = RSForm.from_id(result['id'])
        return result

    def validate(self, attrs: dict):
        if 'version' not in self.initial_data \
                or self.initial_data['version'] < _TRS_VERSION_MIN  \
                or self.initial_data['version'] > _TRS_VERSION:
            raise serializers.ValidationError({
                'version': msg.exteorFileVersionNotSupported()
            })
        return attrs

    @transaction.atomic
    def create(self, validated_data: dict) -> RSForm:
        self.instance: RSForm = RSForm.create(
            owner=validated_data.get('owner', None),
            alias=validated_data['alias'],
            title=validated_data['title'],
            comment=validated_data['comment'],
            visible=validated_data['visible'],
            read_only=validated_data['read_only'],
            access_policy=validated_data['access_policy'],
            location=validated_data['location']
        )
        self.instance.save()
        order = 1
        for cst_data in validated_data['items']:
            cst = Constituenta(
                alias=cst_data['alias'],
                schema=self.instance.model,
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
            instance.model.alias = validated_data['alias']
        if 'title' in validated_data:
            instance.model.title = validated_data['title']
        if 'comment' in validated_data:
            instance.model.comment = validated_data['comment']

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
                    schema=instance.model,
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
