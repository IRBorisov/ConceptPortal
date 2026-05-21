''' Deep clone of library items (RSForm, RSModel, OSS). '''
from copy import deepcopy
from typing import Optional

from django.contrib.auth.models import User
from django.db import transaction

from apps.library.models import Editor, LibraryItem, LibraryItemType, LocationHead
from apps.oss.models import (
    Argument,
    Block,
    Inheritance,
    Layout,
    Operation,
    PropagationFacade,
    Replica,
    Substitution
)
from apps.rsform.models import RSFormCached
from apps.rsmodel.models import ConstituentData, RSModel


def clone_library_item_shell(source: LibraryItem, owner: User, item_data: dict) -> LibraryItem:
    ''' Create a new library item row from clone metadata. '''
    clone = deepcopy(source)
    clone.pk = None
    clone.owner = owner
    clone.title = item_data['title']
    clone.alias = item_data.get('alias', '')
    clone.description = item_data.get('description', '')
    clone.visible = item_data.get('visible', True)
    clone.read_only = False
    clone.access_policy = item_data.get('access_policy', source.access_policy)
    clone.location = item_data.get('location', LocationHead.USER)
    clone.save()
    return clone


def clone_rsform(
    source: LibraryItem,
    owner: User,
    item_data: dict,
    items_list: Optional[list[int]] = None,
) -> LibraryItem:
    ''' Clone RSForm library item and constituents. '''
    if source.item_type != LibraryItemType.RSFORM:
        raise ValueError('Source is not an RSForm')
    with transaction.atomic():
        clone = clone_library_item_shell(source, owner, item_data)
        RSFormCached(clone.pk).insert_from(source.pk, items_list)
        return clone


def clone_rsmodel(source: LibraryItem, owner: User, item_data: dict) -> LibraryItem:
    ''' Clone RSModel library item and constituent data bindings. '''
    if source.item_type != LibraryItemType.RSMODEL:
        raise ValueError('Source is not an RSModel')
    with transaction.atomic():
        clone = clone_library_item_shell(source, owner, item_data)
        model_binding = RSModel.objects.get(model=source)
        RSModel.objects.create(model=clone, schema=model_binding.schema)
        value_bindings = ConstituentData.objects.filter(model=source)
        ConstituentData.objects.bulk_create([
            ConstituentData(
                model=clone,
                constituent_id=binding_item.constituent_id,
                type=binding_item.type,
                data=binding_item.data
            )
            for binding_item in value_bindings
        ])
        return clone


def clone_oss(source: LibraryItem, owner: User, item_data: dict) -> LibraryItem:
    ''' Clone OSS graph, attached schemas, and relations into a new library folder. '''
    if source.item_type != LibraryItemType.OPERATION_SCHEMA:
        raise ValueError('Source is not an operation schema')

    with transaction.atomic():
        clone = clone_library_item_shell(source, owner, item_data)

        Layout.objects.create(oss=clone, data=[])

        block_map = _clone_oss_blocks(source.pk, clone.pk)
        operation_map = _clone_oss_operations(source.pk, clone.pk, block_map)
        schema_map, cst_map = _clone_oss_attached_schemas(source, clone, owner, item_data)
        _apply_oss_operation_results(operation_map, schema_map)
        _clone_oss_arguments(source.pk, operation_map)
        _clone_oss_replicas(source.pk, operation_map)
        _clone_oss_substitutions(source.pk, operation_map, cst_map)
        _clone_oss_inheritances(source.pk, operation_map, cst_map)
        _clone_oss_layout(source.pk, clone.pk, block_map, operation_map)
        _copy_oss_editors(source.pk, clone.pk)

        return clone


