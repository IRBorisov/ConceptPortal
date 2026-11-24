''' Views: agent operation schema (OSS) read/write (API key auth).

Bodies match the session routes under ``/api/oss/:id``. ``layout`` and
``position`` are optional: without them the stored layout is kept and new or
moved nodes are placed by the same rules the UI uses.

Each change runs in one transaction that locks the OSS row before the stored
layout is read, so a concurrent edit cannot be overwritten by a stale copy.
'''
from __future__ import annotations

from typing import Any, cast

from django.db import transaction
from django.http import HttpResponse
from drf_spectacular.utils import extend_schema
from rest_framework import status as c
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.request import Request
from rest_framework.response import Response

from apps.library.models import LibraryItem, LibraryItemType
from apps.library.serializers import LibraryItemCreateSerializer, LibraryItemSerializer
from apps.library.services.location_access import assert_can_write_location
from apps.oss import models as oss_models
from apps.oss import mutations
from apps.oss import serializers as oss_serializers

from ..services.oss_layout import (
    OssLayoutPlanner,
    block_node_id,
    current_layout,
    default_block_rect,
    default_operation_rect,
    operation_node_id
)
from .base import AgentItemView


class AgentOssBase(AgentItemView):
    ''' Shared lookup and payload defaults for agent OSS routes. '''

    def _get_oss(self, pk: int) -> LibraryItem:
        ''' Load an operation schema or answer 404 for another library type. '''
        return self._get_item(pk, LibraryItemType.OPERATION_SCHEMA)

    def _get_editable_oss(self, pk: int) -> LibraryItem:
        ''' Lock an operation schema the key user may change. Call inside a transaction. '''
        try:
            item = LibraryItem.objects.select_for_update().get(
                pk=pk,
                item_type=LibraryItemType.OPERATION_SCHEMA,
            )
        except LibraryItem.DoesNotExist as exc:
            raise NotFound() from exc
        self._require_edit(item)
        return item

    def _payload(
        self,
        item: LibraryItem,
        *,
        with_layout: bool = True,
        position: str | None = None,
    ) -> tuple[dict, bool]:
        ''' Request body with the stored layout and a placeholder position filled in.

        Returns the body and whether the server must choose the position.
        '''
        raw = self.request.data
        if not isinstance(raw, dict):
            raise ValidationError({'non_field_errors': 'Expected a JSON object'})
        data: dict[str, Any] = dict(raw)
        if with_layout and 'layout' not in data:
            data['layout'] = current_layout(item)

        auto_position = False
        if position is not None:
            defaults = default_block_rect() if position == 'block' else default_operation_rect()
            given = data.get('position')
            if given is None:
                data['position'] = defaults
                auto_position = True
            elif isinstance(given, dict):
                size = {'width': defaults['width'], 'height': defaults['height']}
                data['position'] = size | given
        return data, auto_position

    def _planner(self, item: LibraryItem, validated: dict) -> OssLayoutPlanner:
        ''' Planner bound to the layout that the mutation will store. '''
        if 'layout' not in validated:
            validated['layout'] = current_layout(item)
        return OssLayoutPlanner(item, validated['layout'])

    def _commit(self, item: LibraryItem, summary: str, apply, status: int = c.HTTP_200_OK) -> Any:
        ''' Run the mutation and its action-log row in one transaction. '''
        with transaction.atomic():
            result = apply()
            self._log(cast(str, self.agent_action), status, summary=summary, item=item)
        return result

    def _details(self, item: LibraryItem) -> dict:
        ''' Full OSS payload for the response. '''
        return oss_serializers.OperationSchemaSerializer(item).data

    def _operation_created(self, item: LibraryItem, operation: oss_models.Operation) -> HttpResponse:
        ''' Response for a route that adds one operation. '''
        return Response(
            status=c.HTTP_201_CREATED,
            data={'new_operation': operation.pk, 'oss': self._details(item)},
        )


def _parent_id(item_data: dict) -> int | None:
    ''' Primary key of ``item_data.parent`` or ``None``. '''
    parent = item_data.get('parent')
    return parent.pk if parent is not None else None


