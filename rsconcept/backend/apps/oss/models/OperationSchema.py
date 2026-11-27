''' Models: OSS API. '''
# pylint: disable=duplicate-code

from django.db import transaction
from django.db.models import QuerySet

from apps.library.models import Editor, LibraryItem, LibraryItemType
from apps.rsform.models import Constituenta, CstType, OrderManager, RSFormCached

from .Argument import Argument
from .Block import Block
from .Inheritance import Inheritance
from .Layout import Layout
from .Operation import Operation, OperationType
from .Relativization import Relativization
from .Replica import Replica
from .Substitution import Substitution


class OperationSchema:
    ''' Operations schema API wrapper. No caching, propagation and minimal side effects. '''

    def __init__(self, model: LibraryItem) -> None:
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
    def create_input(oss_id: int, operation: Operation) -> LibraryItem:
        ''' Create input RSForm for given Operation. '''
        oss = LibraryItem.objects.get(pk=oss_id)
        schema = LibraryItem.objects.create(item_type=LibraryItemType.RSFORM, owner=oss.owner,
                                            alias=operation.alias,
                                            title=operation.title,
                                            description=operation.description,
                                            visible=False,
                                            access_policy=oss.access_policy,
                                            location=oss.location)
        Editor.set(schema.pk, oss.getQ_editors().values_list('pk', flat=True))
        operation.setQ_result(schema)
        return schema

    def refresh_from_db(self) -> None:
        ''' Model wrapper. '''
        self.model.refresh_from_db()

    def create_operation(self, **kwargs) -> Operation:
        ''' Create Operation. '''
        result = Operation.objects.create(oss=self.model, **kwargs)
        return result

    @transaction.atomic
    def record_relativization(
        self,
        source: Operation,
        result: LibraryItem,
        target: Constituenta,
        excluded: list[Constituenta],
        parent_id: int | None = None,
    ) -> Operation:
        ''' Attach a generated schema and record the inputs to its transformation. '''
        source = Operation.objects.select_for_update().get(pk=source.pk)
        source_schema = source.result
        if source.oss_id != self.model.pk or source_schema is None:
            raise ValueError('Relativization requires a source schema in the OSS.')
        if target.schema_id != source_schema.pk or target.cst_type not in (CstType.BASE, CstType.STRUCTURED):
            raise ValueError('The target must be a base set or a structure of the source schema.')

        excluded_ids = {item.pk for item in excluded}
        kernel_types = (CstType.BASE, CstType.CONSTANT, CstType.STRUCTURED)
        if len(excluded_ids) != len(excluded) or target.pk in excluded_ids or any(
            item.schema_id != source_schema.pk or item.cst_type not in kernel_types for item in excluded
        ):
            raise ValueError(
                'Exclusions must be distinct kernel constituents of the source schema other than the target.'
            )

        result = LibraryItem.objects.select_for_update().get(pk=result.pk)
        if (result.item_type != LibraryItemType.RSFORM or not result.is_synced(self.model)
                or result.pk == source_schema.pk or result.producer.exists()):
            raise ValueError('Relativization requires a new result schema owned by the OSS.')

        operation = self.create_operation(
            operation_type=OperationType.RELATIVIZATION,
            parent_id=parent_id,
            result=result,
            alias=result.alias,
            title=result.title,
            description=result.description,
        )
        Relativization.objects.create(
            operation=operation, source=source_schema,
            passport={
                'source': {'id': source_schema.pk, 'alias': source_schema.alias, 'title': source_schema.title},
                'target': {'alias': target.alias, 'term': target.term_resolved},
                'excluded': [{'alias': item.alias, 'term': item.term_resolved} for item in excluded],
            },
        )
        self.set_arguments(operation.pk, [source])
        self.model.save(update_fields=['time_update'])
        return operation

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
        receiver = RSFormCached(OperationSchema.create_input(self.model.pk, operation).pk)

        parents: dict = {}
        children: dict = {}
        for operand in schemas:
            new_items = receiver.insert_from(operand)
            for (old_cst, new_cst) in new_items:
                parents[new_cst.pk] = old_cst
                children[old_cst.pk] = new_cst

        translated_substitutions: list[tuple[Constituenta, Constituenta]] = []
        for sub in substitutions:
            original = children[sub.original.pk]
            replacement = children[sub.substitution.pk]
            translated_substitutions.append((original, replacement))
        receiver.substitute(translated_substitutions)

        for cst in Constituenta.objects.filter(schema_id=receiver.pk).order_by('order'):
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
