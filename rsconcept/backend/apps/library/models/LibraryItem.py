''' Models: LibraryItem. '''
import re

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

    def subscribers(self) -> QuerySet[User]:
        ''' Get all subscribers for this item. '''
        return User.objects.filter(subscription__item=self.pk)

    def editors(self) -> QuerySet[User]:
        ''' Get all Editors of this item. '''
        return User.objects.filter(editor__item=self.pk)

    def versions(self) -> QuerySet[Version]:
        ''' Get all Versions of this item. '''
        return Version.objects.filter(item=self.pk).order_by('-time_create')
