''' Models: OSS API. '''
from typing import Optional

from django.db.models import QuerySet

from apps.library.models import Editor, LibraryItem, LibraryItemType
from apps.rsform.models import Constituenta, RSForm

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

    def save(self, *args, **kwargs) -> None:
        ''' Save wrapper. '''
        self.model.save(*args, **kwargs)

    def refresh_from_db(self) -> None:
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

    def owned_schemas(self) -> QuerySet[LibraryItem]:
        ''' Get QuerySet containing all result schemas owned by current OSS. '''
        return LibraryItem.objects.filter(
            producer__oss=self.model,
            owner_id=self.model.owner_id,
            location=self.model.location
        )

    def update_positions(self, data: list[dict]) -> None:
        ''' Update positions. '''
        lookup = {x['id']: x for x in data}
        operations = self.operations()
        for item in operations:
            if item.pk in lookup:
                item.position_x = lookup[item.pk]['position_x']
                item.position_y = lookup[item.pk]['position_y']
        Operation.objects.bulk_update(operations, ['position_x', 'position_y'])

    def create_operation(self, **kwargs) -> Operation:
        ''' Insert new operation. '''
        result = Operation.objects.create(oss=self.model, **kwargs)
        self.save()
        result.refresh_from_db()
        return result

    def delete_operation(self, operation: Operation):
        ''' Delete operation. '''
        operation.delete()

        # TODO: deal with attached schema
        # TODO: trigger on_change effects

        self.save()

    def set_input(self, target: Operation, schema: Optional[LibraryItem]) -> None:
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

    def set_arguments(self, operation: Operation, arguments: list[Operation]) -> None:
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

    def set_substitutions(self, target: Operation, substitutes: list[dict]) -> None:
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
        Editor.set(schema.model.pk, self.model.editors().values_list('pk', flat=True))
        operation.result = schema.model
        operation.save()
        self.save()
        return schema

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

        translated_substitutions: list[tuple[Constituenta, Constituenta]] = []
        for sub in substitutions:
            original = children[sub.original.pk]
            replacement = children[sub.substitution.pk]
            translated_substitutions.append((original, replacement))
        receiver.substitute(translated_substitutions)

        # TODO: remove duplicates from diamond

        for cst in receiver.constituents():
            parent = parents.get(cst.pk)
            assert parent is not None
            Inheritance.objects.create(
                operation=operation,
                child=cst,
                parent=parent
            )

        receiver.restore_order()
        receiver.reset_aliases()
        self.save()
        return True
