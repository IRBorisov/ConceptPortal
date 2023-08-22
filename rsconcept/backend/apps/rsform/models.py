''' Models: RSForms for conceptual schemas. '''
import json
from copy import deepcopy
import re
from typing import Iterable, Optional, cast

from django.db import transaction
from django.db.models import (
    CASCADE, SET_NULL, ForeignKey, Model, PositiveIntegerField, QuerySet,
    TextChoices, TextField, BooleanField, CharField, DateTimeField, JSONField
)
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
from django.urls import reverse

import pyconcept
from apps.users.models import User
from cctext import Resolver, Entity, extract_entities
from .graph import Graph
from .utils import apply_mapping_pattern


_REF_ENTITY_PATTERN = re.compile(r'@{([^0-9\-].*?)\|.*?}')
_GLOBAL_ID_PATTERN = re.compile(r'([XCSADFPT][0-9]+)')


class CstType(TextChoices):
    ''' Type of constituenta '''
    BASE = 'basic'
    CONSTANT = 'constant'
    STRUCTURED = 'structure'
    AXIOM = 'axiom'
    TERM = 'term'
    FUNCTION = 'function'
    PREDICATE = 'predicate'
    THEOREM = 'theorem'


class Syntax(TextChoices):
    ''' Syntax types '''
    UNDEF = 'undefined'
    ASCII = 'ascii'
    MATH = 'math'


def _empty_forms():
    return []

def _get_type_prefix(cst_type: CstType) -> str:
    ''' Get alias prefix. '''
    if cst_type == CstType.BASE:
        return 'X'
    if cst_type == CstType.CONSTANT:
        return 'C'
    if cst_type == CstType.STRUCTURED:
        return 'S'
    if cst_type == CstType.AXIOM:
        return 'A'
    if cst_type == CstType.TERM:
        return 'D'
    if cst_type == CstType.FUNCTION:
        return 'F'
    if cst_type == CstType.PREDICATE:
        return 'P'
    if cst_type == CstType.THEOREM:
        return 'T'
    return 'X'


