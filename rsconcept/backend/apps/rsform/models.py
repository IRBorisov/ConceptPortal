import json
from django.db import models, transaction
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
from apps.users.models import User

import pyconcept


class CstType(models.TextChoices):
    ''' Type of constituenta '''
    BASE = 'basic'
    CONSTANT = 'constant'
    STRUCTURED = 'structure'
    AXIOM = 'axiom'
    TERM = 'term'
    FUNCTION = 'function'
    PREDICATE = 'predicate'
    THEOREM = 'theorem'


class Syntax(models.TextChoices):
    ''' Syntax types '''
    UNDEF = 'undefined'
    ASCII = 'ascii'
    MATH = 'math'


def _empty_term():
    return {'raw': '', 'resolved': '', 'forms': []}


def _empty_definition():
    return {'raw': '', 'resolved': ''}


class RSForm(models.Model):
    ''' RSForm is a math form of capturing conceptual schema '''
    owner = models.ForeignKey(
        verbose_name='Владелец',
        to=User,
        on_delete=models.SET_NULL,
        null=True
    )
    title = models.TextField(
        verbose_name='Название'
    )
    alias = models.CharField(
        verbose_name='Шифр',
        max_length=255,
        blank=True
    )
    comment = models.TextField(
        verbose_name='Комментарий',
        blank=True
    )
    is_common = models.BooleanField(
        verbose_name='Общая',
        default=False
    )
    time_create = models.DateTimeField(
        verbose_name='Дата создания',
        auto_now_add=True
    )
    time_update = models.DateTimeField(
        verbose_name='Дата изменения',
        auto_now=True
    )

    class Meta:
        verbose_name = 'Схема'
        verbose_name_plural = 'Схемы'

    def constituents(self) -> models.QuerySet:
        ''' Get QuerySet containing all constituents of current RSForm '''
        return Constituenta.objects.filter(schema=self)

    @transaction.atomic
    def insert_at(self, position: int, alias: str, type: CstType) -> 'Constituenta':
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
            csttype=type
        )
        self._recreate_order()
        self.save()
        return Constituenta.objects.get(pk=result.pk)

    @transaction.atomic
    def insert_last(self, alias: str, type: CstType) -> 'Constituenta':
        ''' Insert new constituenta at last position '''
        position = 1
        if self.constituents().exists():
            position += self.constituents().only('order').aggregate(models.Max('order'))['order__max']
        result = Constituenta.objects.create(
            schema=self,
            order=position,
            alias=alias,
            csttype=type
        )
        self._recreate_order()
        self.save()
        return Constituenta.objects.get(pk=result.pk)

    @transaction.atomic
    def delete_cst(self, listCst):
        ''' Delete multiple constituents. Do not check if listCst are from this schema '''
        for cst in listCst:
            cst.delete()
        self._recreate_order()
        self.save()

    @staticmethod
    @transaction.atomic
    def import_json(owner: User, data: dict, is_common: bool = True) -> 'RSForm':
        schema = RSForm.objects.create(
            title=data.get('title', 'Без названия'),
            owner=owner,
            alias=data.get('alias', ''),
            comment=data.get('comment', ''),
            is_common=is_common
        )
        schema._create_cst_from_json(data['items'])
        return schema

    def to_json(self) -> str:
        ''' Generate JSON string containing all data from RSForm '''
        result = self._prepare_json_rsform()
        items = self.constituents().order_by('order')
        for cst in items:
            result['items'].append(cst.to_json())
        return result

    def __str__(self):
        return self.title

    def _prepare_json_rsform(self: 'Constituenta') -> dict:
        return {
            'type': 'rsform',
            'title': self.title,
            'alias': self.alias,
            'comment': self.comment,
            'items': []
        }

    def _recreate_order(self):
        checked = json.loads(pyconcept.check_schema(json.dumps(self.to_json())))
        update_list = self.constituents().only('id', 'order')
        if (len(checked['items']) != update_list.count()):
            raise ValidationError
        order = 1
        for cst in checked['items']:
            id = cst['entityUID']
            for oldCst in update_list:
                if oldCst.id == id:
                    oldCst.order = order
                    order += 1
                    break
        Constituenta.objects.bulk_update(update_list, ['order'])

    def _create_cst_from_json(self, items):
        order = 1
        for cst in items:
            # TODO: get rid of empty_term etc. Use None instead
            Constituenta.objects.create(
                alias=cst['alias'],
                schema=self,
                order=order,
                csttype=cst['cstType'],
                convention=cst.get('convention', 'Без названия'),
                definition_formal=cst['definition'].get('formal', '') if 'definition' in cst else '',
                term=cst.get('term', _empty_term()),
                definition_text=cst['definition']['text'] \
                if 'definition' in cst and 'text' in cst['definition'] else _empty_definition()  # noqa: E502
            )
            order += 1


class Constituenta(models.Model):
    ''' Constituenta is the base unit for every conceptual schema '''
    schema = models.ForeignKey(
        verbose_name='Концептуальная схема',
        to=RSForm,
        on_delete=models.CASCADE
    )
    order = models.PositiveIntegerField(
        verbose_name='Позиция',
        validators=[MinValueValidator(1)]
    )
    alias = models.CharField(
        verbose_name='Имя',
        max_length=8
    )
    csttype = models.CharField(
        verbose_name='Тип',
        max_length=10,
        choices=CstType.choices,
        default=CstType.BASE
    )
    convention = models.TextField(
        verbose_name='Комментарий/Конвенция',
        default='',
        blank=True
    )
    term = models.JSONField(
        verbose_name='Термин',
        default=_empty_term
    )
    definition_formal = models.TextField(
        verbose_name='Родоструктурное определение',
        default='',
        blank=True
    )
    definition_text = models.JSONField(
        verbose_name='Текстовое определние',
        default=_empty_definition,
        blank=True
    )

    class Meta:
        verbose_name = 'Конституета'
        verbose_name_plural = 'Конституенты'

    def __str__(self):
        return self.alias

    def to_json(self) -> str:
        return {
            'entityUID': self.id,
            'type': 'constituenta',
            'cstType': self.csttype,
            'alias': self.alias,
            'convention': self.convention,
            'term': self.term,
            'definition': {
                'formal': self.definition_formal,
                'text': self.definition_text
            }
        }
