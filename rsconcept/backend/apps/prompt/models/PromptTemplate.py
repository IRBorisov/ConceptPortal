''' Model: PromptTemplate for AI prompt storage and sharing. '''

from django.db import models

from apps.users.models import User


class PromptTemplate(models.Model):
    '''Represents an AI prompt template, which can be user-owned or shared globally.'''
    owner = models.ForeignKey(
        verbose_name='Владелец',
        to=User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='prompt_templates'
    )
    is_shared = models.BooleanField(
        verbose_name='Общий доступ',
        default=False
    )
    label = models.CharField(
        verbose_name='Название',
        max_length=255
    )
    description = models.TextField(
        verbose_name='Описание',
        blank=True
    )
    text = models.TextField(
        verbose_name='Содержание',
        blank=True
    )

    def can_set_shared(self, user: User) -> bool:
        '''Return True if the user can set is_shared=True (admin/staff only).'''
        return user.is_superuser or user.is_staff

    def can_access(self, user: User) -> bool:
        '''Return True if the user can access this template (shared or owner).'''
        if self.is_shared:
            return True
        return self.owner == user

    def __str__(self) -> str:
        return f'{self.label}'
