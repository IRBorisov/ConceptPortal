from django.db.models import (
    CASCADE, SET_NULL, ForeignKey, Model, PositiveIntegerField, QuerySet,
    TextChoices, TextField, BooleanField, CharField, DateTimeField, JSONField, IntegerField
)

from rsconcept.backend.apps.rsform.models.api_RSForm import RSForm, LibraryItem, LibraryItemType
import rsconcept.backend.apps.rsform.messages as messages


class GraphStatus(TextChoices):
    DRAFT = 'Draft',
    IN_PROGRESS = 'In progress',
    COMPLETED = 'Completed',
    FAILED = 'Failed'


class OperationStatus(TextChoices):
    DRAFT = 'Draft',
    # IN_PROGRESS = 'In progress',
    COMPLETED = 'Completed',
    WARNING = 'Warning',
    FAILED = 'Failed'


class SynthesisNodeType:
    LIBRARY = 'Library',
    SYNTHESIZED = 'Synthesized'


class ConceptOperation(Model):
    name: CharField = CharField(
        verbose_name='Название',
        max_length=20
    )

    node_type: CharField = CharField(
        verbose_name='Тип звена операции слияния',
        max_length=20,
        choices=SynthesisNodeType
    )

    status: CharField(
        verbose_name='Статус операции слияния',
        max_length=20,
        choices=OperationStatus
    )

    vertical_coordinate = IntegerField(
        verbose_name='Вертикальная координата звена',
    )

    horizontal_coordinate = IntegerField(
        verbose_name='Горизонтальная координата звена',
    )

    rsform = ForeignKey(
        verbose_name='Схема',
        to='rsform.LibraryItem'
    )

    operation_type = CharField()


class SynthesisGraph(Model):
    name: CharField = CharField(
        verbose_name='Название',
        max_length=20
    )
    status: CharField = CharField(
        verbose_name='Статус схемы слияния',
        max_length=20,
        choices=GraphStatus,
    )


class SynthesisEdge(Model):
    synthesis_graph: ForeignKey(
        verbose_name='Схема синтеза',
        to=SynthesisGraph,
    )

    node_from: ForeignKey(
        verbose_name='Звено-предок',
        to='rsform.LibraryItem'
    )

    node_to: ForeignKey(
        verbose_name='Звено-наследник',
        to='rsform.LibraryItem'
    )