def clone_library_item(
    source: LibraryItem,
    owner: User,
    item_data: dict,
    items_list: Optional[list[int]] = None,
) -> LibraryItem:
    ''' Clone any supported library item type. '''
    if source.item_type == LibraryItemType.RSFORM:
        return clone_rsform(source, owner, item_data, items_list)
    if source.item_type == LibraryItemType.RSMODEL:
        return clone_rsmodel(source, owner, item_data)
    if source.item_type == LibraryItemType.OPERATION_SCHEMA:
        return clone_oss(source, owner, item_data)
    raise ValueError(f'Unsupported library item type: {source.item_type}')


def _clone_oss_blocks(source_oss_id: int, clone_oss_id: int) -> dict[int, int]:
    block_map: dict[int, int] = {}
    blocks = list(Block.objects.filter(oss_id=source_oss_id).order_by('pk'))
    for block in blocks:
        new_block = Block.objects.create(
            oss_id=clone_oss_id,
            title=block.title,
            description=block.description,
            parent=None
        )
        block_map[block.pk] = new_block.pk
    updates: list[Block] = []
    for block in blocks:
        if block.parent_id is not None:
            new_block = Block.objects.get(pk=block_map[block.pk])
            new_block.parent_id = block_map[block.parent_id]
            updates.append(new_block)
    if updates:
        Block.objects.bulk_update(updates, ['parent'])
    return block_map


def _clone_oss_operations(
    source_oss_id: int,
    clone_oss_id: int,
    block_map: dict[int, int]
) -> dict[int, int]:
    operation_map: dict[int, int] = {}
    for operation in Operation.objects.filter(oss_id=source_oss_id).order_by('pk'):
        parent_id = block_map.get(operation.parent_id) if operation.parent_id else None
        new_operation = Operation.objects.create(
            oss_id=clone_oss_id,
            operation_type=operation.operation_type,
            alias=operation.alias,
            title=operation.title,
            description=operation.description,
            parent_id=parent_id,
            result=None
        )
        operation_map[operation.pk] = new_operation.pk
    return operation_map


def _clone_oss_attached_schemas(
    source: LibraryItem,
    clone: LibraryItem,
    owner: User,
    item_data: dict,
) -> tuple[dict[int, int], dict[int, int]]:
    schema_map: dict[int, int] = {}
    cst_map: dict[int, int] = {}
    result_ids = {
        op.result_id
        for op in Operation.objects.filter(oss_id=source.pk).only('result_id')
        if op.result_id is not None
    }
    editor_ids = list(source.getQ_editors().values_list('pk', flat=True))

    for old_schema_id in sorted(result_ids):
        prototype = LibraryItem.objects.get(pk=old_schema_id)
        schema_clone = deepcopy(prototype)
        schema_clone.pk = None
        schema_clone.owner = owner
        schema_clone.visible = False
        schema_clone.read_only = False
        schema_clone.access_policy = item_data.get('access_policy', clone.access_policy)
        schema_clone.location = item_data['location']
        schema_clone.save()

        pairs = PropagationFacade().get_schema(schema_clone.pk).insert_from(old_schema_id)
        schema_map[old_schema_id] = schema_clone.pk
        for old_cst, new_cst in pairs:
            cst_map[old_cst.pk] = new_cst.pk

        if editor_ids:
            Editor.set(schema_clone.pk, editor_ids)

    return schema_map, cst_map


def _apply_oss_operation_results(operation_map: dict[int, int], schema_map: dict[int, int]) -> None:
    updates: list[Operation] = []
    for old_id, new_id in operation_map.items():
        old_operation = Operation.objects.get(pk=old_id)
        if old_operation.result_id is None:
            continue
        new_schema_id = schema_map.get(old_operation.result_id)
        if new_schema_id is None:
            raise ValueError(f'Missing cloned schema for operation result {old_operation.result_id}')
        new_operation = Operation.objects.get(pk=new_id)
        new_operation.result_id = new_schema_id
        updates.append(new_operation)
    if updates:
        Operation.objects.bulk_update(updates, ['result'])


