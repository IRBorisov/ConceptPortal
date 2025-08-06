''' Models: Operation Replica in OSS. '''
from django.db.models import CASCADE, ForeignKey, Model


class Replica(Model):
    ''' Operation Replica. '''
    replica = ForeignKey(
        verbose_name='Реплика',
        to='oss.Operation',
        on_delete=CASCADE,
        related_name='replicas'
    )
    original = ForeignKey(
        verbose_name='Целевая Операция',
        to='oss.Operation',
        on_delete=CASCADE,
        related_name='targets'
    )

    class Meta:
        ''' Model metadata. '''
        verbose_name = 'Реплика'
        verbose_name_plural = 'Реплики'
        unique_together = [['replica', 'original']]

    def __str__(self) -> str:
        return f'{self.replica} -> {self.original}'
