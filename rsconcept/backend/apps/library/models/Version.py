''' Models: Version. '''
from django.db.models import (
    CASCADE,
    CharField,
    DateTimeField,
    ForeignKey,
    JSONField,
    Model,
    TextField
)


class Version(Model):
    ''' Library item version archive. '''
    item = ForeignKey(
        verbose_name='Схема',
        to='library.LibraryItem',
        on_delete=CASCADE
    )
    version = CharField(
        verbose_name='Версия',
        max_length=20,
        blank=False
    )
    description = TextField(
        verbose_name='Описание',
        blank=True
    )
    data = JSONField(
        verbose_name='Содержание'
    )
    time_create = DateTimeField(
        verbose_name='Дата создания',
        auto_now_add=True
    )

    class Meta:
        ''' Model metadata. '''
        verbose_name = 'Версия'
        verbose_name_plural = 'Версии'
        unique_together = [['item', 'version']]

    def __str__(self) -> str:
        return f'{self.item} v{self.version}'