@extend_schema(
    tags=['Agents'],
    summary='Create operation schema library item',
    request=LibraryItemCreateSerializer,
    responses={c.HTTP_201_CREATED: oss_serializers.OperationSchemaSerializer},
)
class AgentOssCreateView(AgentOssBase):
    ''' Agent: create empty OSS. '''
    agent_action = 'oss.create'
    agent_heavy = True

    def post(self, request: Request) -> HttpResponse:
        ''' Create an empty OSS owned by the key user. '''
        if not isinstance(request.data, dict):
            raise ValidationError({'non_field_errors': 'Expected a JSON object'})
        data = dict(request.data)
        data['item_type'] = LibraryItemType.OPERATION_SCHEMA
        serializer = LibraryItemCreateSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        location = serializer.validated_data.get('location')
        if location:
            assert_can_write_location(request.user, location)

        with transaction.atomic():
            item = serializer.save(owner=request.user)
            oss_models.Layout.objects.create(oss=item, data=[])
            self._log('oss.create', c.HTTP_201_CREATED, summary=f'Created {item.alias}', item=item)
        return Response(status=c.HTTP_201_CREATED, data=self._details(item))


@extend_schema(
    tags=['Agents'],
    summary='Get operation schema details',
    responses={c.HTTP_200_OK: oss_serializers.OperationSchemaSerializer},
)
class AgentOssDetailsView(AgentOssBase):
    ''' Agent: operations, blocks, arguments, substitutions and layout. '''

    def get(self, request: Request, pk: int) -> HttpResponse:
        ''' Return the OSS graph. '''
        item = self._get_oss(pk)
        self._require_read(item)
        return Response(self._details(item))


@extend_schema(
    tags=['Agents'],
    summary='Replace operation schema layout',
    request=oss_serializers.LayoutSerializer,
    responses={c.HTTP_200_OK: oss_serializers.OperationSchemaSerializer},
)
class AgentOssUpdateLayoutView(AgentOssBase):
    ''' Agent: replace node positions. '''
    agent_action = 'oss.update_layout'

    @transaction.atomic
    def patch(self, request: Request, pk: int) -> HttpResponse:
        ''' Store the given layout. '''
        item = self._get_editable_oss(pk)
        serializer = oss_serializers.LayoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        layout = serializer.validated_data['data']
        self._commit(
            item,
            f'Layout of {len(layout)} node(s)',
            lambda: mutations.update_layout(item, layout, request),
        )
        return Response(self._details(item))


@extend_schema(
    tags=['Agents'],
    summary='Create block',
    request=oss_serializers.CreateBlockSerializer,
    responses={c.HTTP_201_CREATED: oss_serializers.BlockCreatedResponse},
)
class AgentOssCreateBlockView(AgentOssBase):
    ''' Agent: create a block, optionally around existing nodes. '''
    agent_action = 'oss.create_block'

    @transaction.atomic
    def post(self, request: Request, pk: int) -> HttpResponse:
        ''' Create a block and place it when no position is given. '''
        item = self._get_editable_oss(pk)
        data, auto_position = self._payload(item, position='block')
        data.setdefault('children_operations', [])
        data.setdefault('children_blocks', [])
        serializer = oss_serializers.CreateBlockSerializer(data=data, context={'oss': item})
        serializer.is_valid(raise_exception=True)
        validated = serializer.validated_data
        if auto_position:
            validated['position'] = self._planner(item, validated).new_block_position(
                validated['position'],
                _parent_id(validated['item_data']),
                [block.pk for block in validated['children_blocks']],
                [operation.pk for operation in validated['children_operations']],
            )
        block = self._commit(
            item,
            f'Created block {validated["item_data"].get("title", "")}',
            lambda: mutations.create_block(item, validated, request),
            status=c.HTTP_201_CREATED,
        )
        return Response(
            status=c.HTTP_201_CREATED,
            data={'new_block': block.pk, 'oss': self._details(item)},
        )


@extend_schema(
    tags=['Agents'],
    summary='Update block',
    request=oss_serializers.UpdateBlockSerializer,
    responses={c.HTTP_200_OK: oss_serializers.OperationSchemaSerializer},
)
class AgentOssUpdateBlockView(AgentOssBase):
    ''' Agent: rename a block or move it to another parent. '''
    agent_action = 'oss.update_block'

    @transaction.atomic
    def patch(self, request: Request, pk: int) -> HttpResponse:
        ''' Update block attributes and keep its node inside the new parent. '''
        item = self._get_editable_oss(pk)
        data, _ = self._payload(item, with_layout=False)
        serializer = oss_serializers.UpdateBlockSerializer(data=data, context={'oss': item})
        serializer.is_valid(raise_exception=True)
        validated = serializer.validated_data
        block = cast(oss_models.Block, validated['target'])
        item_data = validated['item_data']
        if 'layout' not in validated and 'parent' in item_data and _parent_id(item_data) != block.parent_id:
            self._planner(item, validated).change_parent(block_node_id(block.pk), _parent_id(item_data))
        self._commit(
            item,
            f'Updated block {block.pk}',
            lambda: mutations.update_block(item, validated, request),
        )
        return Response(self._details(item))


