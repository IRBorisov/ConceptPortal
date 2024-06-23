''' Models: Editor. '''
from typing import TYPE_CHECKING

from django.db import transaction
from django.db.models import CASCADE, DateTimeField, ForeignKey, Model

from apps.users.models import User

if TYPE_CHECKING:
    from .LibraryItem import LibraryItem


class Editor(Model):
    ''' Editor list. '''
    item: ForeignKey = ForeignKey(
        verbose_name='Схема',
        to='rsform.LibraryItem',
        on_delete=CASCADE
    )
    editor: ForeignKey = ForeignKey(
        verbose_name='Редактор',
        to=User,
        on_delete=CASCADE,
        null=True
    )
    time_create: DateTimeField = DateTimeField(
        verbose_name='Дата добавления',
        auto_now_add=True
    )

    class Meta:
        ''' Model metadata. '''
        verbose_name = 'Редактор'
        verbose_name_plural = 'Редакторы'
        unique_together = [['item', 'editor']]

    def __str__(self) -> str:
        return f'{self.item}: {self.editor}'

    @staticmethod
    def add(item: 'LibraryItem', user: User) -> bool:
        ''' Add Editor for item. '''
        if Editor.objects.filter(item=item, editor=user).exists():
            return False
        Editor.objects.create(item=item, editor=user)
        return True

    @staticmethod
    def remove(item: 'LibraryItem', user: User) -> bool:
        ''' Remove Editor. '''
        editor = Editor.objects.filter(item=item, editor=user)
        if not editor.exists():
            return False
        editor.delete()
        return True

    @staticmethod
    @transaction.atomic
    def set(item: 'LibraryItem', users: list[User]):
        ''' Set editors for item. '''
        processed: list[User] = []
        for editor_item in Editor.objects.filter(item=item):
            if editor_item.editor not in users:
                editor_item.delete()
            else:
                processed.append(editor_item.editor)

        for user in users:
            if user not in processed:
                processed.append(user)
                Editor.objects.create(item=item, editor=user)
