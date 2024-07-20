''' Models: SynthesisSubstitution. '''
from django.db.models import CASCADE, BooleanField, ForeignKey, Model


class SynthesisSubstitution(Model):
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
    transfer_term: BooleanField = BooleanField(
        verbose_name='Перенос термина',
        default=False
    )

    class Meta:
        ''' Model metadata. '''
        verbose_name = 'Отождествление синтеза'
        verbose_name_plural = 'Таблицы отождествлений'

    def __str__(self) -> str:
        return f'{self.original.pk} -> {self.substitution.pk}'
