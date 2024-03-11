''' Models: Constituenta. '''
from django.db.models import (
    CASCADE, ForeignKey, Model, PositiveIntegerField,
    TextChoices, TextField, CharField, JSONField
)
from django.core.validators import MinValueValidator
from django.urls import reverse


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


def _empty_forms():
    return []


class Constituenta(Model):
    ''' Constituenta is the base unit for every conceptual schema '''
    schema: ForeignKey = ForeignKey(
        verbose_name='Концептуальная схема',
        to='rsform.LibraryItem',
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
        verbose_name='Текстовое определение (с отсылками)',
        default='',
        blank=True
    )
    definition_resolved: TextField = TextField(
        verbose_name='Текстовое определение',
        default='',
        blank=True
    )

    class Meta:
        ''' Model metadata. '''
        verbose_name = 'Конституента'
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
