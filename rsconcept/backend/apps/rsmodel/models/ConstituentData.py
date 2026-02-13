''' Models: RSModel constituent binding. '''
from django.db.models import CASCADE, ForeignKey, JSONField, Model, TextField


class ConstituentData(Model):
    ''' Links model, constituent and JSON data. '''
    model = ForeignKey(
        verbose_name='Модель',
        to='library.LibraryItem',
        on_delete=CASCADE,
        related_name='rsmodel_constituents'
    )
    constituent = ForeignKey(
        verbose_name='Конституента',
        to='rsform.Constituenta',
        on_delete=CASCADE,
        related_name='rsmodel_bindings'
    )
    type = TextField(
        verbose_name='Тип данных',
    )
    data = JSONField(
        verbose_name='Данные',
        default=dict,
        blank=True
    )

    class Meta:
        ''' Model metadata. '''
        verbose_name = 'Конституента модели'
        verbose_name_plural = 'Конституенты модели'

    def __str__(self) -> str:
        return f'Model {self.model_id} / Cst {self.constituent_id}'
