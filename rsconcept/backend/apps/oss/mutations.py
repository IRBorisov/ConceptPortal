''' OSS mutations shared by the UI and the agent API.

Each function takes validated serializer data and returns what the view needs
for its response. Serializers check that targets belong to the OSS; the
preconditions that depend on operation state are checked here.
'''
from __future__ import annotations

from copy import deepcopy
from typing import Optional, cast

from django.core.exceptions import PermissionDenied
from django.db import transaction
from rest_framework import serializers
from rest_framework.request import Request

from apps.library.models import LibraryItem
from shared import messages as msg
from shared import permissions
from shared.concurrency import assert_expected_time_update_locked

from . import models as m


def update_layout(item: LibraryItem, layout: list[dict], request: Request | None = None) -> None:
    ''' Replace the stored graph layout. '''
    with transaction.atomic():
        _lock_expected_update(item, request)
        m.Layout.update_data(item.pk, layout)
        item.save(update_fields=['time_update'])


def create_block(item: LibraryItem, validated: dict, request: Request | None = None) -> m.Block:
    ''' Create a block and adopt the listed child blocks and operations. '''
    layout = validated['layout']
    children_blocks: list[m.Block] = validated['children_blocks']
    children_operations: list[m.Operation] = validated['children_operations']

    with transaction.atomic():
        _lock_expected_update(item, request)
        oss = m.OperationSchema(item)
        new_block = oss.create_block(**validated['item_data'])
        layout.append(_node('b', new_block.pk, validated['position']))
        m.Layout.update_data(item.pk, layout)
        if children_blocks:
            for block in children_blocks:
                block.parent = new_block
            m.Block.objects.bulk_update(children_blocks, ['parent'])
        if children_operations:
            for operation in children_operations:
                operation.parent = new_block
            m.Operation.objects.bulk_update(children_operations, ['parent'])
        item.save(update_fields=['time_update'])
    return new_block


def update_block(item: LibraryItem, validated: dict, request: Request | None = None) -> m.Block:
    ''' Update block attributes and, when given, the layout. '''
    block = cast(m.Block, validated['target'])
    data = validated['item_data']

    with transaction.atomic():
        _lock_expected_update(item, request)
        if 'title' in data:
            block.title = data['title']
        if 'description' in data:
            block.description = data['description']
        if 'parent' in data:
            block.parent = data['parent']
        block.save(update_fields=['title', 'description', 'parent'])
        if 'layout' in validated:
            m.Layout.update_data(item.pk, validated['layout'])
        item.save(update_fields=['time_update'])
    return block


def delete_block(item: LibraryItem, validated: dict, request: Request | None = None) -> None:
    ''' Delete a block. Its children move to the parent of the block. '''
    block = cast(m.Block, validated['target'])
    layout = _without_node(validated['layout'], 'b', block.pk)

    with transaction.atomic():
        _lock_expected_update(item, request)
        m.OperationSchema(item).delete_block(block)
        m.Layout.update_data(item.pk, layout)
        item.save(update_fields=['time_update'])


def move_items(item: LibraryItem, validated: dict, request: Request | None = None) -> None:
    ''' Move operations and blocks into another block or to the root. '''
    destination = validated['destination']

    with transaction.atomic():
        _lock_expected_update(item, request)
        m.Layout.update_data(item.pk, validated['layout'])
        for operation in validated['operations']:
            operation.parent = destination
            operation.save(update_fields=['parent'])
        for block in validated['blocks']:
            block.parent = destination
            block.save(update_fields=['parent'])
        item.save(update_fields=['time_update'])


def create_schema_operation(
    item: LibraryItem,
    validated: dict,
    request: Request | None = None,
) -> m.Operation:
    ''' Create an input operation with a new empty conceptual schema. '''
    layout = validated['layout']
    data = validated['item_data']
    data['operation_type'] = m.OperationType.INPUT

    with transaction.atomic():
        _lock_expected_update(item, request)
        oss = m.OperationSchema(item)
        new_operation = oss.create_operation(**data)
        layout.append(_node('o', new_operation.pk, validated['position']))
        m.Layout.update_data(item.pk, layout)
        m.OperationSchema.create_input(item.pk, new_operation)
        item.save(update_fields=['time_update'])
    return new_operation


