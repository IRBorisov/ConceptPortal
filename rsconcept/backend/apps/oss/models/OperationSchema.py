''' Models: OSS API. '''
from typing import Optional

from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import QuerySet

from apps.library.models import Editor, LibraryItem, LibraryItemType
from apps.rsform.models import RSForm
from shared import messages as msg

from .Argument import Argument
from .Inheritance import Inheritance
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

        # TODO: deal with attached schema
        # TODO: trigger on_change effects

        self.save()

    @transaction.atomic
    def set_input(self, target: Operation, schema: Optional[LibraryItem]):
        ''' Set input schema for operation. '''
        if schema == target.result:
            return
        target.result = schema
        if schema is not None:
            target.result = schema
            target.alias = schema.alias
            target.title = schema.title
            target.comment = schema.comment
        target.save()

        # TODO: trigger on_change effects

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
        # TODO: trigger on_change effects
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
        # TODO: trigger on_change effects

        self.save()

    @transaction.atomic
    def create_input(self, operation: Operation) -> RSForm:
        ''' Create input RSForm. '''
        schema = RSForm.create(
            owner=self.model.owner,
            alias=operation.alias,
            title=operation.title,
            comment=operation.comment,
            visible=False,
            access_policy=self.model.access_policy,
            location=self.model.location
        )
        Editor.set(schema.model, self.model.editors())
        operation.result = schema.model
        operation.save()
        self.save()
        return schema

    @transaction.atomic
    def execute_operation(self, operation: Operation) -> bool:
        ''' Execute target operation. '''
        schemas: list[LibraryItem] = [arg.argument.result for arg in operation.getArguments()]
        if None in schemas:
            return False
        substitutions = operation.getSubstitutions()
        receiver = self.create_input(operation)

        parents: dict = {}
        children: dict = {}
        for operand in schemas:
            schema = RSForm(operand)
            items = list(schema.constituents())
            new_items = receiver.insert_copy(items)
            for (i, cst) in enumerate(new_items):
                parents[cst.pk] = items[i]
                children[items[i].pk] = cst

        for sub in substitutions:
            original = children[sub.original.pk]
            replacement = children[sub.substitution.pk]
            receiver.substitute(original, replacement)

        # TODO: remove duplicates from diamond

        for cst in receiver.constituents():
            parent = parents.get(cst.pk)
            assert parent is not None
            Inheritance.objects.create(
                child=cst,
                parent=parent
            )

        receiver.restore_order()
        receiver.reset_aliases()
        self.save()
        return True
