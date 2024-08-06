''' Models: Editor. '''
from typing import Iterable

from django.db import transaction
from django.db.models import CASCADE, DateTimeField, ForeignKey, Model

from apps.users.models import User


class Editor(Model):
    ''' Editor list. '''
    item: ForeignKey = ForeignKey(
        verbose_name='Схема',
        to='library.LibraryItem',
        on_delete=CASCADE
    )
    editor: ForeignKey = ForeignKey(
        verbose_name='Редактор',
        to=User,
        on_delete=CASCADE
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
    def add(item: int, user: int) -> bool:
        ''' Add Editor for item. '''
        if Editor.objects.filter(item_id=item, editor_id=user).exists():
            return False
        Editor.objects.create(item_id=item, editor_id=user)
        return True

    @staticmethod
    def remove(item: int, user: int) -> bool:
        ''' Remove Editor. '''
        editor = Editor.objects.filter(item_id=item, editor_id=user).only('pk')
        if not editor.exists():
            return False
        editor.delete()
        return True

    @staticmethod
    @transaction.atomic
    def set(item: int, users: Iterable[int]):
        ''' Set editors for item. '''
        processed: set[int] = set()
        for editor_item in Editor.objects.filter(item_id=item).only('pk', 'editor_id'):
            editor_id = editor_item.editor_id
            if editor_id not in users:
                editor_item.delete()
            else:
                processed.add(editor_id)

        for user in users:
            if user not in processed:
                processed.add(user)
                Editor.objects.create(item_id=item, editor_id=user)

    @staticmethod
    @transaction.atomic
    def set_and_return_diff(item: int, users: Iterable[int]) -> tuple[list[int], list[int]]:
        ''' Set editors for item and return diff. '''
        processed: list[int] = []
        deleted: list[int] = []
        added: list[int] = []
        for editor_item in Editor.objects.filter(item_id=item).only('pk', 'editor_id'):
            editor_id = editor_item.editor_id
            if editor_id not in users:
                deleted.append(editor_id)
                editor_item.delete()
            else:
                processed.append(editor_id)

        for user in users:
            if user not in processed:
                processed.append(user)
                added.append(user)
                Editor.objects.create(item_id=item, editor_id=user)

        return (added, deleted)