def _clone_oss_arguments(source_oss_id: int, operation_map: dict[int, int]) -> None:
    for argument in Argument.objects.filter(operation__oss_id=source_oss_id).order_by('order', 'pk'):
        operation_id = operation_map.get(argument.operation_id)
        argument_id = operation_map.get(argument.argument_id)
        if operation_id is None or argument_id is None:
            raise ValueError('Argument references operation outside cloned OSS')
        Argument.objects.create(
            operation_id=operation_id,
            argument_id=argument_id,
            order=argument.order
        )


def _clone_oss_replicas(source_oss_id: int, operation_map: dict[int, int]) -> None:
    for replica in Replica.objects.filter(original__oss_id=source_oss_id).order_by('pk'):
        replica_id = operation_map.get(replica.replica_id)
        original_id = operation_map.get(replica.original_id)
        if replica_id is None or original_id is None:
            raise ValueError('Replica references operation outside cloned OSS')
        original = Operation.objects.get(pk=original_id)
        replica_op = Operation.objects.get(pk=replica_id)
        if replica_op.result_id != original.result_id:
            replica_op.result_id = original.result_id
            replica_op.save(update_fields=['result'])
        Replica.objects.create(replica_id=replica_id, original_id=original_id)


def _clone_oss_substitutions(
    source_oss_id: int,
    operation_map: dict[int, int],
    cst_map: dict[int, int]
) -> None:
    for substitution in Substitution.objects.filter(operation__oss_id=source_oss_id).order_by('pk'):
        operation_id = operation_map.get(substitution.operation_id)
        if operation_id is None:
            raise ValueError('Substitution references operation outside cloned OSS')
        original_id = cst_map.get(substitution.original_id)
        substitution_id = cst_map.get(substitution.substitution_id)
        if original_id is None or substitution_id is None:
            raise ValueError('Substitution references uncloned constituent')
        Substitution.objects.create(
            operation_id=operation_id,
            original_id=original_id,
            substitution_id=substitution_id
        )


def _clone_oss_inheritances(
    source_oss_id: int,
    operation_map: dict[int, int],
    cst_map: dict[int, int]
) -> None:
    for inheritance in Inheritance.objects.filter(operation__oss_id=source_oss_id).order_by('pk'):
        operation_id = operation_map.get(inheritance.operation_id)
        if operation_id is None:
            raise ValueError('Inheritance references operation outside cloned OSS')
        parent_id = cst_map.get(inheritance.parent_id)
        child_id = cst_map.get(inheritance.child_id)
        if parent_id is None or child_id is None:
            raise ValueError('Inheritance references uncloned constituent')
        Inheritance.objects.create(
            operation_id=operation_id,
            parent_id=parent_id,
            child_id=child_id
        )


def _clone_oss_layout(
    source_oss_id: int,
    clone_oss_id: int,
    block_map: dict[int, int],
    operation_map: dict[int, int]
) -> None:
    source_layout = Layout.objects.get(oss_id=source_oss_id).data
    new_layout: list[dict] = []
    for node in source_layout:
        node_id = node['nodeID']
        if node_id.startswith('o'):
            old_id = int(node_id[1:])
            new_id = operation_map.get(old_id)
            if new_id is None:
                raise ValueError(f'Layout references unknown operation {old_id}')
            new_layout.append({**node, 'nodeID': f'o{new_id}'})
        elif node_id.startswith('b'):
            old_id = int(node_id[1:])
            new_id = block_map.get(old_id)
            if new_id is None:
                raise ValueError(f'Layout references unknown block {old_id}')
            new_layout.append({**node, 'nodeID': f'b{new_id}'})
        else:
            new_layout.append(dict(node))
    Layout.update_data(clone_oss_id, new_layout)


def _copy_oss_editors(source_oss_id: int, clone_oss_id: int) -> None:
    editor_ids = list(
        LibraryItem.objects.get(pk=source_oss_id).getQ_editors().values_list('pk', flat=True)
    )
    if editor_ids:
        Editor.set(clone_oss_id, editor_ids)
