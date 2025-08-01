''' Serializers for file interaction. '''
from django.db import transaction
from rest_framework import serializers

from apps.library.models import LibraryItem
from shared import messages as msg
from shared.serializers import StrictSerializer

from ..models import Constituenta, RSFormCached
from ..utils import fix_old_references

_CST_TYPE = 'constituenta'
_TRS_TYPE = 'rsform'
_TRS_VERSION_MIN = 16
_TRS_VERSION = 16
_TRS_HEADER = 'Exteor 4.8.13.1000 - 30/05/2022'


class FileSerializer(StrictSerializer):
    ''' Serializer: File input. '''
    file = serializers.FileField(allow_empty_file=False)


class RSFormUploadSerializer(StrictSerializer):
    ''' Upload data for RSForm serializer. '''
    file = serializers.FileField()
    load_metadata = serializers.BooleanField()


def generate_trs(schema: LibraryItem) -> dict:
    ''' Generate TRS file for RSForm. '''
    items = []
    for cst in Constituenta.objects.filter(schema=schema).order_by('order'):
        items.append(
            {
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
        )
    return {
        'type': _TRS_TYPE,
        'title': schema.title,
        'alias': schema.alias,
        'comment': schema.description,
        'items': items,
        'claimed': False,
        'selection': [],
        'version': _TRS_VERSION,
        'versionInfo': _TRS_HEADER
    }


class RSFormTRSSerializer(serializers.Serializer):
    ''' Serializer: TRS file production and loading for RSForm. '''

    @staticmethod
    def load_versioned_data(data: dict) -> dict:
        ''' Load data from version. '''
        result = {
            'type': _TRS_TYPE,
            'title': data['title'],
            'alias': data['alias'],
            'comment': data['description'],
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
            result['description'] = data.get('description', '')
        if 'id' in data:
            result['id'] = data['id']
            self.instance = RSFormCached.from_id(result['id'])
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
    def create(self, validated_data: dict) -> RSFormCached:
        self.instance: RSFormCached = RSFormCached.create(
            owner=validated_data.get('owner', None),
            alias=validated_data['alias'],
            title=validated_data['title'],
            description=validated_data['description'],
            visible=validated_data['visible'],
            read_only=validated_data['read_only'],
            access_policy=validated_data['access_policy'],
            location=validated_data['location']
        )
        self.instance.save()
        order = 0
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
    def update(self, instance: RSFormCached, validated_data) -> RSFormCached:
        if 'alias' in validated_data:
            instance.model.alias = validated_data['alias']
        if 'title' in validated_data:
            instance.model.title = validated_data['title']
        if 'description' in validated_data:
            instance.model.description = validated_data['description']

        order = 0
        prev_constituents = instance.constituentsQ()
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
