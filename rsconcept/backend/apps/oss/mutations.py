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
from django.db.models import Q
from rest_framework import serializers
from rest_framework.request import Request

from apps.library.models import AccessPolicy, Editor, LibraryItem
from apps.rsform.models import Constituenta
from apps.rsform.relativization import (
    TEXT_FIELDS, calculate_projection, confirm_projection, draft_revision, parameters_from, require_valid_projection,
)
from apps.rsform.serializers.io_files import create_rsform_from_data
from apps.users.models import User
from shared import messages as msg
from shared import permissions
from shared.concurrency import Conflict, assert_expected_time_update_locked

from . import models as m
from .propagation_batch import propagation_batch
from .propagation_state import mark_schema
from .relativization import correspondence
from .relativization_refresh import prior_texts, refresh_projection


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
        _require_schema_audience(request, new_schema, {source_schema.pk})
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
            _require_schema_audience(request, schema_clone, {prototype.pk})

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


def _lock_relativization(
    item: LibraryItem, data: dict, request: Request, *, editing: bool = False,
) -> tuple[m.Operation, LibraryItem, m.Operation | None]:
    source = m.Operation.objects.filter(oss=item, pk=data['source_operation'].pk).only('result_id').first()
    if source is None or source.result_id is None:
        raise serializers.ValidationError({'source_operation': msg.missingArguments()})

    existing = data.get('existing_operation')
    result_id = None
    if existing is not None:
        result_id = m.Operation.objects.filter(pk=existing.pk, oss=item).values_list('result_id', flat=True).first()
        if result_id is None:
            raise Conflict(detail=msg.concurrentModification())

    # Result text edits and propagation lock the schema before its operation.
    schemas = _require_schema_audience(request, item, {source.result_id}, result_id=result_id)
    source_schema = schemas[source.result_id]
    if source_schema.time_update != data['source_time_update']:
        raise Conflict(detail=msg.concurrentModification())
    if existing is None:
        return source, source_schema, None
    assert result_id is not None
    result = schemas.get(result_id)
    if result is None:
        raise Conflict(detail=msg.concurrentModification())
    if editing:
        _require_editable_schema(request, result)
    elif not permissions.can_read_library_item(request.user, result):
        raise PermissionDenied()

    operation = m.Operation.objects.select_for_update().filter(pk=existing.pk, oss=item).first()
    if (not operation or not operation.projection or operation.result_id != result_id
            or operation.relativization_source_id != source_schema.pk
            or not operation.getQ_arguments().filter(argument=source).exists()):
        raise Conflict(detail=msg.concurrentModification())
    return source, source_schema, operation


def preview_relativization(item: LibraryItem, validated: dict, request: Request) -> dict:
    ''' Calculate the preview from a locked and authorized source snapshot. '''
    with transaction.atomic():
        _lock_expected_update(item, request)
        _, schema, existing = _lock_relativization(item, validated, request)
        parameters = parameters_from(validated)
        draft = calculate_projection(schema.pk, parameters)
        prior = prior_texts(existing, draft) if existing else []
        revision = draft_revision(schema.pk, schema.time_update, draft, parameters, prior)
        return draft | {'revision': revision, 'prior': prior}


