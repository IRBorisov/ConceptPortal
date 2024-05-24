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
    item: ForeignKey = ForeignKey(
        verbose_name='Схема',
        to='rsform.LibraryItem',
        on_delete=CASCADE
    )
    version = CharField(
        verbose_name='Версия',
        max_length=20,
        blank=False
    )
    description: TextField = TextField(
        verbose_name='Описание',
        blank=True
    )
    data: JSONField = JSONField(
        verbose_name='Содержание'
    )
    time_create: DateTimeField = DateTimeField(
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
