''' Models: LibraryItem. '''
import re

from django.db import transaction
from django.db.models import (
    SET_NULL,
    BooleanField,
    CharField,
    DateTimeField,
    ForeignKey,
    Model,
    QuerySet,
    TextChoices,
    TextField
)

from apps.users.models import User

from .Editor import Editor
from .Subscription import Subscription
from .Version import Version


class LibraryItemType(TextChoices):
    ''' Type of library items '''
    RSFORM = 'rsform'
    OPERATION_SCHEMA = 'oss'


class AccessPolicy(TextChoices):
    ''' Type of item access policy. '''
    PUBLIC = 'public'
    PROTECTED = 'protected'
    PRIVATE = 'private'


class LocationHead(TextChoices):
    ''' Location prefixes. '''
    PROJECTS = '/P'
    LIBRARY = '/L'
    USER = '/U'
    COMMON = '/S'


_RE_LOCATION = r'^/[PLUS]((/[!\d\w]([!\d\w\- ]*[!\d\w])?)*)?$'  # cspell:disable-line


def validate_location(target: str) -> bool:
    return bool(re.search(_RE_LOCATION, target))


class LibraryItem(Model):
    ''' Abstract library item.'''
    item_type: CharField = CharField(
        verbose_name='Тип',
        max_length=50,
        choices=LibraryItemType.choices,
        default=LibraryItemType.RSFORM
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
    visible: BooleanField = BooleanField(
        verbose_name='Отображаемая',
        default=True
    )
    read_only: BooleanField = BooleanField(
        verbose_name='Запретить редактирование',
        default=False
    )
    access_policy: CharField = CharField(
        verbose_name='Политика доступа',
        max_length=500,
        choices=AccessPolicy.choices,
        default=AccessPolicy.PUBLIC
    )
    location: TextField = TextField(
        verbose_name='Расположение',
        max_length=500,
        default=LocationHead.USER
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
        return f'{self.alias}'

    def get_absolute_url(self):
        return f'/api/library/{self.pk}'

    def subscribers(self) -> list[User]:
        ''' Get all subscribers for this item. '''
        return [subscription.user for subscription in Subscription.objects.filter(item=self.pk).only('user')]

    def editors(self) -> list[User]:
        ''' Get all Editors of this item. '''
        return [item.editor for item in Editor.objects.filter(item=self.pk).only('editor')]

    def versions(self) -> QuerySet[Version]:
        ''' Get all Versions of this item. '''
        return Version.objects.filter(item=self.pk).order_by('-time_create')

    @transaction.atomic
    def save(self, *args, **kwargs):
        ''' Save updating subscriptions and connected operations. '''
        if not self._state.adding:
            self._update_connected_operations()
        subscribe = self._state.adding and self.owner
        super().save(*args, **kwargs)
        if subscribe:
            Subscription.subscribe(user=self.owner, item=self)

    def _update_connected_operations(self):
        # using method level import to prevent circular dependency
        from apps.oss.models import Operation  # pylint: disable=import-outside-toplevel
        operations = Operation.objects.filter(result__pk=self.pk, sync_text=True)
        if not operations.exists():
            return
        for operation in operations:
            changed = False
            if operation.alias != self.alias:
                operation.alias = self.alias
                changed = True
            if operation.title != self.title:
                operation.title = self.title
                changed = True
            if operation.comment != self.comment:
                operation.comment = self.comment
                changed = True
            if changed:
                operation.save()
