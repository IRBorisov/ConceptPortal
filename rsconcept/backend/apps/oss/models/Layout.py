''' Models: Content Block in OSS. '''
from django.db.models import CASCADE, ForeignKey, JSONField, Model


class Layout(Model):
    ''' Node layout in OSS.'''
    oss = ForeignKey(
        verbose_name='Схема синтеза',
        to='library.LibraryItem',
        on_delete=CASCADE,
        related_name='layout'
    )

    data = JSONField(
        verbose_name='Расположение',
        default=list
    )

    class Meta:
        ''' Model metadata. '''
        verbose_name = 'Схема расположения'
        verbose_name_plural = 'Схемы расположения'

    def __str__(self) -> str:
        return f'Схема расположения {self.oss.alias}'