def clone_schema_operation(
    item: LibraryItem,
    validated: dict,
    request: Request | None = None,
) -> m.Operation:
    ''' Copy the result schema of an operation into a new input operation. '''
    layout = validated['layout']

    with transaction.atomic():
        _lock_expected_update(item, request)
        source = cast(m.Operation, validated['source_operation'])
        alias = '+' + source.alias
        title = '+' + source.title
        source_schema = cast(LibraryItem, source.result)
        _require_readable_schema(request, source_schema)

        new_schema = deepcopy(source_schema)
        new_schema.pk = None
        new_schema.owner = item.owner
        new_schema.title = title
        new_schema.alias = alias
        new_schema.save()
        m.PropagationFacade().get_schema(new_schema.pk).insert_from(source_schema.pk)

        new_operation = source
        new_operation.pk = None
        new_operation.alias = alias
        new_operation.title = title
        new_operation.operation_type = m.OperationType.INPUT
        new_operation.result = None
        new_operation.save()
        new_operation.setQ_result(new_schema)

        layout.append(_node('o', new_operation.pk, validated['position']))
        m.Layout.update_data(item.pk, layout)
        item.save(update_fields=['time_update'])
    return new_operation


def import_schema_operation(
    item: LibraryItem,
    validated: dict,
    request: Request | None = None,
) -> m.Operation:
    ''' Create an input operation for an existing schema, or for its copy. '''
    layout = validated['layout']
    data = validated['item_data']
    data['operation_type'] = m.OperationType.INPUT
    clone_source = validated['clone_source']
    if not clone_source:
        data['result'] = validated['source']

    with transaction.atomic():
        _lock_expected_update(item, request)
        oss = m.OperationSchema(item)
        new_operation = oss.create_operation(**data)
        layout.append(_node('o', new_operation.pk, validated['position']))
        m.Layout.update_data(item.pk, layout)

        if clone_source:
            prototype: LibraryItem = validated['source']

            schema_clone = deepcopy(prototype)
            schema_clone.pk = None
            schema_clone.owner = item.owner
            schema_clone.title = new_operation.title
            schema_clone.alias = new_operation.alias
            schema_clone.description = new_operation.description
            schema_clone.visible = False
            schema_clone.read_only = False
            schema_clone.access_policy = item.access_policy
            schema_clone.location = item.location
            schema_clone.save()

            m.PropagationFacade().get_schema(schema_clone.pk).insert_from(prototype.pk)

            new_operation.result = schema_clone
            new_operation.save(update_fields=['result'])

        item.save(update_fields=['time_update'])
    return new_operation


def create_replica_operation(
    item: LibraryItem,
    validated: dict,
    request: Request | None = None,
) -> m.Operation:
    ''' Create a replica that points at the target operation. '''
    layout = validated['layout']

    with transaction.atomic():
        _lock_expected_update(item, request)
        oss = m.OperationSchema(item)
        target = cast(m.Operation, validated['target'])
        new_operation = oss.create_replica(target)
        layout.append(_node('o', new_operation.pk, validated['position']))
        m.Layout.update_data(item.pk, layout)
        item.save(update_fields=['time_update'])
    return new_operation


def create_synthesis_operation(
    item: LibraryItem,
    validated: dict,
    request: Request | None = None,
) -> m.Operation:
    ''' Create a synthesis operation and build its result schema. '''
    layout = validated['layout']
    data = validated['item_data']
    data['operation_type'] = m.OperationType.SYNTHESIS

    with transaction.atomic():
        _lock_expected_update(item, request)
        oss = m.OperationSchema(item)
        new_operation = oss.create_operation(**data)
        layout.append(_node('o', new_operation.pk, validated['position']))
        oss.set_arguments(new_operation.pk, validated['arguments'])
        oss.set_substitutions(new_operation.pk, validated['substitutions'])
        oss.execute_operation(new_operation)
        m.Layout.update_data(item.pk, layout)
        item.save(update_fields=['time_update'])
    return new_operation


