''' Models: Operation in OSS. '''
# pylint: disable=duplicate-code
from typing import Optional

from django.db.models import (
    CASCADE,
    SET_NULL,
    CharField,
    ForeignKey,
    Model,
    QuerySet,
    TextChoices,
    TextField
)

from apps.library.models import LibraryItem

from .Argument import Argument
from .Reference import Reference
from .Substitution import Substitution


class OperationType(TextChoices):
    ''' Type of operation. '''
    INPUT = 'input'
    SYNTHESIS = 'synthesis'
    REFERENCE = 'reference'


class Operation(Model):
    ''' Operational schema Unit.'''
    oss = ForeignKey(
        verbose_name='Схема синтеза',
        to='library.LibraryItem',
        on_delete=CASCADE,
        related_name='operations'
    )
    operation_type = CharField(
        verbose_name='Тип',
        max_length=10,
        choices=OperationType.choices,
        default=OperationType.INPUT
    )
    result = ForeignKey(
        verbose_name='Связанная КС',
        to='library.LibraryItem',
        blank=True,
        null=True,
        on_delete=SET_NULL,
        related_name='producer'
    )

    parent = ForeignKey(
        verbose_name='Содержащий блок',
        to='oss.Block',
        blank=True,
        null=True,
        on_delete=SET_NULL,
        related_name='as_child_operation'
    )

    alias = CharField(
        verbose_name='Шифр',
        max_length=255,
        blank=True
    )
    title = TextField(
        verbose_name='Название',
        blank=True
    )
    description = TextField(
        verbose_name='Описание',
        blank=True
    )

    class Meta:
        ''' Model metadata. '''
        verbose_name = 'Операция'
        verbose_name_plural = 'Операции'

    def __str__(self) -> str:
        return f'Операция {self.alias}'

    def getQ_arguments(self) -> QuerySet[Argument]:
        ''' Operation Arguments for current operation. '''
        return Argument.objects.filter(operation=self)

    def getQ_as_argument(self) -> QuerySet[Argument]:
        ''' Operation Arguments where the operation is used as an argument. '''
        return Argument.objects.filter(argument=self)

    def getQ_substitutions(self) -> QuerySet[Substitution]:
        ''' Operation substitutions. '''
        return Substitution.objects.filter(operation=self)

    def getQ_references(self) -> QuerySet[Reference]:
        ''' Operation references. '''
        return Reference.objects.filter(target=self)

    def getQ_reference_target(self) -> list['Operation']:
        ''' Operation target for current reference. '''
        return [x.target for x in Reference.objects.filter(reference=self)]

    def setQ_result(self, result: Optional[LibraryItem]) -> None:
        ''' Set result schema. '''
        if result == self.result:
            return
        self.result = result
        self.save(update_fields=['result'])
        for reference in self.getQ_references():
            reference.reference.result = result
            reference.reference.save(update_fields=['result'])

    def delete(self, *args, **kwargs):
        ''' Delete operation. '''
        for ref in self.getQ_references():
            ref.reference.delete()
        super().delete(*args, **kwargs)
