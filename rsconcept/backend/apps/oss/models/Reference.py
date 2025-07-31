''' Models: Operation Reference in OSS. '''
from django.db.models import CASCADE, ForeignKey, Model


class Reference(Model):
    ''' Operation Reference. '''
    reference = ForeignKey(
        verbose_name='Отсылка',
        to='oss.Operation',
        on_delete=CASCADE,
        related_name='references'
    )
    target = ForeignKey(
        verbose_name='Целевая Операция',
        to='oss.Operation',
        on_delete=CASCADE,
        related_name='targets'
    )

    class Meta:
        ''' Model metadata. '''
        verbose_name = 'Отсылка'
        verbose_name_plural = 'Отсылки'
        unique_together = [['reference', 'target']]

    def __str__(self) -> str:
        return f'{self.reference} -> {self.target}'
