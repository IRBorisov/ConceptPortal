''' Models: Synthesis Substitution. '''
from django.db.models import CASCADE, ForeignKey, Model


class Substitution(Model):
    ''' Substitutions as part of Synthesis operation in OSS.'''
    operation: ForeignKey = ForeignKey(
        verbose_name='Операция',
        to='oss.Operation',
        on_delete=CASCADE
    )

    original: ForeignKey = ForeignKey(
        verbose_name='Удаляемая конституента',
        to='rsform.Constituenta',
        on_delete=CASCADE,
        related_name='as_original'
    )
    substitution: ForeignKey = ForeignKey(
        verbose_name='Замещающая конституента',
        to='rsform.Constituenta',
        on_delete=CASCADE,
        related_name='as_substitute'
    )

    class Meta:
        ''' Model metadata. '''
        verbose_name = 'Отождествление синтеза'
        verbose_name_plural = 'Таблицы отождествлений'

    def __str__(self) -> str:
        return f'{self.substitution} -> {self.original}'
