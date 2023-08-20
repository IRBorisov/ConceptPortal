''' Models: RSForms for conceptual schemas. '''
import json
from typing import Optional
import pyconcept
from django.db import transaction
from django.db.models import (
    CASCADE, SET_NULL, ForeignKey, Model, PositiveIntegerField, QuerySet,
    TextChoices, TextField, BooleanField, CharField, DateTimeField, JSONField
)
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
from django.urls import reverse
from apps.users.models import User
from cctext import Resolver, Entity


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
    def on_term_change(self, alias: str):
        ''' Trigger cascade resolutions when term changes. '''
        pass
    #     void Thesaurus::OnTermChange(const EntityUID target) {
	# auto expansion = TermGraph().ExpandOutputs({ target });
	# const auto ordered = TermGraph().Sort(expansion);
	# for (const auto entity : ordered) {
	# 	storage.at(entity).term.UpdateFrom(Context());
	# }
	# expansion = DefGraph().ExpandOutputs(expansion);
	# for (const auto entity : expansion) {
	# 	storage.at(entity).definition.UpdateFrom(Context());
	# }


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
        self._update_from_core()
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
        self._update_from_core()
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
        self._update_from_core()
        self.save()

    @transaction.atomic
    def delete_cst(self, listCst):
        ''' Delete multiple constituents. Do not check if listCst are from this schema '''
        for cst in listCst:
            cst.delete()
        self._update_from_core()
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
            cst.term_resolved = resolver.resolve(cst.term_raw)
        cst.definition_raw = data.get('definition_raw', '')
        if cst.definition_raw != '':
            cst.definition_resolved = resolver.resolve(cst.definition_raw)
        cst.save()
        self.on_term_change(cst.alias)
        return cst

    def _insert_new(self, data: dict, insert_after: Optional[str]=None) -> 'Constituenta':
        if insert_after is not None:
            cstafter = Constituenta.objects.get(pk=insert_after)
            return self.insert_at(cstafter.order + 1, data['alias'], data['cst_type'])
        else:
            return self.insert_last(data['alias'], data['cst_type'])

    @transaction.atomic
    def load_trs(self, data: dict, sync_metadata: bool, skip_update: bool):
        if sync_metadata:
            self.title = data.get('title', 'Без названия')
            self.alias = data.get('alias', '')
            self.comment = data.get('comment', '')
        order = 1
        prev_constituents = self.constituents()
        loaded_ids = set()
        for cst_data in data['items']:
            uid = int(cst_data['entityUID'])
            if prev_constituents.filter(pk=uid).exists():
                cst: Constituenta = prev_constituents.get(pk=uid)
                cst.order = order
                cst.load_trs(cst_data)
                cst.save()
            else:
                cst = Constituenta.create_from_trs(cst_data, self, order)
                cst.save()
                uid = cst.pk
            loaded_ids.add(uid)
            order += 1
        for prev_cst in prev_constituents:
            if prev_cst.pk not in loaded_ids:
                prev_cst.delete()
        if not skip_update:
            self._update_from_core()
        self.save()

    @staticmethod
    @transaction.atomic
    def create_from_trs(owner: User, data: dict, is_common: bool = True) -> 'RSForm':
        schema = RSForm.objects.create(
            title=data.get('title', 'Без названия'),
            owner=owner,
            alias=data.get('alias', ''),
            comment=data.get('comment', ''),
            is_common=is_common
        )
        # pylint: disable=protected-access
        schema._create_items_from_trs(data['items'])
        return schema

    def to_trs(self) -> dict:
        ''' Generate JSON string containing all data from RSForm '''
        result = self._prepare_json_rsform()
        items = self.constituents().order_by('order')
        for cst in items:
            result['items'].append(cst.to_trs())
        return result

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse('rsform-detail', kwargs={'pk': self.pk})

    def _prepare_json_rsform(self: 'RSForm') -> dict:
        return {
            'type': 'rsform',
            'title': self.title,
            'alias': self.alias,
            'comment': self.comment,
            'items': []
        }

    @transaction.atomic
    def _update_from_core(self):
        # TODO: resolve text refs
        checked = json.loads(pyconcept.check_schema(json.dumps(self.to_trs())))
        update_list = self.constituents().only('id', 'order')
        if len(checked['items']) != update_list.count():
            raise ValidationError('Invalid constituents count')
        order = 1
        for cst in checked['items']:
            cst_id = cst['entityUID']
            for oldCst in update_list:
                if oldCst.pk == cst_id:
                    oldCst.order = order
                    order += 1
                    break
        Constituenta.objects.bulk_update(update_list, ['order'])

    @transaction.atomic
    def _create_items_from_trs(self, items):
        order = 1
        for cst in items:
            cst_object = Constituenta.create_from_trs(cst, self, order)
            cst_object.save()
            order += 1


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
        return reverse('constituenta-detail', kwargs={'pk': self.pk})

    def __str__(self):
        return self.alias

    @staticmethod
    def create_from_trs(data: dict, schema: RSForm, order: int) -> 'Constituenta':
        ''' Create constituenta from TRS json '''
        cst = Constituenta(
            alias=data['alias'],
            schema=schema,
            order=order,
            cst_type=data['cstType'],
        )
        # pylint: disable=protected-access
        cst._load_texts(data)
        return cst

    def load_trs(self, data: dict):
        ''' Load data from TRS json '''
        self.alias = data['alias']
        self.cst_type = data['cstType']
        self._load_texts(data)

    def _load_texts(self, data: dict):
        self.convention = data.get('convention', '')
        if 'definition' in data:
            self.definition_formal = data['definition'].get('formal', '')
            if 'text' in data['definition']:
                self.definition_raw = data['definition']['text'].get('raw', '')
                self.definition_resolved = data['definition']['text'].get('resolved', '')
            else:
                self.definition_raw = ''
                self.definition_resolved = ''
        if 'term' in data:
            self.term_raw = data['term'].get('raw', '')
            self.term_resolved = data['term'].get('resolved', '')
            self.term_forms = data['term'].get('forms', [])
        else:
            self.term_raw = ''
            self.term_resolved = ''
            self.term_forms = []

    def to_trs(self) -> dict:
        return {
            'entityUID': self.pk,
            'type': 'constituenta',
            'cstType': self.cst_type,
            'alias': self.alias,
            'convention': self.convention,
            'term': {
                'raw': self.term_raw,
                'resolved': self.term_resolved,
                'forms': self.term_forms,
            },
            'definition': {
                'formal': self.definition_formal,
                'text': {
                    'raw': self.definition_raw,
                    'resolved': self.definition_resolved,
                },
            },
        }