@propagation_batch
def create_relativization_operation(item: LibraryItem, validated: dict, request: Request) -> m.Operation:
    ''' Calculate and persist the projection, text provenance, and graph position atomically. '''
    with transaction.atomic():
        _lock_expected_update(item, request)
        source, source_schema, existing = _lock_relativization(item, validated, request, editing=True)
        parameters = parameters_from(validated)
        draft = calculate_projection(source_schema.pk, parameters)
        suggestions = {row['id']: {name: row[name] for name in TEXT_FIELDS} for row in draft['items']}
        checked: set[int] = set()
        if validated['skip_review']:
            require_valid_projection(draft)
        else:
            prior = prior_texts(existing, draft) if existing else []
            revision = draft_revision(source_schema.pk, source_schema.time_update, draft, parameters, prior)
            if validated['revision'] != revision:
                raise Conflict(detail=msg.concurrentModification())
            confirm_projection(draft, validated['edits'], validated['reviewed'])
            checked = set(validated['reviewed']) | {row['id'] for row in validated['edits']}

        data = validated['item_data']
        if not data.get('title'):
            raise serializers.ValidationError({'title': msg.missingArguments()})
        duplicates = m.Operation.objects.filter(oss=item, alias=data['alias'])
        if existing:
            duplicates = duplicates.exclude(pk=existing.pk)
        if duplicates.exists():
            raise Conflict(detail=msg.concurrentModification())
        if existing:
            refresh_projection(existing, parameters, draft, checked, suggestions)
            _update_relativization_details(existing, validated)
            item.save(update_fields=['time_update'])
            return existing
        result, id_map = create_rsform_from_data(
            item_data={
                'alias': data['alias'],
                'title': data['title'],
                'description': data.get('description', ''),
                'visible': False,
                'location': item.location,
                'access_policy': item.access_policy,
            },
            schema_data=draft,
            owner=item.owner,
        )
        Editor.set(result.pk, item.getQ_editors().values_list('pk', flat=True))
        parent = data.get('parent')
        ids = [parameters['target'], *parameters['excluded']]
        constituents = Constituenta.objects.filter(schema_id=source_schema.pk).in_bulk(ids)
        operation = m.OperationSchema(item).record_relativization(
            source, LibraryItem.objects.get(pk=result.pk), constituents[ids[0]],
            [constituents[pk] for pk in ids[1:]], parent_id=parent.pk if parent else None,
        )
        operation.projection = parameters | {
            'rows': correspondence(draft, id_map, checked, suggestions),
            'attribution': [[id_map[pair['container']], id_map[pair['attribute']]] for pair in draft['attribution']],
        }
        operation.save(update_fields=['projection'])

        layout = [*validated['layout'], _node('o', operation.pk, validated['position'])]
        m.Layout.update_data(item.pk, layout)
        return operation


def _update_relativization_details(operation: m.Operation, validated: dict) -> None:
    result = operation.result
    assert result is not None
    data = validated['item_data']
    for name in ('alias', 'title', 'description'):
        if name in data:
            setattr(operation, name, data[name])
            setattr(result, name, data[name])
    parent = data.get('parent')
    if operation.parent_id != (parent.pk if parent else None):
        layout = _without_node(validated['layout'], 'o', operation.pk)
        layout.append(_node('o', operation.pk, validated['position']))
        m.Layout.update_data(operation.oss_id, layout)
        operation.parent = parent
    operation.save(update_fields=['alias', 'title', 'description', 'parent'])
    result.save(update_fields=['alias', 'title', 'description', 'time_update'])


@propagation_batch
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
        _require_argument_audience(request, item, validated['arguments'])
        oss = m.OperationSchema(item)
        new_operation = oss.create_operation(**data)
        layout.append(_node('o', new_operation.pk, validated['position']))
        oss.set_arguments(new_operation.pk, validated['arguments'])
        oss.set_substitutions(new_operation.pk, validated['substitutions'])
        oss.execute_operation(new_operation)
        m.Layout.update_data(item.pk, layout)
        item.save(update_fields=['time_update'])
    return new_operation


@propagation_batch
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
        if 'arguments' in validated:
            _require_argument_audience(request, operation.result or item, validated['arguments'])
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