@extend_schema(
    tags=['Agents'],
    summary='Delete block',
    request=oss_serializers.DeleteBlockSerializer,
    responses={c.HTTP_200_OK: oss_serializers.OperationSchemaSerializer},
)
class AgentOssDeleteBlockView(AgentOssBase):
    ''' Agent: delete a block; its children move to its parent. '''
    agent_action = 'oss.delete_block'

    @transaction.atomic
    def patch(self, request: Request, pk: int) -> HttpResponse:
        ''' Delete the block and drop its node. '''
        item = self._get_editable_oss(pk)
        data, _ = self._payload(item)
        serializer = oss_serializers.DeleteBlockSerializer(data=data, context={'oss': item})
        serializer.is_valid(raise_exception=True)
        validated = serializer.validated_data
        block = cast(oss_models.Block, validated['target'])
        self._commit(
            item,
            f'Deleted block {block.pk}',
            lambda: mutations.delete_block(item, validated, request),
        )
        return Response(self._details(item))


@extend_schema(
    tags=['Agents'],
    summary='Move operations and blocks to another block',
    request=oss_serializers.MoveItemsSerializer,
    responses={c.HTTP_200_OK: oss_serializers.OperationSchemaSerializer},
)
class AgentOssMoveItemsView(AgentOssBase):
    ''' Agent: change the parent block of several nodes. '''
    agent_action = 'oss.move_items'

    @transaction.atomic
    def patch(self, request: Request, pk: int) -> HttpResponse:
        ''' Move nodes and, without a layout, fit them into the destination. '''
        item = self._get_editable_oss(pk)
        data, _ = self._payload(item)
        layout_given = 'layout' in request.data
        serializer = oss_serializers.MoveItemsSerializer(data=data, context={'oss': item})
        serializer.is_valid(raise_exception=True)
        validated = serializer.validated_data
        destination = validated['destination']
        destination_id = destination.pk if destination is not None else None
        if not layout_given:
            planner = self._planner(item, validated)
            for block in validated['blocks']:
                if block.parent_id != destination_id:
                    planner.change_parent(block_node_id(block.pk), destination_id)
            for operation in validated['operations']:
                if operation.parent_id != destination_id:
                    planner.change_parent(operation_node_id(operation.pk), destination_id)
        count = len(validated['blocks']) + len(validated['operations'])
        self._commit(
            item,
            f'Moved {count} item(s) to {destination_id or "root"}',
            lambda: mutations.move_items(item, validated, request),
        )
        return Response(self._details(item))


@extend_schema(
    tags=['Agents'],
    summary='Create input operation with a new empty schema',
    request=oss_serializers.CreateSchemaSerializer,
    responses={c.HTTP_201_CREATED: oss_serializers.OperationCreatedResponse},
)
class AgentOssCreateSchemaView(AgentOssBase):
    ''' Agent: new input operation and its empty conceptual schema. '''
    agent_action = 'oss.create_schema'
    agent_heavy = True

    @transaction.atomic
    def post(self, request: Request, pk: int) -> HttpResponse:
        ''' Create the operation and its schema. '''
        item = self._get_editable_oss(pk)
        data, auto_position = self._payload(item, position='operation')
        serializer = oss_serializers.CreateSchemaSerializer(data=data, context={'oss': item})
        serializer.is_valid(raise_exception=True)
        validated = serializer.validated_data
        if auto_position:
            validated['position'] = self._planner(item, validated).new_operation_position(
                validated['position'],
                _parent_id(validated['item_data']),
            )
        operation = self._commit(
            item,
            f'Created input {validated["item_data"]["alias"]}',
            lambda: mutations.create_schema_operation(item, validated, request),
            status=c.HTTP_201_CREATED,
        )
        return self._operation_created(item, operation)


