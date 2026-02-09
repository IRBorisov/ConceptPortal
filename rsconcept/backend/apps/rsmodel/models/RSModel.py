''' Models: RSModel attributes. '''
from django.db.models import CASCADE, ForeignKey, Model, OneToOneField


class RSModel(Model):
    ''' Attributes for an RSModel library item. '''
    model = OneToOneField(
        verbose_name='Модель',
        to='library.LibraryItem',
        on_delete=CASCADE,
        related_name='rsmodel_data',
        primary_key=True
    )
    schema = ForeignKey(
        verbose_name='Концептуальная схема',
        to='library.LibraryItem',
        on_delete=CASCADE,
        related_name='rsmodels',
        null=True,
        blank=True
    )

    class Meta:
        ''' Model metadata. '''
        verbose_name = 'Концептуальная модель'
        verbose_name_plural = 'Концептуальные модели'

    def __str__(self) -> str:
        return f'Модель {self.model_id}'
