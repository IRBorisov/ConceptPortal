''' Models: Operation Argument in OSS. '''
from django.db.models import CASCADE, ForeignKey, Model


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

    class Meta:
        ''' Model metadata. '''
        verbose_name = 'Аргумент'
        verbose_name_plural = 'Аргументы операций'
        unique_together = [['operation', 'argument']]

    def __str__(self) -> str:
        return f'{self.argument} -> {self.operation}'
