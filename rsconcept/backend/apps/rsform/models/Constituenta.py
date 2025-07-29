''' Models: Constituenta. '''
import re

from cctext import extract_entities
from django.db.models import (
    CASCADE,
    BooleanField,
    CharField,
    ForeignKey,
    JSONField,
    Model,
    PositiveIntegerField,
    TextChoices,
    TextField
)

from ..utils import apply_pattern

_RE_GLOBALS = r'[XCSADFPT]\d+'  # cspell:disable-line
_REF_ENTITY_PATTERN = re.compile(r'@{([^0-9\-].*?)\|.*?}')
_GLOBAL_ID_PATTERN = re.compile(r'([XCSADFPT][0-9]+)')  # cspell:disable-line


def extract_globals(expression: str) -> set[str]:
    ''' Extract all global aliases from expression. '''
    return set(re.findall(_RE_GLOBALS, expression))


def replace_globals(expression: str, mapping: dict[str, str]) -> str:
    ''' Replace all global aliases in expression. '''
    return apply_pattern(expression, mapping, _GLOBAL_ID_PATTERN)


def replace_entities(expression: str, mapping: dict[str, str]) -> str:
    ''' Replace all entity references in expression. '''
    return apply_pattern(expression, mapping, _REF_ENTITY_PATTERN)


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
    schema = ForeignKey(
        verbose_name='Концептуальная схема',
        to='library.LibraryItem',
        on_delete=CASCADE
    )
    order = PositiveIntegerField(
        verbose_name='Позиция',
        default=0,
    )
    alias = CharField(
        verbose_name='Имя',
        max_length=8,
        default='undefined'
    )
    cst_type = CharField(
        verbose_name='Тип',
        max_length=10,
        choices=CstType.choices,
        default=CstType.BASE
    )
    convention = TextField(
        verbose_name='Комментарий/Конвенция',
        default='',
        blank=True
    )
    term_raw = TextField(
        verbose_name='Термин (с отсылками)',
        default='',
        blank=True
    )
    term_resolved = TextField(
        verbose_name='Термин',
        default='',
        blank=True
    )
    term_forms = JSONField(
        verbose_name='Словоформы',
        default=list
    )
    definition_formal = TextField(
        verbose_name='Родоструктурное определение',
        default='',
        blank=True
    )
    definition_raw = TextField(
        verbose_name='Текстовое определение (с отсылками)',
        default='',
        blank=True
    )
    definition_resolved = TextField(
        verbose_name='Текстовое определение',
        default='',
        blank=True
    )
    crucial = BooleanField(
        verbose_name='Ключевая',
        default=False
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
        expression = replace_globals(self.definition_formal, mapping)
        if expression != self.definition_formal:
            modified = True
            self.definition_formal = expression
        term = replace_entities(self.term_raw, mapping)
        if term != self.term_raw:
            modified = True
            self.term_raw = term
        definition = replace_entities(self.definition_raw, mapping)
        if definition != self.definition_raw:
            modified = True
            self.definition_raw = definition
        return modified

    def extract_references(self) -> set[str]:
        ''' Extract all references from term and definition. '''
        result: set[str] = extract_globals(self.definition_formal)
        result.update(extract_entities(self.term_raw))
        result.update(extract_entities(self.definition_raw))
        return result
