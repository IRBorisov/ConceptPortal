''' Models: Constituenta. '''
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

from ..utils import extract_globals, extract_entities, replace_entities, replace_globals


class CstType(TextChoices):
    ''' Type of constituenta. '''
    NOMINAL = 'nominal'
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