@propagation_batch
def delete_operation(item: LibraryItem, validated: dict, request: Request | None = None) -> None:
    ''' Delete a non-replica operation and, on request, its result schema. '''
    operation = cast(m.Operation, validated['target'])
    old_schema = operation.result
    layout = _without_node(validated['layout'], 'o', operation.pk)

    with transaction.atomic():
        _lock_expected_update(item, request)
        propagation = m.PropagationFacade()
        oss = propagation.get_oss(item.pk)
        if old_schema is not None:
            if (operation.operation_type in (m.OperationType.SYNTHESIS, m.OperationType.RELATIVIZATION)
                    and not validated['delete_schema']):
                _require_schema_audience(request, old_schema, permissions.source_schema_ids({old_schema.pk}))
            old_schema = LibraryItem.objects.select_for_update().filter(pk=old_schema.pk).first()
            if validated['keep_constituents']:
                _require_retained_audience(request, oss, operation)
        if _has_relativization_dependents(operation, include_replicas=True) or (
            old_schema and validated['delete_schema'] and
            m.Operation.objects.filter(relativization_source=old_schema).exists()
        ):
            raise serializers.ValidationError({'target': 'Remove or reconfigure dependent relativizations first.'})
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


@propagation_batch
def delete_replica(item: LibraryItem, validated: dict, request: Request | None = None) -> None:
    ''' Delete a replica operation. '''
    operation = cast(m.Operation, validated['target'])
    layout = _without_node(validated['layout'], 'o', operation.pk)

    with transaction.atomic():
        _lock_expected_update(item, request)
        if not validated['keep_connections'] and _has_relativization_dependents(operation):
            raise serializers.ValidationError({'target': 'Remove or reconfigure dependent relativizations first.'})
        oss = m.PropagationFacade().get_oss(item.pk)
        if validated['keep_constituents'] and not validated['keep_connections']:
            _require_retained_audience(request, oss, operation)
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


@propagation_batch
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
        if schema is not None:
            destinations = LibraryItem.objects.filter(producer__in=oss.cache.extend_graph.outputs[target.pk]).distinct()
            for destination in destinations:
                _require_schema_audience(request, destination, {schema.pk})
        if old_schema is not None and old_schema.is_synced(item):
            old_schema.visible = True
            old_schema.save(update_fields=['visible'])
        m.Layout.update_data(item.pk, validated['layout'])
        oss.set_input(target.pk, schema)
        item.save(update_fields=['time_update'])


@propagation_batch
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
        arguments = [relation.argument for relation in operation.getQ_arguments().select_related('argument')]
        _require_argument_audience(request, item, arguments)
        oss = m.PropagationFacade().get_oss(item.pk)
        oss.execute_operation(operation)
        m.Layout.update_data(item.pk, validated['layout'])
        item.save(update_fields=['time_update'])


@propagation_batch
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
        _require_schema_audience(request, destination_item, {source_id})

        propagation = m.PropagationFacade()
        oss = propagation.get_oss(item.pk)
        source = propagation.get_schema(source_id)
        relativization_edge = m.Argument.objects.filter(
            operation__oss=item, operation__operation_type=m.OperationType.RELATIVIZATION,
        ).filter(
            Q(operation__result_id=destination, argument__result_id=source_id) |
            Q(operation__result_id=source_id, argument__result_id=destination)
        )
        if relativization_edge.exists():
            raise serializers.ValidationError({'items': 'Constituents cannot be relocated through relativization.'})
        producer = m.Operation.objects.filter(
            operation_type=m.OperationType.RELATIVIZATION, result_id=source_id, projection__isnull=False,
        ).first()
        if producer and producer.projection and any(row['result'] in ids for row in producer.projection['rows']):
            raise serializers.ValidationError({'items': 'Managed relativization constituents cannot be relocated.'})
        if validated['move_down']:
            oss.relocate_down(destination, ids)
            propagation.before_delete_cst(source.pk, ids)
            source.delete_cst(ids)
        else:
            new_items = oss.relocate_up(source.pk, destination, ids)
            propagation.after_create_cst(new_items, exclude=[oss.pk])
        _touch_item(source_item)
        _touch_item(destination_item)
        mark_schema(source_id)
        mark_schema(destination)
        _touch_item(item)


