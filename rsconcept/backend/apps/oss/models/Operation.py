''' Models: Operation in OSS. '''
# pylint: disable=duplicate-code
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

from .Argument import Argument
from .Substitution import Substitution


class OperationType(TextChoices):
    ''' Type of operation. '''
    INPUT = 'input'
    SYNTHESIS = 'synthesis'


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
        ''' Operation arguments. '''
        return Argument.objects.filter(operation=self)

    def getQ_substitutions(self) -> QuerySet[Substitution]:
        ''' Operation substitutions. '''
        return Substitution.objects.filter(operation=self)
