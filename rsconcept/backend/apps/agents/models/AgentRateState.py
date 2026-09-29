''' Per-user counters for agent API quotas. '''
from django.db import models

from apps.users.models import User


class AgentRateState(models.Model):
    ''' One row per user. All of that user's API keys share these counters. '''
    user = models.OneToOneField(
        verbose_name='Пользователь',
        to=User,
        on_delete=models.CASCADE,
        related_name='agent_rate_state'
    )
    read_window_started_at = models.DateTimeField(
        verbose_name='Начало окна чтения',
        null=True,
        blank=True
    )
    read_count = models.PositiveIntegerField(
        verbose_name='Чтений в окне',
        default=0
    )
    write_window_started_at = models.DateTimeField(
        verbose_name='Начало окна правок',
        null=True,
        blank=True
    )
    write_count = models.PositiveIntegerField(
        verbose_name='Правок в минуту',
        default=0
    )
    write_hour_started_at = models.DateTimeField(
        verbose_name='Начало часового окна правок',
        null=True,
        blank=True
    )
    write_hour_count = models.PositiveIntegerField(
        verbose_name='Правок в час',
        default=0
    )
    heavy_hour_started_at = models.DateTimeField(
        verbose_name='Начало окна тяжёлых правок',
        null=True,
        blank=True
    )
    heavy_hour_count = models.PositiveIntegerField(
        verbose_name='Тяжёлых правок в час',
        default=0
    )

    class Meta:
        ''' Model metadata. '''
        verbose_name = 'Лимит вызовов агента'
        verbose_name_plural = 'Лимиты вызовов агентов'

    def __str__(self) -> str:
        return f'quota:{self.user_id}'
