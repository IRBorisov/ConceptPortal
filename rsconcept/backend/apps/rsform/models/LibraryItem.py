''' Models: LibraryItem. '''
from django.db import transaction
from django.db.models import (
    SET_NULL, ForeignKey, Model,
    TextChoices, TextField, BooleanField, CharField, DateTimeField
)

from apps.users.models import User
from .Version import Version
from .Subscription import Subscription


class LibraryItemType(TextChoices):
    ''' Type of library items '''
    RSFORM = 'rsform'
    OPERATIONS_SCHEMA = 'oss'


class LibraryItem(Model):
    ''' Abstract library item.'''
    item_type: CharField = CharField(
        verbose_name='Тип',
        max_length=50,
        choices=LibraryItemType.choices
    )
    owner: ForeignKey = ForeignKey(
        verbose_name='Владелец',
        to=User,
        on_delete=SET_NULL,
        null=True
    )
    title: TextField = TextField(
        verbose_name='Название'
    )
    alias: CharField = CharField(
        verbose_name='Шифр',
        max_length=255,
        blank=True
    )
    comment: TextField = TextField(
        verbose_name='Комментарий',
        blank=True
    )
    is_common: BooleanField = BooleanField(
        verbose_name='Общая',
        default=False
    )
    is_canonical: BooleanField = BooleanField(
        verbose_name='Каноничная',
        default=False
    )
    time_create: DateTimeField = DateTimeField(
        verbose_name='Дата создания',
        auto_now_add=True
    )
    time_update: DateTimeField = DateTimeField(
        verbose_name='Дата изменения',
        auto_now=True
    )

    class Meta:
        ''' Model metadata. '''
        verbose_name = 'Схема'
        verbose_name_plural = 'Схемы'

    def __str__(self) -> str:
        return f'{self.title}'

    def get_absolute_url(self):
        return f'/api/library/{self.pk}'

    def subscribers(self) -> list[Subscription]:
        ''' Get all subscribers for this item. '''
        return [subscription.user for subscription in Subscription.objects.filter(item=self.pk)]

    def versions(self) -> list[Version]:
        ''' Get all Versions of this item. '''
        return list(Version.objects.filter(item=self.pk).order_by('-time_create'))

    @transaction.atomic
    def save(self, *args, **kwargs):
        subscribe = not self.pk and self.owner
        super().save(*args, **kwargs)
        if subscribe:
            Subscription.subscribe(user=self.owner, item=self)