def update_operation(
    item: LibraryItem,
    validated: dict,
    user,
    request: Request | None = None,
) -> m.Operation:
    ''' Update operation attributes, arguments and substitutions. '''
    operation = cast(m.Operation, validated['target'])
    data = validated['item_data']

    with transaction.atomic():
        _lock_expected_update(item, request)
        oss = m.PropagationFacade().get_oss(item.pk)
        if 'layout' in validated:
            m.Layout.update_data(item.pk, validated['layout'])
        if 'alias' in data:
            operation.alias = data['alias']
        if 'title' in data:
            operation.title = data['title']
        if 'description' in data:
            operation.description = data['description']
        if 'parent' in data:
            operation.parent = data['parent']
        operation.save(update_fields=['alias', 'title', 'description', 'parent'])

        if operation.result is not None and permissions.can_edit_item(user, operation.result):
            operation.result.alias = operation.alias
            operation.result.title = operation.title
            operation.result.description = operation.description
            operation.result.save()
        if 'arguments' in validated:
            oss.set_arguments(operation.pk, validated['arguments'])
        if 'substitutions' in validated:
            oss.set_substitutions(operation.pk, validated['substitutions'])
        item.save(update_fields=['time_update'])
    return operation


def delete_operation(item: LibraryItem, validated: dict, request: Request | None = None) -> None:
    ''' Delete a non-replica operation and, on request, its result schema. '''
    operation = cast(m.Operation, validated['target'])
    old_schema = operation.result
    layout = _without_node(validated['layout'], 'o', operation.pk)

    with transaction.atomic():
        _lock_expected_update(item, request)
        propagation = m.PropagationFacade()
        oss = propagation.get_oss(item.pk)
        oss.delete_operation(operation.pk, validated['keep_constituents'])
        m.Layout.update_data(item.pk, layout)
        if old_schema is not None:
            if validated['delete_schema']:
                propagation.before_delete_schema(old_schema.pk)
                old_schema.delete()
            elif old_schema.is_synced(item):
                old_schema.visible = True
                old_schema.save(update_fields=['visible', 'time_update'])
        item.save(update_fields=['time_update'])


def delete_replica(item: LibraryItem, validated: dict, request: Request | None = None) -> None:
    ''' Delete a replica operation. '''
    operation = cast(m.Operation, validated['target'])
    layout = _without_node(validated['layout'], 'o', operation.pk)

    with transaction.atomic():
        _lock_expected_update(item, request)
        oss = m.PropagationFacade().get_oss(item.pk)
        m.Layout.update_data(item.pk, layout)
        oss.delete_replica(
            operation.pk,
            validated['keep_connections'],
            validated['keep_constituents'],
        )
        item.save(update_fields=['time_update'])


def create_input_schema(
    item: LibraryItem,
    validated: dict,
    request: Request | None = None,
) -> LibraryItem:
    ''' Create an empty result schema for an operation without arguments. '''
    operation = cast(m.Operation, validated['target'])
    if len(operation.getQ_arguments()) > 0:
        raise serializers.ValidationError({
            'target': msg.operationHasArguments(operation.alias)
        })
    if operation.result is not None:
        raise serializers.ValidationError({
            'target': msg.operationResultNotEmpty(operation.alias)
        })

    with transaction.atomic():
        _lock_expected_update(item, request)
        m.Layout.update_data(item.pk, validated['layout'])
        schema = m.OperationSchema.create_input(item.pk, operation)
        item.save(update_fields=['time_update'])
    return schema


def set_operation_input(item: LibraryItem, validated: dict, request: Request | None = None) -> None:
    ''' Attach a schema to an input operation, or detach it with ``None``. '''
    target = cast(m.Operation, validated['target'])
    schema: Optional[LibraryItem] = validated['input']
    if schema is not None:
        connected = m.Operation.objects.filter(result=schema).only('operation_type', 'oss_id')
        for operation in connected:
            if operation.operation_type != m.OperationType.INPUT:
                raise serializers.ValidationError({
                    'input': msg.operationResultFromAnotherOSS()
                })
            if operation != target and operation.oss_id == target.oss_id:
                raise serializers.ValidationError({
                    'input': msg.operationInputAlreadyConnected()
                })
    old_schema = target.result

    with transaction.atomic():
        _lock_expected_update(item, request)
        oss = m.PropagationFacade().get_oss(item.pk)
        if old_schema is not None and old_schema.is_synced(item):
            old_schema.visible = True
            old_schema.save(update_fields=['visible'])
        m.Layout.update_data(item.pk, validated['layout'])
        oss.set_input(target.pk, schema)
        item.save(update_fields=['time_update'])