class RSForm(Model):
    ''' RSForm is a math form of capturing conceptual schema '''
    owner: ForeignKey = ForeignKey(
        verbose_name='Владелец',
        to=User,
        on_delete=SET_NULL,
        null=True
    )
    title: TextField = TextField(
        verbose_name='Название'
    )
    alias: CharField = CharField(
        verbose_name='Шифр',
        max_length=255,
        blank=True
    )
    comment: TextField = TextField(
        verbose_name='Комментарий',
        blank=True
    )
    is_common: BooleanField = BooleanField(
        verbose_name='Общая',
        default=False
    )
    time_create: DateTimeField = DateTimeField(
        verbose_name='Дата создания',
        auto_now_add=True
    )
    time_update: DateTimeField = DateTimeField(
        verbose_name='Дата изменения',
        auto_now=True
    )

    class Meta:
        ''' Model metadata. '''
        verbose_name = 'Схема'
        verbose_name_plural = 'Схемы'

    def constituents(self) -> QuerySet['Constituenta']:
        ''' Get QuerySet containing all constituents of current RSForm '''
        return Constituenta.objects.filter(schema=self)

    def resolver(self) -> Resolver:
        ''' Create resolver for text references based on schema terms. '''
        result = Resolver({})
        for cst in self.constituents():
            entity = Entity(alias=cst.alias, nominal=cst.term_resolved, manual_forms=cst.term_forms)
            result.context[cst.alias] = entity
        return result

    @transaction.atomic
    def on_term_change(self, changed: Iterable[str]):
        ''' Trigger cascade resolutions when term changes. '''
        graph_terms = self._term_graph()
        expansion = graph_terms.expand_outputs(changed)
        resolver = self.resolver()
        if len(expansion) > 0:
            for alias in graph_terms.topological_order():
                if alias not in expansion:
                    continue
                cst = self.constituents().get(alias=alias)
                resolved = resolver.resolve(cst.term_raw)
                if resolved == cst.term_resolved:
                    continue
                cst.set_term_resolved(resolved)
                cst.save()
                resolver.context[cst.alias] = Entity(cst.alias, resolved)

        graph_defs = self._definition_graph()
        update_defs = set(expansion + graph_defs.expand_outputs(expansion)).union(changed)
        if len(update_defs) == 0:
            return
        for alias in update_defs:
            cst = self.constituents().get(alias=alias)
            resolved = resolver.resolve(cst.definition_raw)
            if resolved == cst.definition_resolved:
                continue
            cst.definition_resolved = resolved
            cst.save()

    @transaction.atomic
    def insert_at(self, position: int, alias: str, insert_type: CstType) -> 'Constituenta':
        ''' Insert new constituenta at given position. All following constituents order is shifted by 1 position '''
        if position <= 0:
            raise ValidationError('Invalid position: should be positive integer')
        update_list = Constituenta.objects.only('id', 'order', 'schema').filter(schema=self, order__gte=position)
        for cst in update_list:
            cst.order += 1
        Constituenta.objects.bulk_update(update_list, ['order'])

        result = Constituenta.objects.create(
            schema=self,
            order=position,
            alias=alias,
            cst_type=insert_type
        )
        self.update_order()
        self.save()
        result.refresh_from_db()
        return result

    @transaction.atomic
    def insert_last(self, alias: str, insert_type: CstType) -> 'Constituenta':
        ''' Insert new constituenta at last position '''
        position = 1
        if self.constituents().exists():
            position += self.constituents().count()
        result = Constituenta.objects.create(
            schema=self,
            order=position,
            alias=alias,
            cst_type=insert_type
        )
        self.update_order()
        self.save()
        result.refresh_from_db()
        return result

    @transaction.atomic
    def move_cst(self, listCst: list['Constituenta'], target: int):
        ''' Move list of constituents to specific position '''
        count_moved = 0
        count_top = 0
        count_bot = 0
        size = len(listCst)
        update_list = []
        for cst in self.constituents().only('id', 'order').order_by('order'):
            if cst not in listCst:
                if count_top + 1 < target:
                    cst.order = count_top + 1
                    count_top += 1
                else:
                    cst.order = target + size + count_bot
                    count_bot += 1
            else:
                cst.order = target + count_moved
                count_moved += 1
            update_list.append(cst)
        Constituenta.objects.bulk_update(update_list, ['order'])
        self.update_order()
        self.save()

    @transaction.atomic
    def delete_cst(self, listCst):
        ''' Delete multiple constituents. Do not check if listCst are from this schema '''
        for cst in listCst:
            cst.delete()
        self.update_order()
        self.resolve_all_text()
        self.save()

    @transaction.atomic
    def create_cst(self, data: dict, insert_after: Optional[str]=None) -> 'Constituenta':
        ''' Create new cst from data. '''
        resolver = self.resolver()
        cst = self._insert_new(data, insert_after)
        cst.convention = data.get('convention', '')
        cst.definition_formal = data.get('definition_formal', '')
        cst.term_raw = data.get('term_raw', '')
        if cst.term_raw != '':
            resolved = resolver.resolve(cst.term_raw)
            cst.term_resolved = resolved
            resolver.context[cst.alias] = Entity(cst.alias, resolved)
        cst.definition_raw = data.get('definition_raw', '')
        if cst.definition_raw != '':
            cst.definition_resolved = resolver.resolve(cst.definition_raw)
        cst.save()
        self.on_term_change([cst.alias])
        cst.refresh_from_db()
        return cst

    def reset_aliases(self):
        ''' Recreate all aliases based on cst order. '''
        mapping = self._create_reset_mapping()
        self._apply_mapping(mapping)

    def _create_reset_mapping(self) -> dict[str, str]:
        bases = cast(dict[str, int], {})
        mapping = cast(dict[str, str], {})
        for cst_type in CstType.values:
            bases[cst_type] = 1
        cst_list = self.constituents().order_by('order')
        for cst in cst_list:
            alias = f'{_get_type_prefix(cst.cst_type)}{bases[cst.cst_type]}'
            bases[cst.cst_type] += 1
            if cst.alias != alias:
                mapping[cst.alias] = alias
        return mapping

    @transaction.atomic
    def _apply_mapping(self, mapping: dict[str, str]):
        cst_list = self.constituents().order_by('order')
        for cst in cst_list:
            modified = False
            if cst.alias in mapping:
                modified = True
                cst.alias = mapping[cst.alias]
            expression = apply_mapping_pattern(cst.definition_formal, mapping, _GLOBAL_ID_PATTERN)
            if expression != cst.definition_formal:
                modified = True
                cst.definition_formal = expression
            convention = apply_mapping_pattern(cst.convention, mapping, _GLOBAL_ID_PATTERN)
            if convention != cst.convention:
                modified = True
                cst.convention = convention
            term = apply_mapping_pattern(cst.term_raw, mapping, _REF_ENTITY_PATTERN)
            if term != cst.term_raw:
                modified = True
                cst.term_raw = term
            definition = apply_mapping_pattern(cst.definition_raw, mapping, _REF_ENTITY_PATTERN)
            if definition != cst.definition_raw:
                modified = True
                cst.definition_raw = definition
            if modified:
                cst.save()

    @transaction.atomic
    def update_order(self):
        ''' Update constituents order. '''
        checked = PyConceptAdapter(self).basic()
        update_list = self.constituents().only('id', 'order')
        if len(checked['items']) != update_list.count():
            raise ValidationError('Invalid constituents count')
        order = 1
        for cst in checked['items']:
            cst_id = cst['id']
            for oldCst in update_list:
                if oldCst.pk == cst_id:
                    oldCst.order = order
                    order += 1
                    break
        Constituenta.objects.bulk_update(update_list, ['order'])

    @transaction.atomic
    def resolve_all_text(self):
        ''' Trigger reference resolution for all texts. '''
        graph_terms = self._term_graph()
        resolver = Resolver({})
        for alias in graph_terms.topological_order():
            cst = self.constituents().get(alias=alias)
            resolved = resolver.resolve(cst.term_raw)
            resolver.context[cst.alias] = Entity(cst.alias, resolved)
            if resolved != cst.term_resolved:
                cst.term_resolved = resolved
                cst.save()
        for cst in self.constituents():
            resolved = resolver.resolve(cst.definition_raw)
            if resolved != cst.definition_resolved:
                cst.definition_resolved = resolved
                cst.save()

    def _insert_new(self, data: dict, insert_after: Optional[str]=None) -> 'Constituenta':
        if insert_after is not None:
            cstafter = Constituenta.objects.get(pk=insert_after)
            return self.insert_at(cstafter.order + 1, data['alias'], data['cst_type'])
        else:
            return self.insert_last(data['alias'], data['cst_type'])

    def __str__(self) -> str:
        return f'{self.title}'

    def get_absolute_url(self):
        return reverse('rsform-detail', kwargs={'pk': self.pk})

    def _term_graph(self) -> Graph:
        result = Graph()
        cst_list = self.constituents().only('order', 'alias', 'term_raw').order_by('order')
        for cst in cst_list:
            result.add_node(cst.alias)
        for cst in cst_list:
            for alias in extract_entities(cst.term_raw):
                if result.contains(alias):
                    result.add_edge(id_from=alias, id_to=cst.alias)
        return result

    def _definition_graph(self) -> Graph:
        result = Graph()
        cst_list = self.constituents().only('order', 'alias', 'definition_raw').order_by('order')
        for cst in cst_list:
            result.add_node(cst.alias)
        for cst in cst_list:
            for alias in extract_entities(cst.definition_raw):
                if result.contains(alias):
                    result.add_edge(id_from=alias, id_to=cst.alias)
        return result


