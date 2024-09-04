''' Models: Operation Argument in OSS. '''
from django.db.models import CASCADE, ForeignKey, Model, PositiveIntegerField


class Argument(Model):
    ''' Operation Argument.'''
    operation: ForeignKey = ForeignKey(
        verbose_name='Операция',
        to='oss.Operation',
        on_delete=CASCADE,
        related_name='arguments'
    )
    argument: ForeignKey = ForeignKey(
        verbose_name='Аргумент',
        to='oss.Operation',
        on_delete=CASCADE,
        related_name='descendants'
    )
    order: PositiveIntegerField = PositiveIntegerField(
        verbose_name='Позиция',
        default=0,
    )

    class Meta:
        ''' Model metadata. '''
        verbose_name = 'Аргумент'
        verbose_name_plural = 'Аргументы операций'
        unique_together = [['operation', 'argument']]

    def __str__(self) -> str:
        return f'{self.argument} -> {self.operation}'