# ====== Internals ============
def _has_relativization_dependents(operation: m.Operation, *, include_replicas: bool = False) -> bool:
    arguments = Q(argument=operation)
    if include_replicas:
        arguments |= Q(argument__replicas__original=operation)
    return m.Argument.objects.filter(
        arguments, operation__operation_type=m.OperationType.RELATIVIZATION,
    ).exists()


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
        item.refresh_from_db()
        if not permissions.can_edit_item(request.user, item):
            raise PermissionDenied()


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


def _require_argument_audience(
    request: Request | None, destination: LibraryItem, operations: list[m.Operation],
) -> None:
    operation_ids = [operation.pk for operation in operations]
    schema_ids = set(m.Operation.objects.filter(pk__in=operation_ids, result_id__isnull=False)
                     .values_list('result_id', flat=True))
    _require_schema_audience(request, destination, schema_ids)


def _require_retained_audience(
    request: Request | None, oss: m.OperationSchemaCached, operation: m.Operation,
) -> None:
    ''' Preserve access restrictions when retaining copies would remove inheritance links. '''
    if operation.result_id is None:
        return
    children = oss.cache.extend_graph.outputs[operation.pk]
    parent_id = operation.result_id
    affected = m.Inheritance.objects.filter(operation_id__in=children, parent__schema_id=parent_id)
    for destination in LibraryItem.objects.filter(pk__in=affected.values('child__schema_id')):
        _require_schema_audience(request, destination, {parent_id})


def _require_schema_audience(
    request: Request | None, destination: LibraryItem, source_ids: set[int], *, result_id: int | None = None,
) -> dict[int, LibraryItem]:
    ''' Check the audience against the locked sources, optionally locking the existing result alongside them. '''
    if not source_ids:
        return {}
    if request is None:
        raise PermissionDenied()

    all_ids = source_ids | permissions.source_schema_ids(source_ids)
    lock_ids = all_ids | {destination.pk}
    if result_id is not None:
        lock_ids.add(result_id)
    locked = {item.pk: item for item in LibraryItem.objects.select_for_update().filter(pk__in=lock_ids).order_by('pk')}
    locked_destination = locked.get(destination.pk)
    if locked_destination is None:
        raise Conflict(detail=msg.concurrentModification())
    readable = LibraryItem.objects.filter(permissions.library_item_read_filter(request.user)).values('pk')
    if not all_ids.issubset(locked) or LibraryItem.objects.filter(pk__in=all_ids).exclude(pk__in=readable).exists():
        raise PermissionDenied('Every source schema must be readable.')

    restricted = [locked[pk] for pk in all_ids if locked[pk].access_policy != AccessPolicy.PUBLIC]
    if not restricted:
        return locked
    if locked_destination.access_policy == AccessPolicy.PUBLIC:
        raise PermissionDenied('The result cannot be shared more widely than its source schemas.')

    audience: set[int] = set()
    if locked_destination.owner_id is not None:
        audience.add(locked_destination.owner_id)
    if locked_destination.access_policy == AccessPolicy.PROTECTED:
        audience.update(Editor.objects.filter(item=locked_destination).values_list('editor_id', flat=True))
    readers = set(User.objects.filter(pk__in=audience, is_staff=False).values_list('pk', flat=True))
    for source in restricted:
        allowed = {source.owner_id}
        if source.access_policy == AccessPolicy.PROTECTED:
            allowed.update(Editor.objects.filter(item=source).values_list('editor_id', flat=True))
        if readers - allowed:
            raise PermissionDenied('The result cannot be shared more widely than its source schemas.')
    return locked


def _schema_label(schema: LibraryItem) -> str:
    ''' Alias and title for an error that names a schema. '''
    if schema.alias and schema.title and schema.alias != schema.title:
        return f'{schema.alias} ({schema.title})'
    return schema.alias or schema.title or str(schema.pk)
