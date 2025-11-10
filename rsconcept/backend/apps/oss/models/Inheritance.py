''' Models: Synthesis Inheritance. '''
from django.db.models import CASCADE, ForeignKey, Model

from .Substitution import Substitution


class Inheritance(Model):
    ''' Inheritance links parent and child constituents in synthesis operation.'''
    operation = ForeignKey(
        verbose_name='Операция',
        to='oss.Operation',
        on_delete=CASCADE,
        related_name='inheritances'
    )
    parent = ForeignKey(
        verbose_name='Исходная конституента',
        to='rsform.Constituenta',
        on_delete=CASCADE,
        related_name='as_parent'
    )
    child = ForeignKey(
        verbose_name='Наследованная конституента',
        to='rsform.Constituenta',
        on_delete=CASCADE,
        related_name='as_child'
    )

    class Meta:
        ''' Model metadata. '''
        verbose_name = 'Наследование синтеза'
        verbose_name_plural = 'Отношение наследования конституент'
        unique_together = [['parent', 'child']]


    def __str__(self) -> str:
        return f'{self.parent} -> {self.child}'

    @staticmethod
    def check_share_origin(cst1: int, cst2: int) -> bool:
        ''' Check if two constituents share origin. '''
        inheritance1 = Inheritance.objects.filter(child_id=cst1).first()
        if not inheritance1:
            return False
        inheritance2 = Inheritance.objects.filter(child_id=cst2).first()
        if not inheritance2:
            return False

        parent1 = inheritance1.parent
        parent2 = inheritance2.parent

        origins1 = list(
            Substitution.objects.filter(
                substitution=parent1).values_list(
                'original__schema_id',
                flat=True))
        origins1.append(parent1.schema_id)

        origins2 = list(
            Substitution.objects.filter(
                substitution=parent2).values_list(
                'original__schema_id',
                flat=True))
        origins2.append(parent2.schema_id)

        return any(x in origins1 for x in origins2)
