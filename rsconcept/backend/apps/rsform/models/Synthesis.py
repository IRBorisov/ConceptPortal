''' Models: Synthesis. '''

from django.db.models import (
    CASCADE,
    SET_NULL,
    BooleanField,
    CharField,
    ForeignKey,
    IntegerField,
    Model,
    TextChoices
)


class OperationStatus(TextChoices):
    ''' Operation status enumeration. '''
    DRAFT = 'Draft',
    COMPLETED = 'Completed',
    WARNING = 'Warning',
    FAILED = 'Failed'


class GraphStatus(TextChoices):
    ''' Graph status enumeration. '''
    DRAFT = 'Draft',
    COMPLETED = 'Completed',
    WARNING = 'Warning',
    FAILED = 'Failed'


class SynthesisGraph(Model):
    status: CharField = CharField(
        verbose_name='Статус операции слияния',
        max_length=20,
        choices=GraphStatus
    )


class InputNode(Model):
    graph_id: ForeignKey = ForeignKey(
        verbose_name='Схема синтеза',
        to=SynthesisGraph,
        on_delete=CASCADE
    )

    vertical_coordinate: IntegerField = IntegerField(
        verbose_name='Вертикальная координата звена',
    )

    horizontal_coordinate: IntegerField = IntegerField(
        verbose_name='Горизонтальная координата звена',
    )

    rsform_id: IntegerField = IntegerField(
        verbose_name='Схема',
        null=True
    )


class OperationNode(InputNode):
    name: CharField = CharField(
        verbose_name='Название',
        max_length=20
    )

    status: CharField = CharField(
        verbose_name='Статус операции слияния',
        max_length=20,
        choices=OperationStatus
    )

    left_parent: ForeignKey = ForeignKey(
        verbose_name='Левый предок',
        to='rsform.LibraryItem',
        related_name='rsform_library_item_left',
        on_delete=SET_NULL,
        null=True
    )

    right_parent: ForeignKey = ForeignKey(
        verbose_name='Правый предок',
        to='rsform.LibraryItem',
        related_name='rsform_library_item_right',
        on_delete=SET_NULL,
        null=True
    )


class SynthesisSubstitution(Model):
    graph_id: ForeignKey = ForeignKey(
        verbose_name='Схема синтеза',
        to=SynthesisGraph,
        on_delete=CASCADE
    )

    operation_id: ForeignKey = ForeignKey(
        verbose_name='Операция синтеза',
        to=OperationNode,
        on_delete=CASCADE
    )

    leftCst: ForeignKey = ForeignKey(
        verbose_name='Конституента',
        to='Constituenta',
        related_name='constituenta_original',
        on_delete=SET_NULL,
        null=True
    )

    rightCst: ForeignKey = ForeignKey(
        verbose_name='Подстановка',
        to='Constituenta',
        related_name='constituenta_substitution',
        on_delete=SET_NULL,
        null=True
    )

    deleteRight: BooleanField = BooleanField(
        verbose_name='Удалить правую'
    )

    takeLeftTerm: BooleanField = BooleanField(
        verbose_name='Использовать термин левой'
    )


class SynthesisEdge(Model):
    decoded_id: CharField = CharField(
        verbose_name='Id ребра на фронте',
        max_length=30,
    )

    source_handle: CharField = CharField(
        verbose_name='',
        max_length=30,
    )
    graph_id: ForeignKey = ForeignKey(
        verbose_name='Схема синтеза',
        to=SynthesisGraph,
        on_delete=CASCADE
    )

    node_from: IntegerField = IntegerField(
        verbose_name='Звено-предок',
    )

    node_to: IntegerField = IntegerField(
        verbose_name='Звено-наследник',
    )
