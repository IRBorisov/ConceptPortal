''' Endpoints for OSS. '''
from copy import deepcopy
from typing import Optional, cast

from django.db import transaction
from django.http import HttpResponse
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import generics, serializers
from rest_framework import status as c
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response

from apps.library.models import LibraryItem, LibraryItemType
from apps.library.serializers import LibraryItemSerializer
from apps.rsform.models import Constituenta, RSForm
from apps.rsform.serializers import CstTargetSerializer
from shared import messages as msg
from shared import permissions

from .. import models as m
from .. import serializers as s


def _create_clone(prototype: LibraryItem, operation: m.Operation, oss: LibraryItem) -> LibraryItem:
    ''' Create clone of prototype schema for operation. '''
    prototype_schema = RSForm(prototype)
    clone = deepcopy(prototype)
    clone.pk = None
    clone.owner = oss.owner
    clone.title = operation.title
    clone.alias = operation.alias
    clone.description = operation.description
    clone.visible = False
    clone.read_only = False
    clone.access_policy = oss.access_policy
    clone.location = oss.location
    clone.save()
    for cst in prototype_schema.constituents():
        cst_copy = deepcopy(cst)
        cst_copy.pk = None
        cst_copy.schema = clone
        cst_copy.save()
    return clone


@extend_schema(tags=['OSS'])
@extend_schema_view()
class OssViewSet(viewsets.GenericViewSet, generics.ListAPIView, generics.RetrieveAPIView):
    ''' Endpoint: OperationSchema. '''
    queryset = LibraryItem.objects.filter(item_type=LibraryItemType.OPERATION_SCHEMA)
    serializer_class = LibraryItemSerializer

    def _get_item(self) -> LibraryItem:
        return cast(LibraryItem, self.get_object())

    def get_permissions(self):
        ''' Determine permission class. '''
        if self.action in [
            'update_layout',
            'create_block',
            'update_block',
            'delete_block',
            'move_items',
            'create_schema',
            'import_schema',
            'create_synthesis',
            'update_operation',
            'delete_operation',
            'create_input',
            'set_input',
            'execute_operation',
            'relocate_constituents'
        ]:
            permission_list = [permissions.ItemEditor]
        elif self.action in ['details']:
            permission_list = [permissions.ItemAnyone]
        elif self.action in ['get_predecessor']:
            permission_list = [permissions.Anyone]
        else:
            permission_list = [permissions.Anyone]
        return [permission() for permission in permission_list]

    @extend_schema(
        summary='get operations data',
        tags=['OSS'],
        request=None,
        responses={
            c.HTTP_200_OK: s.OperationSchemaSerializer,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['get'], url_path='details')
    def details(self, request: Request, pk) -> HttpResponse:
        ''' Endpoint: Detailed OSS data. '''
        serializer = s.OperationSchemaSerializer(self._get_item())
        return Response(
            status=c.HTTP_200_OK,
            data=serializer.data
        )

    @extend_schema(
        summary='update layout',
        tags=['OSS'],
        request=s.LayoutSerializer,
        responses={
            c.HTTP_200_OK: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['patch'], url_path='update-layout')
    def update_layout(self, request: Request, pk) -> HttpResponse:
        ''' Endpoint: Update schema layout. '''
        serializer = s.LayoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        m.OperationSchema(self.get_object()).update_layout(serializer.validated_data['data'])
        return Response(status=c.HTTP_200_OK)

    @extend_schema(
        summary='create block',
        tags=['OSS'],
        request=s.CreateBlockSerializer(),
        responses={
            c.HTTP_201_CREATED: s.BlockCreatedResponse,
            c.HTTP_400_BAD_REQUEST: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['post'], url_path='create-block')
    def create_block(self, request: Request, pk) -> HttpResponse:
        ''' Create Block. '''
        serializer = s.CreateBlockSerializer(
            data=request.data,
            context={'oss': self.get_object()}
        )
        serializer.is_valid(raise_exception=True)

        oss = m.OperationSchema(self.get_object())
        layout = serializer.validated_data['layout']
        position = serializer.validated_data['position']
        children_blocks: list[m.Block] = serializer.validated_data['children_blocks']
        children_operations: list[m.Operation] = serializer.validated_data['children_operations']
        with transaction.atomic():
            new_block = oss.create_block(**serializer.validated_data['item_data'])
            layout.append({
                'nodeID': 'b' + str(new_block.pk),
                'x': position['x'],
                'y': position['y'],
                'width': position['width'],
                'height': position['height'],
            })
            oss.update_layout(layout)
            if len(children_blocks) > 0:
                for block in children_blocks:
                    block.parent = new_block
                m.Block.objects.bulk_update(children_blocks, ['parent'])
            if len(children_operations) > 0:
                for operation in children_operations:
                    operation.parent = new_block
                m.Operation.objects.bulk_update(children_operations, ['parent'])

        return Response(
            status=c.HTTP_201_CREATED,
            data={
                'new_block': new_block.pk,
                'oss': s.OperationSchemaSerializer(oss.model).data
            }
        )

    @extend_schema(
        summary='update block',
        tags=['OSS'],
        request=s.UpdateBlockSerializer(),
        responses={
            c.HTTP_200_OK: s.OperationSchemaSerializer,
            c.HTTP_400_BAD_REQUEST: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['patch'], url_path='update-block')
    def update_block(self, request: Request, pk) -> HttpResponse:
        ''' Update Block. '''
        serializer = s.UpdateBlockSerializer(
            data=request.data,
            context={'oss': self.get_object()}
        )
        serializer.is_valid(raise_exception=True)

        block: m.Block = cast(m.Block, serializer.validated_data['target'])
        oss = m.OperationSchema(self.get_object())
        with transaction.atomic():
            if 'layout' in serializer.validated_data:
                oss.update_layout(serializer.validated_data['layout'])
            if 'title' in serializer.validated_data['item_data']:
                block.title = serializer.validated_data['item_data']['title']
            if 'description' in serializer.validated_data['item_data']:
                block.description = serializer.validated_data['item_data']['description']
            if 'parent' in serializer.validated_data['item_data']:
                block.parent = serializer.validated_data['item_data']['parent']
            block.save(update_fields=['title', 'description', 'parent'])
        return Response(
            status=c.HTTP_200_OK,
            data=s.OperationSchemaSerializer(oss.model).data
        )

    @extend_schema(
        summary='delete block',
        tags=['OSS'],
        request=s.DeleteBlockSerializer,
        responses={
            c.HTTP_200_OK: s.OperationSchemaSerializer,
            c.HTTP_400_BAD_REQUEST: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['patch'], url_path='delete-block')
    def delete_block(self, request: Request, pk) -> HttpResponse:
        ''' Endpoint: Delete Block. '''
        serializer = s.DeleteBlockSerializer(
            data=request.data,
            context={'oss': self.get_object()}
        )
        serializer.is_valid(raise_exception=True)

        oss = m.OperationSchema(self.get_object())
        block = cast(m.Block, serializer.validated_data['target'])
        layout = serializer.validated_data['layout']
        layout = [x for x in layout if x['nodeID'] != 'b' + str(block.pk)]
        with transaction.atomic():
            oss.delete_block(block)
            oss.update_layout(layout)

        return Response(
            status=c.HTTP_200_OK,
            data=s.OperationSchemaSerializer(oss.model).data
        )

    @extend_schema(
        summary='move items',
        tags=['OSS'],
        request=s.MoveItemsSerializer(),
        responses={
            c.HTTP_200_OK: s.OperationSchemaSerializer,
            c.HTTP_400_BAD_REQUEST: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['patch'], url_path='move-items')
    def move_items(self, request: Request, pk) -> HttpResponse:
        ''' Move items to another parent. '''
        serializer = s.MoveItemsSerializer(
            data=request.data,
            context={'oss': self.get_object()}
        )
        serializer.is_valid(raise_exception=True)

        oss = m.OperationSchema(self.get_object())
        with transaction.atomic():
            oss.update_layout(serializer.validated_data['layout'])
            for operation in serializer.validated_data['operations']:
                operation.parent = serializer.validated_data['destination']
                operation.save(update_fields=['parent'])
            for block in serializer.validated_data['blocks']:
                block.parent = serializer.validated_data['destination']
                block.save(update_fields=['parent'])

        return Response(
            status=c.HTTP_200_OK,
            data=s.OperationSchemaSerializer(oss.model).data
        )

    @extend_schema(
        summary='create empty conceptual schema',
        tags=['OSS'],
        request=s.CreateSchemaSerializer(),
        responses={
            c.HTTP_201_CREATED: s.OperationCreatedResponse,
            c.HTTP_400_BAD_REQUEST: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['post'], url_path='create-schema')
    def create_schema(self, request: Request, pk) -> HttpResponse:
        ''' Create schema. '''
        serializer = s.CreateSchemaSerializer(
            data=request.data,
            context={'oss': self.get_object()}
        )
        serializer.is_valid(raise_exception=True)

        oss = m.OperationSchema(self.get_object())
        layout = serializer.validated_data['layout']
        position = serializer.validated_data['position']
        data = serializer.validated_data['item_data']
        data['operation_type'] = m.OperationType.INPUT
        with transaction.atomic():
            new_operation = oss.create_operation(**serializer.validated_data['item_data'])
            layout.append({
                'nodeID': 'o' + str(new_operation.pk),
                'x': position['x'],
                'y': position['y'],
                'width': position['width'],
                'height': position['height']
            })
            oss.update_layout(layout)
            oss.create_input(new_operation)

        return Response(
            status=c.HTTP_201_CREATED,
            data={
                'new_operation': new_operation.pk,
                'oss': s.OperationSchemaSerializer(oss.model).data
            }
        )


    @extend_schema(
        summary='import conceptual schema to new OSS operation',
        tags=['OSS'],
        request=s.ImportSchemaSerializer(),
        responses={
            c.HTTP_201_CREATED: s.OperationCreatedResponse,
            c.HTTP_400_BAD_REQUEST: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['post'], url_path='import-schema')
    def import_schema(self, request: Request, pk) -> HttpResponse:
        ''' Create operation with existing schema. '''
        serializer = s.ImportSchemaSerializer(
            data=request.data,
            context={'oss': self.get_object()}
        )
        serializer.is_valid(raise_exception=True)

        oss = m.OperationSchema(self.get_object())
        layout = serializer.validated_data['layout']
        position = serializer.validated_data['position']
        data = serializer.validated_data['item_data']
        data['operation_type'] = m.OperationType.INPUT
        if not serializer.validated_data['clone_source']:
            data['result'] = serializer.validated_data['source']
        with transaction.atomic():
            new_operation = oss.create_operation(**serializer.validated_data['item_data'])
            layout.append({
                'nodeID': 'o' + str(new_operation.pk),
                'x': position['x'],
                'y': position['y'],
                'width': position['width'],
                'height': position['height']
            })
            oss.update_layout(layout)

            if serializer.validated_data['clone_source']:
                prototype: LibraryItem = serializer.validated_data['source']
                new_operation.result = _create_clone(prototype, new_operation, oss.model)
                new_operation.save(update_fields=["result"])

        return Response(
            status=c.HTTP_201_CREATED,
            data={
                'new_operation': new_operation.pk,
                'oss': s.OperationSchemaSerializer(oss.model).data
            }
        )

    @extend_schema(
        summary='create synthesis operation',
        tags=['OSS'],
        request=s.CreateSynthesisSerializer(),
        responses={
            c.HTTP_201_CREATED: s.OperationCreatedResponse,
            c.HTTP_400_BAD_REQUEST: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['post'], url_path='create-synthesis')
    def create_synthesis(self, request: Request, pk) -> HttpResponse:
        ''' Create Synthesis operation from arguments. '''
        serializer = s.CreateSynthesisSerializer(
            data=request.data,
            context={'oss': self.get_object()}
        )
        serializer.is_valid(raise_exception=True)

        oss = m.OperationSchema(self.get_object())
        layout = serializer.validated_data['layout']
        position = serializer.validated_data['position']
        data = serializer.validated_data['item_data']
        data['operation_type'] = m.OperationType.SYNTHESIS
        with transaction.atomic():
            new_operation = oss.create_operation(**serializer.validated_data['item_data'])
            layout.append({
                'nodeID': 'o' + str(new_operation.pk),
                'x': position['x'],
                'y': position['y'],
                'width': position['width'],
                'height': position['height']
            })
            oss.set_arguments(new_operation.pk, serializer.validated_data['arguments'])
            oss.set_substitutions(new_operation.pk, serializer.validated_data['substitutions'])
            oss.execute_operation(new_operation)
            oss.update_layout(layout)

        return Response(
            status=c.HTTP_201_CREATED,
            data={
                'new_operation': new_operation.pk,
                'oss': s.OperationSchemaSerializer(oss.model).data
            }
        )

    @extend_schema(
        summary='update operation',
        tags=['OSS'],
        request=s.UpdateOperationSerializer(),
        responses={
            c.HTTP_200_OK: s.OperationSchemaSerializer,
            c.HTTP_400_BAD_REQUEST: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['patch'], url_path='update-operation')
    def update_operation(self, request: Request, pk) -> HttpResponse:
        ''' Update Operation arguments and parameters. '''
        serializer = s.UpdateOperationSerializer(
            data=request.data,
            context={'oss': self.get_object()}
        )
        serializer.is_valid(raise_exception=True)

        operation: m.Operation = cast(m.Operation, serializer.validated_data['target'])
        oss = m.OperationSchema(self.get_object())
        with transaction.atomic():
            if 'layout' in serializer.validated_data:
                oss.update_layout(serializer.validated_data['layout'])
            if 'alias' in serializer.validated_data['item_data']:
                operation.alias = serializer.validated_data['item_data']['alias']
            if 'title' in serializer.validated_data['item_data']:
                operation.title = serializer.validated_data['item_data']['title']
            if 'description' in serializer.validated_data['item_data']:
                operation.description = serializer.validated_data['item_data']['description']
            if 'parent' in serializer.validated_data['item_data']:
                operation.parent = serializer.validated_data['item_data']['parent']
            operation.save(update_fields=['alias', 'title', 'description', 'parent'])

            if operation.result is not None:
                can_edit = permissions.can_edit_item(request.user, operation.result)
                if can_edit or operation.operation_type == m.OperationType.SYNTHESIS:
                    operation.result.alias = operation.alias
                    operation.result.title = operation.title
                    operation.result.description = operation.description
                    operation.result.save()
            if 'arguments' in serializer.validated_data:
                oss.set_arguments(operation.pk, serializer.validated_data['arguments'])
            if 'substitutions' in serializer.validated_data:
                oss.set_substitutions(operation.pk, serializer.validated_data['substitutions'])
        return Response(
            status=c.HTTP_200_OK,
            data=s.OperationSchemaSerializer(oss.model).data
        )

    @extend_schema(
        summary='delete operation',
        tags=['OSS'],
        request=s.DeleteOperationSerializer,
        responses={
            c.HTTP_200_OK: s.OperationSchemaSerializer,
            c.HTTP_400_BAD_REQUEST: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['patch'], url_path='delete-operation')
    def delete_operation(self, request: Request, pk) -> HttpResponse:
        ''' Endpoint: Delete Operation. '''
        serializer = s.DeleteOperationSerializer(
            data=request.data,
            context={'oss': self.get_object()}
        )
        serializer.is_valid(raise_exception=True)

        oss = m.OperationSchema(self.get_object())
        operation = cast(m.Operation, serializer.validated_data['target'])
        old_schema = operation.result
        layout = serializer.validated_data['layout']
        layout = [x for x in layout if x['nodeID'] != 'o' + str(operation.pk)]
        with transaction.atomic():
            oss.delete_operation(operation.pk, serializer.validated_data['keep_constituents'])
            oss.update_layout(layout)
            if old_schema is not None:
                if serializer.validated_data['delete_schema']:
                    m.PropagationFacade.before_delete_schema(old_schema)
                    old_schema.delete()
                elif old_schema.is_synced(oss.model):
                    old_schema.visible = True
                    old_schema.save(update_fields=['visible'])
        return Response(
            status=c.HTTP_200_OK,
            data=s.OperationSchemaSerializer(oss.model).data
        )

    @extend_schema(
        summary='create input schema for target operation',
        tags=['OSS'],
        request=s.TargetOperationSerializer(),
        responses={
            c.HTTP_200_OK: s.SchemaCreatedResponse,
            c.HTTP_400_BAD_REQUEST: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['patch'], url_path='create-input')
    def create_input(self, request: Request, pk) -> HttpResponse:
        ''' Create input RSForm. '''
        serializer = s.TargetOperationSerializer(
            data=request.data,
            context={'oss': self.get_object()}
        )
        serializer.is_valid(raise_exception=True)

        operation: m.Operation = cast(m.Operation, serializer.validated_data['target'])
        if len(operation.getQ_arguments()) > 0:
            raise serializers.ValidationError({
                'target': msg.operationHasArguments(operation.alias)
            })
        if operation.result is not None:
            raise serializers.ValidationError({
                'target': msg.operationResultNotEmpty(operation.alias)
            })

        oss = m.OperationSchema(self.get_object())
        with transaction.atomic():
            oss.update_layout(serializer.validated_data['layout'])
            schema = oss.create_input(operation)

        return Response(
            status=c.HTTP_200_OK,
            data={
                'new_schema': LibraryItemSerializer(schema.model).data,
                'oss': s.OperationSchemaSerializer(oss.model).data
            }
        )

    @extend_schema(
        summary='set input schema for target operation',
        tags=['OSS'],
        request=s.SetOperationInputSerializer(),
        responses={
            c.HTTP_200_OK: s.OperationSchemaSerializer,
            c.HTTP_400_BAD_REQUEST: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['patch'], url_path='set-input')
    def set_input(self, request: Request, pk) -> HttpResponse:
        ''' Set input schema for target operation. '''
        serializer = s.SetOperationInputSerializer(
            data=request.data,
            context={'oss': self.get_object()}
        )
        serializer.is_valid(raise_exception=True)

        target_operation: m.Operation = cast(m.Operation, serializer.validated_data['target'])
        schema: Optional[LibraryItem] = serializer.validated_data['input']
        if schema is not None:
            connected_operations = m.Operation.objects.filter(result=schema).only('operation_type', 'oss_id')
            for operation in connected_operations:
                if operation.operation_type != m.OperationType.INPUT:
                    raise serializers.ValidationError({
                        'input': msg.operationResultFromAnotherOSS()
                    })
                if operation != target_operation and operation.oss_id == target_operation.oss_id:
                    raise serializers.ValidationError({
                        'input': msg.operationInputAlreadyConnected()
                    })
        oss = m.OperationSchema(self.get_object())
        old_schema = target_operation.result
        with transaction.atomic():
            if old_schema is not None:
                if old_schema.is_synced(oss.model):
                    old_schema.visible = True
                    old_schema.save(update_fields=['visible'])
            oss.update_layout(serializer.validated_data['layout'])
            oss.set_input(target_operation.pk, schema)
        return Response(
            status=c.HTTP_200_OK,
            data=s.OperationSchemaSerializer(oss.model).data
        )

    @extend_schema(
        summary='execute operation',
        tags=['OSS'],
        request=s.TargetOperationSerializer(),
        responses={
            c.HTTP_200_OK: s.OperationSchemaSerializer,
            c.HTTP_400_BAD_REQUEST: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['post'], url_path='execute-operation')
    def execute_operation(self, request: Request, pk) -> HttpResponse:
        ''' Execute operation. '''
        serializer = s.TargetOperationSerializer(
            data=request.data,
            context={'oss': self.get_object()}
        )
        serializer.is_valid(raise_exception=True)

        operation: m.Operation = cast(m.Operation, serializer.validated_data['target'])
        if operation.operation_type != m.OperationType.SYNTHESIS:
            raise serializers.ValidationError({
                'target': msg.operationNotSynthesis(operation.alias)
            })
        if operation.result is not None:
            raise serializers.ValidationError({
                'target': msg.operationResultNotEmpty(operation.alias)
            })

        oss = m.OperationSchema(self.get_object())
        with transaction.atomic():
            oss.update_layout(serializer.validated_data['layout'])
            oss.execute_operation(operation)

        return Response(
            status=c.HTTP_200_OK,
            data=s.OperationSchemaSerializer(oss.model).data
        )

    @extend_schema(
        summary='get predecessor for target constituenta',
        tags=['OSS'],
        request=CstTargetSerializer(),
        responses={
            c.HTTP_200_OK: s.ConstituentaReferenceResponse,
            c.HTTP_400_BAD_REQUEST: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=False, methods=['post'], url_path='get-predecessor')
    def get_predecessor(self, request: Request) -> HttpResponse:
        ''' Get predecessor. '''
        serializer = CstTargetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cst = cast(Constituenta, serializer.validated_data['target'])
        inheritance_query = m.Inheritance.objects.filter(child=cst)
        while inheritance_query.exists():
            inheritance = inheritance_query.first()
            if inheritance is None:
                break
            cst = inheritance.parent
            inheritance_query = m.Inheritance.objects.filter(child=cst)

        return Response(
            status=c.HTTP_200_OK,
            data={
                'id': cst.pk,
                'schema': cst.schema_id
            }
        )

    @extend_schema(
        summary='relocate constituents from one schema to another',
        tags=['OSS'],
        request=s.RelocateConstituentsSerializer(),
        responses={
            c.HTTP_200_OK: s.OperationSchemaSerializer,
            c.HTTP_400_BAD_REQUEST: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=False, methods=['post'], url_path='relocate-constituents')
    def relocate_constituents(self, request: Request) -> Response:
        ''' Relocate constituents from one schema to another. '''
        serializer = s.RelocateConstituentsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        oss = m.OperationSchema(LibraryItem.objects.get(pk=data['oss']))
        source = RSForm(LibraryItem.objects.get(pk=data['source']))
        destination = RSForm(LibraryItem.objects.get(pk=data['destination']))

        with transaction.atomic():
            if data['move_down']:
                oss.relocate_down(source, destination, data['items'])
                m.PropagationFacade.before_delete_cst(source, data['items'])
                source.delete_cst(data['items'])
            else:
                new_items = oss.relocate_up(source, destination, data['items'])
                m.PropagationFacade.after_create_cst(destination, new_items, exclude=[oss.model.pk])

        return Response(status=c.HTTP_200_OK)