@extend_schema(
    tags=['Agents'],
    summary='Import an existing schema as an input operation',
    request=oss_serializers.ImportSchemaSerializer,
    responses={c.HTTP_201_CREATED: oss_serializers.OperationCreatedResponse},
)
class AgentOssImportSchemaView(AgentOssBase):
    ''' Agent: attach a schema the key user can read, or a copy of it. '''
    agent_action = 'oss.import_schema'
    agent_heavy = True

    @transaction.atomic
    def post(self, request: Request, pk: int) -> HttpResponse:
        ''' Create the input operation for the source schema. '''
        item = self._get_editable_oss(pk)
        data, auto_position = self._payload(item, position='operation')
        serializer = oss_serializers.ImportSchemaSerializer(
            data=data,
            context={'oss': item, 'request': request},
        )
        serializer.is_valid(raise_exception=True)
        validated = serializer.validated_data
        if auto_position:
            validated['position'] = self._planner(item, validated).new_operation_position(
                validated['position'],
                _parent_id(validated['item_data']),
            )
        source = cast(LibraryItem, validated['source'])
        mode = 'copy of' if validated['clone_source'] else 'link to'
        operation = self._commit(
            item,
            f'Imported {mode} {source.alias}',
            lambda: mutations.import_schema_operation(item, validated, request),
            status=c.HTTP_201_CREATED,
        )
        return self._operation_created(item, operation)


@extend_schema(
    tags=['Agents'],
    summary='Clone the result schema of an operation',
    request=oss_serializers.CloneSchemaSerializer,
    responses={c.HTTP_201_CREATED: oss_serializers.OperationCreatedResponse},
)
class AgentOssCloneSchemaView(AgentOssBase):
    ''' Agent: copy an operation result into a new input operation. '''
    agent_action = 'oss.clone_schema'
    agent_heavy = True

    @transaction.atomic
    def post(self, request: Request, pk: int) -> HttpResponse:
        ''' Clone the schema next to its source. '''
        item = self._get_editable_oss(pk)
        data, auto_position = self._payload(item, position='operation')
        serializer = oss_serializers.CloneSchemaSerializer(data=data, context={'oss': item})
        serializer.is_valid(raise_exception=True)
        validated = serializer.validated_data
        source = cast(oss_models.Operation, validated['source_operation'])
        source_alias = source.alias
        if auto_position:
            validated['position'] = self._planner(item, validated).new_clone_position(
                source.pk,
                source.parent_id,
            )
        operation = self._commit(
            item,
            f'Cloned {source_alias}',
            lambda: mutations.clone_schema_operation(item, validated, request),
            status=c.HTTP_201_CREATED,
        )
        return self._operation_created(item, operation)


@extend_schema(
    tags=['Agents'],
    summary='Create replica of an operation',
    request=oss_serializers.CreateReplicaSerializer,
    responses={c.HTTP_201_CREATED: oss_serializers.OperationCreatedResponse},
)
class AgentOssCreateReplicaView(AgentOssBase):
    ''' Agent: replica node that reuses the result of its target. '''
    agent_action = 'oss.create_replica'

    @transaction.atomic
    def post(self, request: Request, pk: int) -> HttpResponse:
        ''' Create the replica next to its target. '''
        item = self._get_editable_oss(pk)
        data, auto_position = self._payload(item, position='operation')
        serializer = oss_serializers.CreateReplicaSerializer(data=data, context={'oss': item})
        serializer.is_valid(raise_exception=True)
        validated = serializer.validated_data
        target = cast(oss_models.Operation, validated['target'])
        if auto_position:
            validated['position'] = self._planner(item, validated).new_clone_position(
                target.pk,
                target.parent_id,
            )
        operation = self._commit(
            item,
            f'Replicated {target.alias}',
            lambda: mutations.create_replica_operation(item, validated, request),
            status=c.HTTP_201_CREATED,
        )
        return self._operation_created(item, operation)


