''' Models: Operation in OSS. '''
from django.db.models import (
    CASCADE,
    SET_NULL,
    CharField,
    FloatField,
    ForeignKey,
    Model,
    TextChoices,
    TextField
)


class OperationType(TextChoices):
    ''' Type of operation. '''
    INPUT = 'input'
    SYNTHESIS = 'synthesis'


class Operation(Model):
    ''' Operational schema Unit.'''
    oss: ForeignKey = ForeignKey(
        verbose_name='Схема синтеза',
        to='oss.OperationSchema',
        on_delete=CASCADE,
        related_name='items'
    )
    operation_type: CharField = CharField(
        verbose_name='Тип',
        max_length=10,
        choices=OperationType.choices,
        default=OperationType.INPUT
    )
    result: ForeignKey = ForeignKey(
        verbose_name='Связанная КС',
        to='rsform.LibraryItem',
        null=True,
        on_delete=SET_NULL,
        related_name='producer'
    )

    alias: CharField = CharField(
        verbose_name='Шифр',
        max_length=255,
        blank=True
    )
    title: TextField = TextField(
        verbose_name='Название',
        blank=True
    )
    comment: TextField = TextField(
        verbose_name='Комментарий',
        blank=True
    )

    position_x: FloatField = FloatField(
        verbose_name='Положение по горизонтали',
        default=0
    )
    position_y: FloatField = FloatField(
        verbose_name='Положение по вертикали',
        default=0
    )

    class Meta:
        ''' Model metadata. '''
        verbose_name = 'Операция'
        verbose_name_plural = 'Операции'

    def __str__(self) -> str:
        return f'Операция {self.alias}'
