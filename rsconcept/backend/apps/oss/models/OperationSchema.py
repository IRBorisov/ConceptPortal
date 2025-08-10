''' Models: OSS API. '''
# pylint: disable=duplicate-code

from django.db.models import QuerySet

from apps.library.models import Editor, LibraryItem, LibraryItemType
from apps.rsform.models import Constituenta, OrderManager, RSFormCached

from .Argument import Argument
from .Block import Block
from .Inheritance import Inheritance
from .Layout import Layout
from .Operation import Operation, OperationType
from .Replica import Replica
from .Substitution import Substitution


class OperationSchema:
    ''' Operations schema API wrapper. No caching, propagation and minimal side effects. '''

    def __init__(self, model: LibraryItem):
        self.model = model

    @staticmethod
    def create(**kwargs) -> 'OperationSchema':
        ''' Create LibraryItem via OperationSchema. '''
        model = LibraryItem.objects.create(item_type=LibraryItemType.OPERATION_SCHEMA, **kwargs)
        Layout.objects.create(oss=model, data=[])
        return OperationSchema(model)

    @staticmethod
    def owned_schemasQ(item: LibraryItem) -> QuerySet[LibraryItem]:
        ''' Get QuerySet containing all result schemas owned by current OSS. '''
        return LibraryItem.objects.filter(
            producer__oss=item,
            owner_id=item.owner_id,
            location=item.location
        )

    @staticmethod
    def layoutQ(itemID: int) -> Layout:
        ''' OSS layout. '''
        return Layout.objects.get(oss_id=itemID)

    @staticmethod
    def create_input(oss: LibraryItem, operation: Operation) -> RSFormCached:
        ''' Create input RSForm for given Operation. '''
        schema = RSFormCached.create(
            owner=oss.owner,
            alias=operation.alias,
            title=operation.title,
            description=operation.description,
            visible=False,
            access_policy=oss.access_policy,
            location=oss.location
        )
        Editor.set(schema.model.pk, oss.getQ_editors().values_list('pk', flat=True))
        operation.setQ_result(schema.model)
        return schema

    def refresh_from_db(self) -> None:
        ''' Model wrapper. '''
        self.model.refresh_from_db()

    def create_operation(self, **kwargs) -> Operation:
        ''' Create Operation. '''
        result = Operation.objects.create(oss=self.model, **kwargs)
        return result

    def create_replica(self, target: Operation) -> Operation:
        ''' Create Replica Operation. '''
        result = Operation.objects.create(
            oss=self.model,
            operation_type=OperationType.REPLICA,
            result=target.result,
            parent=target.parent
        )
        Replica.objects.create(replica=result, original=target)
        return result

    def create_block(self, **kwargs) -> Block:
        ''' Create Block. '''
        result = Block.objects.create(oss=self.model, **kwargs)
        return result

    def delete_block(self, target: Block):
        ''' Delete Block. '''
        new_parent = target.parent
        if new_parent is not None:
            for block in Block.objects.filter(parent=target):
                if block != new_parent:
                    block.parent = new_parent
                    block.save(update_fields=['parent'])
            for operation in Operation.objects.filter(parent=target):
                operation.parent = new_parent
                operation.save(update_fields=['parent'])
        target.delete()

    def set_arguments(self, target: int, arguments: list[Operation]) -> None:
        ''' Set arguments of target Operation. '''
        Argument.objects.filter(operation_id=target).delete()
        order = 0
        for arg in arguments:
            Argument.objects.create(
                operation_id=target,
                argument=arg,
                order=order
            )
            order += 1

    def set_substitutions(self, target: int, substitutes: list[dict]) -> None:
        ''' Set Substitutions for target Operation. '''
        Substitution.objects.filter(operation_id=target).delete()
        for sub_item in substitutes:
            Substitution.objects.create(
                operation_id=target,
                original=sub_item['original'],
                substitution=sub_item['substitution']
            )

    def execute_operation(self, operation: Operation) -> None:
        ''' Execute target Operation. '''
        schemas: list[int] = [
            arg.argument.result_id
            for arg in Argument.objects
            .filter(operation=operation)
            .select_related('argument')
            .only('argument__result_id')
            .order_by('order')
            if arg.argument.result_id is not None
        ]
        if not schemas:
            return
        substitutions = operation.getQ_substitutions()
        receiver = OperationSchema.create_input(self.model, operation)

        parents: dict = {}
        children: dict = {}
        for operand in schemas:
            items = list(Constituenta.objects.filter(schema_id=operand).order_by('order'))
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

        for cst in Constituenta.objects.filter(schema=receiver.model).order_by('order'):
            parent = parents.get(cst.pk)
            assert parent is not None
            Inheritance.objects.create(
                operation_id=operation.pk,
                child=cst,
                parent=parent
            )

        OrderManager(receiver).restore_order()
        receiver.reset_aliases()
        receiver.resolve_all_text()
