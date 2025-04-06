''' Models: Content Block in OSS. '''
# pylint: disable=duplicate-code
from django.db.models import CASCADE, SET_NULL, ForeignKey, Model, TextField


class Block(Model):
    ''' Block of content in OSS.'''
    oss = ForeignKey(
        verbose_name='Схема синтеза',
        to='library.LibraryItem',
        on_delete=CASCADE,
        related_name='blocks'
    )

    title = TextField(
        verbose_name='Название',
        blank=True
    )
    description = TextField(
        verbose_name='Описание',
        blank=True
    )

    parent = ForeignKey(
        verbose_name='Содержащий блок',
        to='oss.Block',
        blank=True,
        null=True,
        on_delete=SET_NULL,
        related_name='as_child_block'
    )

    class Meta:
        ''' Model metadata. '''
        verbose_name = 'Блок'
        verbose_name_plural = 'Блоки'

    def __str__(self) -> str:
        return f'Блок {self.title}'