@extend_schema(
    tags=['Agents'],
    summary='Create synthesis operation and build its schema',
    request=oss_serializers.CreateSynthesisSerializer,
    responses={c.HTTP_201_CREATED: oss_serializers.OperationCreatedResponse},
)
class AgentOssCreateSynthesisView(AgentOssBase):
    ''' Agent: synthesis from arguments and substitutions. '''
    agent_action = 'oss.create_synthesis'
    agent_heavy = True

    @transaction.atomic
    def post(self, request: Request, pk: int) -> HttpResponse:
        ''' Create the operation below its arguments and execute it. '''
        item = self._get_editable_oss(pk)
        data, auto_position = self._payload(item, position='operation')
        data.setdefault('substitutions', [])
        serializer = oss_serializers.CreateSynthesisSerializer(data=data, context={'oss': item})
        serializer.is_valid(raise_exception=True)
        validated = serializer.validated_data
        if auto_position:
            validated['position'] = self._planner(item, validated).new_operation_position(
                validated['position'],
                _parent_id(validated['item_data']),
                [operation.pk for operation in validated['arguments']],
            )
        operation = self._commit(
            item,
            f'Created synthesis {validated["item_data"]["alias"]}',
            lambda: mutations.create_synthesis_operation(item, validated, request),
            status=c.HTTP_201_CREATED,
        )
        return self._operation_created(item, operation)


@extend_schema(
    tags=['Agents'],
    summary='Update operation',
    request=oss_serializers.UpdateOperationSerializer,
    responses={c.HTTP_200_OK: oss_serializers.OperationSchemaSerializer},
)
class AgentOssUpdateOperationView(AgentOssBase):
    ''' Agent: attributes, parent, arguments and substitutions of an operation. '''
    agent_action = 'oss.update_operation'

    @transaction.atomic
    def patch(self, request: Request, pk: int) -> HttpResponse:
        ''' Update the operation and keep its node inside the new parent. '''
        item = self._get_editable_oss(pk)
        data, _ = self._payload(item, with_layout=False)
        serializer = oss_serializers.UpdateOperationSerializer(data=data, context={'oss': item})
        serializer.is_valid(raise_exception=True)
        validated = serializer.validated_data
        operation = cast(oss_models.Operation, validated['target'])
        item_data = validated['item_data']
        if 'layout' not in validated and 'parent' in item_data and _parent_id(item_data) != operation.parent_id:
            self._planner(item, validated).change_parent(
                operation_node_id(operation.pk),
                _parent_id(item_data),
            )
        self._commit(
            item,
            f'Updated operation {operation.alias}',
            lambda: mutations.update_operation(item, validated, request.user, request),
        )
        return Response(self._details(item))


@extend_schema(
    tags=['Agents'],
    summary='Delete operation',
    request=oss_serializers.DeleteOperationSerializer,
    responses={c.HTTP_200_OK: oss_serializers.OperationSchemaSerializer},
)
class AgentOssDeleteOperationView(AgentOssBase):
    ''' Agent: delete a non-replica operation. '''
    agent_action = 'oss.delete_operation'

    @transaction.atomic
    def patch(self, request: Request, pk: int) -> HttpResponse:
        ''' Delete the operation and, with ``delete_schema``, its result schema. '''
        item = self._get_editable_oss(pk)
        data, _ = self._payload(item)
        serializer = oss_serializers.DeleteOperationSerializer(data=data, context={'oss': item})
        serializer.is_valid(raise_exception=True)
        validated = serializer.validated_data
        operation = cast(oss_models.Operation, validated['target'])
        alias = operation.alias
        suffix = ' and its schema' if validated['delete_schema'] else ''
        self._commit(
            item,
            f'Deleted operation {alias}{suffix}',
            lambda: mutations.delete_operation(item, validated, request),
        )
        return Response(self._details(item))


@extend_schema(
    tags=['Agents'],
    summary='Delete replica',
    request=oss_serializers.DeleteReplicaSerializer,
    responses={c.HTTP_200_OK: oss_serializers.OperationSchemaSerializer},
)
class AgentOssDeleteReplicaView(AgentOssBase):
    ''' Agent: delete a replica operation. '''
    agent_action = 'oss.delete_replica'

    @transaction.atomic
    def patch(self, request: Request, pk: int) -> HttpResponse:
        ''' Delete the replica. '''
        item = self._get_editable_oss(pk)
        data, _ = self._payload(item)
        serializer = oss_serializers.DeleteReplicaSerializer(data=data, context={'oss': item})
        serializer.is_valid(raise_exception=True)
        validated = serializer.validated_data
        operation = cast(oss_models.Operation, validated['target'])
        self._commit(
            item,
            f'Deleted replica {operation.pk}',
            lambda: mutations.delete_replica(item, validated, request),
        )
        return Response(self._details(item))