class Constituenta(Model):
    ''' Constituenta is the base unit for every conceptual schema '''
    schema: ForeignKey = ForeignKey(
        verbose_name='Концептуальная схема',
        to=RSForm,
        on_delete=CASCADE
    )
    order: PositiveIntegerField = PositiveIntegerField(
        verbose_name='Позиция',
        validators=[MinValueValidator(1)],
        default=-1,
    )
    alias: CharField = CharField(
        verbose_name='Имя',
        max_length=8,
        default='undefined'
    )
    cst_type: CharField = CharField(
        verbose_name='Тип',
        max_length=10,
        choices=CstType.choices,
        default=CstType.BASE
    )
    convention: TextField = TextField(
        verbose_name='Комментарий/Конвенция',
        default='',
        blank=True
    )
    term_raw: TextField = TextField(
        verbose_name='Термин (с отсылками)',
        default='',
        blank=True
    )
    term_resolved: TextField = TextField(
        verbose_name='Термин',
        default='',
        blank=True
    )
    term_forms: JSONField = JSONField(
        verbose_name='Словоформы',
        default=_empty_forms
    )
    definition_formal: TextField = TextField(
        verbose_name='Родоструктурное определение',
        default='',
        blank=True
    )
    definition_raw: TextField = TextField(
        verbose_name='Текстовое определние (с отсылками)',
        default='',
        blank=True
    )
    definition_resolved: TextField = TextField(
        verbose_name='Текстовое определние',
        default='',
        blank=True
    )

    class Meta:
        ''' Model metadata. '''
        verbose_name = 'Конституета'
        verbose_name_plural = 'Конституенты'

    def get_absolute_url(self):
        ''' URL access. '''
        return reverse('constituenta-detail', kwargs={'pk': self.pk})

    def __str__(self) -> str:
        return f'{self.alias}'

    def set_term_resolved(self, new_term: str):
        ''' Set term and reset forms if needed. '''
        if new_term == self.term_resolved:
            return
        self.term_resolved = new_term
        self.term_forms = []