def execute_operation(item: LibraryItem, validated: dict, request: Request | None = None) -> None:
    ''' Build the result schema of a synthesis operation. '''
    operation = cast(m.Operation, validated['target'])
    if operation.operation_type != m.OperationType.SYNTHESIS:
        raise serializers.ValidationError({
            'target': msg.operationNotSynthesis(operation.alias)
        })
    if operation.result is not None:
        raise serializers.ValidationError({
            'target': msg.operationResultNotEmpty(operation.alias)
        })

    with transaction.atomic():
        _lock_expected_update(item, request)
        oss = m.PropagationFacade().get_oss(item.pk)
        oss.execute_operation(operation)
        m.Layout.update_data(item.pk, validated['layout'])
        item.save(update_fields=['time_update'])


def relocate_constituents(item: LibraryItem, validated: dict, request: Request | None = None) -> None:
    ''' Move constituents between connected schemas of the OSS. '''
    ids = [cst.pk for cst in validated['items']]
    destination = validated['destination']
    source_id = validated['source']

    with transaction.atomic():
        _lock_expected_update(item, request)
        source_item = LibraryItem.objects.get(pk=source_id)
        destination_item = LibraryItem.objects.get(pk=destination)
        _require_editable_schema(request, source_item)
        _require_editable_schema(request, destination_item)

        propagation = m.PropagationFacade()
        oss = propagation.get_oss(item.pk)
        source = propagation.get_schema(source_id)
        if validated['move_down']:
            oss.relocate_down(destination, ids)
            propagation.before_delete_cst(source.pk, ids)
            source.delete_cst(ids)
        else:
            new_items = oss.relocate_up(source.pk, destination, ids)
            propagation.after_create_cst(new_items, exclude=[oss.pk])
        _touch_item(source_item)
        _touch_item(destination_item)
        _touch_item(item)


# ====== Internals ============
def _node(prefix: str, pk: int, position: dict) -> dict:
    ''' Layout node for a new operation (``o``) or block (``b``). '''
    return {
        'nodeID': prefix + str(pk),
        'x': position['x'],
        'y': position['y'],
        'width': position['width'],
        'height': position['height'],
    }


def _without_node(layout: list[dict], prefix: str, pk: int) -> list[dict]:
    ''' Layout without the node of a deleted operation or block. '''
    node_id = prefix + str(pk)
    return [node for node in layout if node['nodeID'] != node_id]


def _lock_expected_update(item: LibraryItem, request: Request | None) -> None:
    ''' Reject a stale ``X-Expected-Time-Update`` under a row lock. '''
    if request is not None:
        assert_expected_time_update_locked(item, request)


def _touch_item(item: LibraryItem) -> None:
    ''' Bump the optimistic-concurrency token. '''
    item.save(update_fields=['time_update'])


def _require_editable_schema(request: Request | None, schema: LibraryItem) -> None:
    ''' Reject a write into a schema the caller cannot edit. '''
    if request is None or not permissions.can_edit_item(request.user, schema):
        raise PermissionDenied()


def _require_readable_schema(request: Request | None, schema: LibraryItem) -> None:
    ''' Reject a copy of a schema the caller cannot read. '''
    if request is None or not permissions.can_read_library_item(request.user, schema):
        raise PermissionDenied(msg.schemasNotReadable([_schema_label(schema)]))


def _schema_label(schema: LibraryItem) -> str:
    ''' Alias and title for an error that names a schema. '''
    if schema.alias and schema.title and schema.alias != schema.title:
        return f'{schema.alias} ({schema.title})'
    return schema.alias or schema.title or str(schema.pk)
