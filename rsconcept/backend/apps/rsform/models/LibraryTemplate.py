''' Models: LibraryTemplate. '''
from django.db.models import CASCADE, ForeignKey, Model


class LibraryTemplate(Model):
    ''' Template for library items and constituents. '''
    lib_source: ForeignKey = ForeignKey(
        verbose_name='Источник',
        to='rsform.LibraryItem',
        on_delete=CASCADE,
        null=True
    )

    class Meta:
        ''' Model metadata. '''
        verbose_name = 'Шаблон'
        verbose_name_plural = 'Шаблоны'
