''' Models: RSModel attributes. '''
from django.db.models import CASCADE, ForeignKey, Model, OneToOneField

from apps.library.models import LibraryItem, LibraryItemType


class RSModel(Model):
    ''' Attributes for an RSModel library item. '''
    model = OneToOneField(
        verbose_name='Модель',
        to='library.LibraryItem',
        on_delete=CASCADE,
        related_name='rsmodels',
        primary_key=True
    )
    schema = ForeignKey(
        verbose_name='Концептуальная схема',
        to='library.LibraryItem',
        on_delete=CASCADE,
        related_name='base_schema',
        null=True,
        blank=True
    )

    @staticmethod
    def create(schema: LibraryItem, **kwargs) -> 'RSModel':
        ''' Create LibraryItem via RSModel. '''
        model = LibraryItem.objects.create(item_type=LibraryItemType.RSMODEL, **kwargs)
        return RSModel.objects.create(model=model, schema=schema)

    class Meta:
        ''' Model metadata. '''
        verbose_name = 'Концептуальная модель'
        verbose_name_plural = 'Концептуальные модели'

    def __str__(self) -> str:
        return f'Модель {self.model_id}'
