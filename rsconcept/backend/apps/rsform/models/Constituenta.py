''' Models: Constituenta. '''
import re

from django.core.validators import MinValueValidator
from django.db.models import (
    CASCADE,
    CharField,
    ForeignKey,
    JSONField,
    Model,
    PositiveIntegerField,
    TextChoices,
    TextField
)

from ..utils import apply_pattern

_REF_ENTITY_PATTERN = re.compile(r'@{([^0-9\-].*?)\|.*?}')
_GLOBAL_ID_PATTERN = re.compile(r'([XCSADFPT][0-9]+)')  # cspell:disable-line


class CstType(TextChoices):
    ''' Type of constituenta. '''
    BASE = 'basic'
    CONSTANT = 'constant'
    STRUCTURED = 'structure'
    AXIOM = 'axiom'
    TERM = 'term'
    FUNCTION = 'function'
    PREDICATE = 'predicate'
    THEOREM = 'theorem'


class Constituenta(Model):
    ''' Constituenta is the base unit for every conceptual schema. '''
    schema: ForeignKey = ForeignKey(
        verbose_name='Концептуальная схема',
        to='library.LibraryItem',
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
        default=list
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

    def __str__(self) -> str:
        return f'{self.alias}'

    def set_term_resolved(self, new_term: str):
        ''' Set term and reset forms if needed. '''
        self.term_resolved = new_term
        self.term_forms = []

    def apply_mapping(self, mapping: dict[str, str], change_aliases: bool = False):
        modified = False
        if change_aliases and self.alias in mapping:
            modified = True
            self.alias = mapping[self.alias]
        expression = apply_pattern(self.definition_formal, mapping, _GLOBAL_ID_PATTERN)
        if expression != self.definition_formal:
            modified = True
            self.definition_formal = expression
        term = apply_pattern(self.term_raw, mapping, _REF_ENTITY_PATTERN)
        if term != self.term_raw:
            modified = True
            self.term_raw = term
        definition = apply_pattern(self.definition_raw, mapping, _REF_ENTITY_PATTERN)
        if definition != self.definition_raw:
            modified = True
            self.definition_raw = definition
        return modified
