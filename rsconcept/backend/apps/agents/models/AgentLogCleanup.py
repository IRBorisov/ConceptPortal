''' Remembers when expired agent logs were last deleted. One row, shared by all workers. '''
from django.db import models


class AgentLogCleanup(models.Model):
    ''' Singleton schedule for agent log retention. '''
    last_run_at = models.DateTimeField(
        verbose_name='Последняя очистка',
        null=True,
        blank=True
    )

    class Meta:
        ''' Model metadata. '''
        verbose_name = 'Очистка журнала агентов'
        verbose_name_plural = 'Очистка журнала агентов'

    def __str__(self) -> str:
        return f'cleanup:{self.last_run_at}'
