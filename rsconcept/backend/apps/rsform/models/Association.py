''' Models: Synthesis Inheritance. '''
from django.db.models import CASCADE, ForeignKey, Model


class Association(Model):
    ''' Association links nominal constituent to its content.'''
    container = ForeignKey(
        verbose_name='Составная конституента',
        to='rsform.Constituenta',
        on_delete=CASCADE,
        related_name='as_container'
    )
    associate = ForeignKey(
        verbose_name='Ассоциированная конституента',
        to='rsform.Constituenta',
        on_delete=CASCADE,
        related_name='as_associate'
    )

    class Meta:
        ''' Model metadata. '''
        verbose_name = 'Ассоциация конституент'
        verbose_name_plural = 'Ассоциации конституент'
        unique_together = [['container', 'associate']]


    def __str__(self) -> str:
        return f'{self.container} -> {self.associate}'
