''' Models: Synthesis Inheritance. '''
from django.db.models import CASCADE, ForeignKey, Model


class Inheritance(Model):
    ''' Inheritance links parent and child constituents in synthesis operation.'''
    operation: ForeignKey = ForeignKey(
        verbose_name='Операция',
        to='oss.Operation',
        on_delete=CASCADE,
        related_name='inheritances'
    )
    parent: ForeignKey = ForeignKey(
        verbose_name='Исходная конституента',
        to='rsform.Constituenta',
        on_delete=CASCADE,
        related_name='as_parent'
    )
    child: ForeignKey = ForeignKey(
        verbose_name='Наследованная конституента',
        to='rsform.Constituenta',
        on_delete=CASCADE,
        related_name='as_child'
    )

    class Meta:
        ''' Model metadata. '''
        verbose_name = 'Наследование синтеза'
        verbose_name_plural = 'Отношение наследования конституент'
        unique_together = [['parent', 'child']]


    def __str__(self) -> str:
        return f'{self.parent} -> {self.child}'
