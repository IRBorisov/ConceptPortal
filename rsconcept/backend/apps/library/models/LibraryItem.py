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
from django.utils import timezone

from apps.users.models import User

from .Version import Version


class LibraryItemType(TextChoices):
    ''' Type of library items '''
    RSFORM = 'rsform'
    OPERATION_SCHEMA = 'oss'
    RSMODEL = 'rsmodel'


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


CONTENT_FIELDS = frozenset({
    'title',
    'alias',
    'description',
    'item_type',
})


class LibraryItem(Model):
    ''' Abstract library item.'''
    item_type = CharField(
        verbose_name='Тип',
        max_length=50,
        choices=LibraryItemType.choices,
        default=LibraryItemType.RSFORM
    )
    owner = ForeignKey(
        verbose_name='Владелец',
        to=User,
        on_delete=SET_NULL,
        blank=True,
        null=True
    )
    title = TextField(
        verbose_name='Название'
    )
    alias = CharField(
        verbose_name='Шифр',
        max_length=255,
        blank=True
    )
    description = TextField(
        verbose_name='Описание',
        blank=True
    )
    visible = BooleanField(
        verbose_name='Отображаемая',
        default=True
    )
    read_only = BooleanField(
        verbose_name='Запретить редактирование',
        default=False
    )
    access_policy = CharField(
        verbose_name='Политика доступа',
        max_length=500,
        choices=AccessPolicy.choices,
        default=AccessPolicy.PUBLIC
    )
    location = TextField(
        verbose_name='Расположение',
        max_length=500,
        default=LocationHead.USER
    )

    time_create = DateTimeField(
        verbose_name='Дата создания',
        auto_now_add=True
    )
    time_update = DateTimeField(
        verbose_name='Дата изменения'
    )

    class Meta:
        ''' Model metadata. '''
        verbose_name = 'Элемент библиотеки'
        verbose_name_plural = 'Элементы библиотеки'

    # pylint: disable=invalid-str-returned
    def __str__(self) -> str:
        return f'{self.alias}'

    def get_absolute_url(self):
        return f'/api/library/{self.pk}'

    def save(self, *args, **kwargs):
        update_fields = kwargs.get('update_fields')

        if self._state.adding:
            if self.time_update is None:
                self.time_update = timezone.now()
            return super().save(*args, **kwargs)

        if update_fields is not None:
            update_fields = list(update_fields)
            if 'time_update' in update_fields:
                self.time_update = timezone.now()
            elif any(field in CONTENT_FIELDS for field in update_fields):
                self.time_update = timezone.now()
                update_fields.append('time_update')
            kwargs['update_fields'] = update_fields
            return super().save(*args, **kwargs)

        if self._content_fields_changed():
            self.time_update = timezone.now()

        return super().save(*args, **kwargs)

    def _content_fields_changed(self) -> bool:
        if not self.pk:
            return True
        old = LibraryItem.objects.filter(pk=self.pk).values(*CONTENT_FIELDS).first()
        if old is None:
            return True
        return any(getattr(self, field) != old[field] for field in CONTENT_FIELDS)

    def getQ_editors(self) -> QuerySet[User]:
        ''' Get all Editors of this item. '''
        return User.objects.filter(editor__item=self.pk)

    def getQ_versions(self) -> QuerySet[Version]:
        ''' Get all Versions of this item. '''
        return Version.objects.filter(item=self.pk).order_by('-time_create')

    def is_synced(self, target: 'LibraryItem') -> bool:
        ''' Check if item is synced with target. '''
        if self.owner != target.owner:
            return False
        if self.location != target.location:
            return False
        return True
