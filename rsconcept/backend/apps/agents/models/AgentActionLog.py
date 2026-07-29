''' Model: audit log for /api/agents mutating actions. '''
from django.db import models

from apps.users.models import User

from .ApiKey import ApiKey


class AgentActionLog(models.Model):
    ''' One logged agent API action. '''
    user = models.ForeignKey(
        verbose_name='Пользователь',
        to=User,
        on_delete=models.CASCADE,
        related_name='agent_action_logs'
    )
    api_key = models.ForeignKey(
        verbose_name='API-ключ',
        to=ApiKey,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='action_logs'
    )
    key_label = models.CharField(
        verbose_name='Название ключа',
        max_length=100,
        blank=True,
        default=''
    )
    key_prefix = models.CharField(
        verbose_name='Префикс ключа',
        max_length=16,
        blank=True,
        default=''
    )
    action = models.CharField(
        verbose_name='Действие',
        max_length=64,
        db_index=True
    )
    item_id = models.IntegerField(
        verbose_name='ID объекта',
        null=True,
        blank=True,
        db_index=True
    )
    item_alias = models.CharField(
        verbose_name='Шифр объекта',
        max_length=64,
        blank=True,
        default=''
    )
    item_title = models.CharField(
        verbose_name='Название объекта',
        max_length=255,
        blank=True,
        default=''
    )
    status_code = models.PositiveSmallIntegerField(
        verbose_name='HTTP-статус',
        default=200
    )
    summary = models.CharField(
        verbose_name='Кратко',
        max_length=500,
        blank=True,
        default=''
    )
    created_at = models.DateTimeField(
        verbose_name='Время',
        auto_now_add=True,
        db_index=True
    )

    class Meta:
        verbose_name = 'Журнал действий агента'
        verbose_name_plural = 'Журнал действий агентов'
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f'{self.action} @{self.created_at:%Y-%m-%d %H:%M}'
