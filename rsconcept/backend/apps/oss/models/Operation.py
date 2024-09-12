''' Models: Operation in OSS. '''
from django.db.models import (
    CASCADE,
    SET_NULL,
    CharField,
    FloatField,
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

    alias = CharField(
        verbose_name='Шифр',
        max_length=255,
        blank=True
    )
    title = TextField(
        verbose_name='Название',
        blank=True
    )
    comment = TextField(
        verbose_name='Комментарий',
        blank=True
    )

    position_x = FloatField(
        verbose_name='Положение по горизонтали',
        default=0
    )
    position_y = FloatField(
        verbose_name='Положение по вертикали',
        default=0
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
