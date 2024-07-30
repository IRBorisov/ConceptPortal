''' Models: OSS API. '''
from typing import Optional

from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import QuerySet

from apps.library.models import LibraryItem, LibraryItemType
from shared import messages as msg

from .Argument import Argument
from .Operation import Operation
from .Substitution import Substitution


class OperationSchema:
    ''' Operations schema API. '''

    def __init__(self, model: LibraryItem):
        self.model = model

    @staticmethod
    def create(**kwargs) -> 'OperationSchema':
        ''' Create LibraryItem via OperationSchema. '''
        model = LibraryItem.objects.create(item_type=LibraryItemType.OPERATION_SCHEMA, **kwargs)
        return OperationSchema(model)

    @staticmethod
    def from_id(pk: int) -> 'OperationSchema':
        ''' Get LibraryItem by pk. '''
        model = LibraryItem.objects.get(pk=pk)
        return OperationSchema(model)

    def save(self, *args, **kwargs):
        ''' Save wrapper. '''
        self.model.save(*args, **kwargs)

    def refresh_from_db(self):
        ''' Model wrapper. '''
        self.model.refresh_from_db()

    def operations(self) -> QuerySet[Operation]:
        ''' Get QuerySet containing all operations of current OSS. '''
        return Operation.objects.filter(oss=self.model)

    def arguments(self) -> QuerySet[Argument]:
        ''' Operation arguments. '''
        return Argument.objects.filter(operation__oss=self.model)

    def substitutions(self) -> QuerySet[Substitution]:
        ''' Operation substitutions. '''
        return Substitution.objects.filter(operation__oss=self.model)

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
        result = Operation.objects.create(oss=self.model, **kwargs)
        self.save()
        result.refresh_from_db()
        return result

    @transaction.atomic
    def delete_operation(self, operation: Operation):
        ''' Delete operation. '''
        operation.delete()

        # deal with attached schema
        # trigger on_change effects

        self.save()

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

        self.save()

    @transaction.atomic
    def set_arguments(self, operation: Operation, arguments: list[Operation]):
        ''' Set arguments to operation. '''
        processed: list[Operation] = []
        changed = False
        for current in operation.getArguments():
            if current.argument not in arguments:
                changed = True
                current.delete()
            else:
                processed.append(current.argument)
        for arg in arguments:
            if arg not in processed:
                changed = True
                processed.append(arg)
                Argument.objects.create(operation=operation, argument=arg)
        if not changed:
            return
        # trigger on_change effects
        self.save()

    @transaction.atomic
    def set_substitutions(self, target: Operation, substitutes: list[dict]):
        ''' Clear all arguments for operation. '''
        processed: list[dict] = []
        changed = False

        for current in target.getSubstitutions():
            subs = [
                x for x in substitutes
                if x['original'] == current.original and x['substitution'] == current.substitution
            ]
            if len(subs) == 0:
                changed = True
                current.delete()
            else:
                processed.append(subs[0])

        for sub in substitutes:
            if sub not in processed:
                changed = True
                Substitution.objects.create(
                    operation=target,
                    original=sub['original'],
                    substitution=sub['substitution']
                )

        if not changed:
            return
        # trigger on_change effects

        self.save()