@extend_schema(
    tags=['Agents'],
    summary='Create empty schema for an operation without arguments',
    request=oss_serializers.TargetOperationSerializer,
    responses={c.HTTP_200_OK: oss_serializers.SchemaCreatedResponse},
)
class AgentOssCreateInputView(AgentOssBase):
    ''' Agent: new empty result schema for an input operation. '''
    agent_action = 'oss.create_input'
    agent_heavy = True

    @transaction.atomic
    def patch(self, request: Request, pk: int) -> HttpResponse:
        ''' Create the schema and link it to the operation. '''
        item = self._get_editable_oss(pk)
        data, _ = self._payload(item)
        serializer = oss_serializers.TargetOperationSerializer(data=data, context={'oss': item})
        serializer.is_valid(raise_exception=True)
        validated = serializer.validated_data
        operation = cast(oss_models.Operation, validated['target'])
        schema = self._commit(
            item,
            f'Created schema for {operation.alias}',
            lambda: mutations.create_input_schema(item, validated, request),
        )
        return Response({
            'new_schema': LibraryItemSerializer(schema).data,
            'oss': self._details(item),
        })


@extend_schema(
    tags=['Agents'],
    summary='Set or clear the schema of an input operation',
    request=oss_serializers.SetOperationInputSerializer,
    responses={c.HTTP_200_OK: oss_serializers.OperationSchemaSerializer},
)
class AgentOssSetInputView(AgentOssBase):
    ''' Agent: link a readable schema to an input operation, or unlink it. '''
    agent_action = 'oss.set_input'

    @transaction.atomic
    def patch(self, request: Request, pk: int) -> HttpResponse:
        ''' Replace the result schema of the input operation. '''
        item = self._get_editable_oss(pk)
        data, _ = self._payload(item)
        serializer = oss_serializers.SetOperationInputSerializer(
            data=data,
            context={'oss': item, 'request': request},
        )
        serializer.is_valid(raise_exception=True)
        validated = serializer.validated_data
        operation = cast(oss_models.Operation, validated['target'])
        schema = cast(LibraryItem | None, validated['input'])
        summary = f'Set input of {operation.alias} to {schema.alias if schema else "none"}'
        self._commit(
            item,
            summary,
            lambda: mutations.set_operation_input(item, validated, request),
        )
        return Response(self._details(item))


@extend_schema(
    tags=['Agents'],
    summary='Execute synthesis operation',
    request=oss_serializers.TargetOperationSerializer,
    responses={c.HTTP_200_OK: oss_serializers.OperationSchemaSerializer},
)
class AgentOssExecuteOperationView(AgentOssBase):
    ''' Agent: build the result schema of a synthesis operation. '''
    agent_action = 'oss.execute_operation'
    agent_heavy = True

    @transaction.atomic
    def post(self, request: Request, pk: int) -> HttpResponse:
        ''' Execute the synthesis. '''
        item = self._get_editable_oss(pk)
        data, _ = self._payload(item)
        serializer = oss_serializers.TargetOperationSerializer(data=data, context={'oss': item})
        serializer.is_valid(raise_exception=True)
        validated = serializer.validated_data
        operation = cast(oss_models.Operation, validated['target'])
        self._commit(
            item,
            f'Executed {operation.alias}',
            lambda: mutations.execute_operation(item, validated, request),
        )
        return Response(self._details(item))


@extend_schema(
    tags=['Agents'],
    summary='Relocate constituents between connected schemas',
    request=oss_serializers.RelocateConstituentsSerializer,
    responses={c.HTTP_200_OK: oss_serializers.OperationSchemaSerializer},
)
class AgentOssRelocateConstituentsView(AgentOssBase):
    ''' Agent: move constituents up or down one synthesis step. '''
    agent_action = 'oss.relocate_constituents'

    @transaction.atomic
    def post(self, request: Request, pk: int) -> HttpResponse:
        ''' Move the constituents and return the OSS. '''
        item = self._get_editable_oss(pk)
        serializer = oss_serializers.RelocateConstituentsSerializer(
            data=request.data,
            context={'oss': item},
        )
        serializer.is_valid(raise_exception=True)
        validated = serializer.validated_data
        direction = 'down' if validated['move_down'] else 'up'
        self._commit(
            item,
            f'Relocated {len(validated["items"])} constituent(s) {direction}',
            lambda: mutations.relocate_constituents(item, validated, request),
        )
        return Response(self._details(item))