class PyConceptAdapter:
    ''' RSForm adapter for interacting with pyconcept module. '''
    def __init__(self, instance: RSForm):
        self.schema = instance
        self.data = self._prepare_request()
        self._checked_data: Optional[dict] = None

    def basic(self) -> dict:
        ''' Check RSForm and return check results.
            Warning! Does not include texts. '''
        self._produce_response()
        if self._checked_data is None:
            raise ValueError('Invalid data response from pyconcept')
        return self._checked_data

    def full(self) -> dict:
        ''' Check RSForm and return check results including initial texts. '''
        self._produce_response()
        if self._checked_data is None:
            raise ValueError('Invalid data response from pyconcept')
        return self._complete_rsform_details(self._checked_data)

    def _complete_rsform_details(self, data: dict) -> dict:
        result = deepcopy(data)
        result['id'] = self.schema.pk
        result['alias'] = self.schema.alias
        result['title'] = self.schema.title
        result['comment'] = self.schema.comment
        result['time_update'] = self.schema.time_update
        result['time_create'] = self.schema.time_create
        result['is_common'] = self.schema.is_common
        result['owner'] = (self.schema.owner.pk if self.schema.owner is not None else None)
        for cst_data in result['items']:
            cst = Constituenta.objects.get(pk=cst_data['id'])
            cst_data['convention'] = cst.convention
            cst_data['term'] = {
                'raw': cst.term_raw,
                'resolved': cst.term_resolved,
                'forms': cst.term_forms
            }
            cst_data['definition']['text'] = {
                'raw': cst.definition_raw,
                'resolved': cst.definition_resolved,
            }
        return result

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
