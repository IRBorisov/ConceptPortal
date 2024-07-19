''' Models: OSS API. '''
from typing import Optional

from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import QuerySet

from apps.rsform.models import LibraryItem, LibraryItemType
from shared import messages as msg

from .Argument import Argument
from .Operation import Operation
from .SynthesisSubstitution import SynthesisSubstitution


class OperationSchema:
    ''' Operations schema API. '''

    def __init__(self, item: LibraryItem):
        if item.item_type != LibraryItemType.OPERATION_SCHEMA:
            raise ValueError(msg.libraryTypeUnexpected())
        self.item = item

    @staticmethod
    def create(**kwargs) -> 'OperationSchema':
        item = LibraryItem.objects.create(item_type=LibraryItemType.OPERATION_SCHEMA, **kwargs)
        return OperationSchema(item=item)

    def operations(self) -> QuerySet[Operation]:
        ''' Get QuerySet containing all operations of current OSS. '''
        return Operation.objects.filter(oss=self.item)

    def arguments(self) -> QuerySet[Argument]:
        ''' Operation arguments. '''
        return Argument.objects.filter(operation__oss=self.item)

    def substitutions(self) -> QuerySet[SynthesisSubstitution]:
        ''' Operation substitutions. '''
        return SynthesisSubstitution.objects.filter(operation__oss=self.item)

    def update_positions(self, data: list[dict]):
        ''' Update positions. '''
        lookup = {x['id']: x for x in data}
        operations = self.operations()
        for item in operations:
            if item.pk in lookup:
                item.position_x = lookup[item.pk]['position_x']
                item.position_y = lookup[item.pk]['position_y']
        Operation.objects.bulk_update(operations, ['position_x', 'position_y'])

    @transaction.atomic
    def create_operation(self, **kwargs) -> Operation:
        ''' Insert new operation. '''
        if kwargs['alias'] != '' and self.operations().filter(alias=kwargs['alias']).exists():
            raise ValidationError(msg.aliasTaken(kwargs['alias']))
        result = Operation.objects.create(
            oss=self.item,
            **kwargs
        )
        self.item.save()
        result.refresh_from_db()
        return result

    @transaction.atomic
    def delete_operation(self, operation: Operation):
        ''' Delete operation. '''
        operation.delete()

        # deal with attached schema
        # trigger on_change effects

        self.item.save()

    @transaction.atomic
    def set_input(self, target: Operation, schema: Optional[LibraryItem]):
        ''' Set input schema for operation. '''
        if schema == target.result:
            return
        if schema:
            target.result = schema
            target.alias = schema.alias
            target.title = schema.title
            target.comment = schema.comment
        else:
            target.result = None
        target.save()

        # trigger on_change effects

        self.item.save()

    @transaction.atomic
    def add_argument(self, operation: Operation, argument: Operation) -> Optional[Argument]:
        ''' Add Argument to operation. '''
        if Argument.objects.filter(operation=operation, argument=argument).exists():
            return None
        result = Argument.objects.create(operation=operation, argument=argument)
        self.item.save()
        return result

    @transaction.atomic
    def clear_arguments(self, target: Operation):
        ''' Clear all arguments for operation. '''
        if not Argument.objects.filter(operation=target).exists():
            return

        Argument.objects.filter(operation=target).delete()
        SynthesisSubstitution.objects.filter(operation=target).delete()

        # trigger on_change effects

        self.item.save()

    @transaction.atomic
    def set_substitutions(self, target: Operation, substitutes: list[dict]):
        ''' Clear all arguments for operation. '''
        SynthesisSubstitution.objects.filter(operation=target).delete()
        for sub in substitutes:
            SynthesisSubstitution.objects.create(
                operation=target,
                original=sub['original'],
                substitution=sub['substitution'],
                transfer_term=sub['transfer_term']
            )

        # trigger on_change effects

        self.item.save()
