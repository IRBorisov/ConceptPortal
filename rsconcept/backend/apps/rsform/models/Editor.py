''' Models: Editor. '''
from typing import TYPE_CHECKING

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
    def add(user: User, item: 'LibraryItem') -> bool:
        ''' Add Editor for item. '''
        if Editor.objects.filter(editor=user, item=item).exists():
            return False
        Editor.objects.create(editor=user, item=item)
        return True

    @staticmethod
    def remove(user: User, item: 'LibraryItem') -> bool:
        ''' Remove Editor. '''
        editor = Editor.objects.filter(editor=user, item=item)
        if not editor.exists():
            return False
        editor.delete()
        return True
