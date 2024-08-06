''' Models: LibraryTemplate. '''
from django.db.models import CASCADE, ForeignKey, Model


class LibraryTemplate(Model):
    ''' Template for library items and constituents. '''
    lib_source: ForeignKey = ForeignKey(
        verbose_name='Источник',
        to='library.LibraryItem',
        on_delete=CASCADE
    )

    class Meta:
        ''' Model metadata. '''
        verbose_name = 'Шаблон'
        verbose_name_plural = 'Шаблоны'
