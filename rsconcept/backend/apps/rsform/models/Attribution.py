''' Models: Attribution of nominal constituents. '''
from django.db.models import CASCADE, ForeignKey, Model


class Attribution(Model):
    ''' Attribution links nominal constituent to its content.'''
    container = ForeignKey(
        verbose_name='Составная конституента',
        to='rsform.Constituenta',
        on_delete=CASCADE,
        related_name='as_container'
    )
    attribute = ForeignKey(
        verbose_name='Атрибутирующая конституента',
        to='rsform.Constituenta',
        on_delete=CASCADE,
        related_name='as_attribute'
    )

    class Meta:
        ''' Model metadata. '''
        verbose_name = 'Атрибутирование конституент'
        verbose_name_plural = 'Атрибутирования конституент'
        unique_together = [['container', 'attribute']]


    def __str__(self) -> str:
        return f'{self.container} -> {self.attribute}'
