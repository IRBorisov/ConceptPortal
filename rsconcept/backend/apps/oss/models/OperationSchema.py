''' Models: OSS API. '''
# pylint: disable=duplicate-code

from typing import Optional

from cctext import extract_entities
from django.db.models import QuerySet

from apps.library.models import Editor, LibraryItem, LibraryItemType
from apps.rsform.models import (
    DELETED_ALIAS,
    Constituenta,
    OrderManager,
    RSFormCached,
    extract_globals,
    replace_entities,
    replace_globals
)

from .Argument import Argument
from .Block import Block
from .Inheritance import Inheritance
from .Layout import Layout
from .Operation import Operation, OperationType
from .Reference import Reference
from .Substitution import Substitution

CstMapping = dict[str, Optional[Constituenta]]
CstSubstitution = list[tuple[Constituenta, Constituenta]]


def cst_mapping_to_alias(mapping: CstMapping) -> dict[str, str]:
    ''' Convert constituenta mapping to alias mapping. '''
    result: dict[str, str] = {}
    for alias, cst in mapping.items():
        if cst is None:
            result[alias] = DELETED_ALIAS
        else:
            result[alias] = cst.alias
    return result


def map_cst_update_data(cst: Constituenta, data: dict, old_data: dict, mapping: dict[str, str]) -> dict:
    ''' Map data for constituenta update. '''
    new_data = {}
    if 'term_forms' in data:
        if old_data['term_forms'] == cst.term_forms:
            new_data['term_forms'] = data['term_forms']
    if 'convention' in data:
        new_data['convention'] = data['convention']
    if 'definition_formal' in data:
        new_data['definition_formal'] = replace_globals(data['definition_formal'], mapping)
    if 'term_raw' in data:
        if replace_entities(old_data['term_raw'], mapping) == cst.term_raw:
            new_data['term_raw'] = replace_entities(data['term_raw'], mapping)
    if 'definition_raw' in data:
        if replace_entities(old_data['definition_raw'], mapping) == cst.definition_raw:
            new_data['definition_raw'] = replace_entities(data['definition_raw'], mapping)
    return new_data


def extract_data_references(data: dict, old_data: dict) -> set[str]:
    ''' Extract references from data. '''
    result: set[str] = set()
    if 'definition_formal' in data:
        result.update(extract_globals(data['definition_formal']))
        result.update(extract_globals(old_data['definition_formal']))
    if 'term_raw' in data:
        result.update(extract_entities(data['term_raw']))
        result.update(extract_entities(old_data['term_raw']))
    if 'definition_raw' in data:
        result.update(extract_entities(data['definition_raw']))
        result.update(extract_entities(old_data['definition_raw']))
    return result


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
    def create_dependant_mapping(source: RSFormCached, cst_list: list[Constituenta]) -> CstMapping:
        ''' Create mapping for dependant Constituents. '''
        if len(cst_list) == len(source.cache.constituents):
            return {c.alias: c for c in source.cache.constituents}
        inserted_aliases = [cst.alias for cst in cst_list]
        depend_aliases: set[str] = set()
        for item in cst_list:
            depend_aliases.update(item.extract_references())
        depend_aliases.difference_update(inserted_aliases)
        alias_mapping: CstMapping = {}
        for alias in depend_aliases:
            cst = source.cache.by_alias.get(alias)
            if cst is not None:
                alias_mapping[alias] = cst
        return alias_mapping

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

    def create_reference(self, target: Operation) -> Operation:
        ''' Create Reference Operation. '''
        result = Operation.objects.create(
            oss=self.model,
            operation_type=OperationType.REFERENCE,
            result=target.result,
            parent=target.parent
        )
        Reference.objects.create(reference=result, target=target)
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
        if len(schemas) == 0:
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
