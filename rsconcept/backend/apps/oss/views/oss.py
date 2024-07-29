''' Endpoints for OSS. '''
from typing import cast

from django.db import transaction
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import generics, serializers
from rest_framework import status as c
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response

from apps.library.models import Editor, LibraryItem, LibraryItemType
from apps.library.serializers import LibraryItemSerializer
from shared import messages as msg
from shared import permissions

from .. import models as m
from .. import serializers as s


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
            'create_operation',
            'delete_operation',
            'update_positions',
            'create_input',
            'set_input',
            'update_operation',
            'execute_operation',
        ]:
            permission_list = [permissions.ItemEditor]
        elif self.action in ['details']:
            permission_list = [permissions.ItemAnyone]
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
    def details(self, request: Request, pk):
        ''' Endpoint: Detailed OSS data. '''
        serializer = s.OperationSchemaSerializer(self._get_item())
        return Response(
            status=c.HTTP_200_OK,
            data=serializer.data
        )

    @extend_schema(
        summary='update positions',
        tags=['OSS'],
        request=s.PositionsSerializer,
        responses={
            c.HTTP_200_OK: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['patch'], url_path='update-positions')
    def update_positions(self, request: Request, pk):
        ''' Endpoint: Update operations positions. '''
        serializer = s.PositionsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        m.OperationSchema(self.get_object()).update_positions(serializer.validated_data['positions'])
        return Response(status=c.HTTP_200_OK)

    @extend_schema(
        summary='create operation',
        tags=['OSS'],
        request=s.OperationCreateSerializer(),
        responses={
            c.HTTP_201_CREATED: s.NewOperationResponse,
            c.HTTP_400_BAD_REQUEST: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['post'], url_path='create-operation')
    def create_operation(self, request: Request, pk):
        ''' Create new operation. '''
        serializer = s.OperationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        oss = m.OperationSchema(self.get_object())
        with transaction.atomic():
            oss.update_positions(serializer.validated_data['positions'])
            data: dict = serializer.validated_data['item_data']
            if data['operation_type'] == m.OperationType.INPUT and serializer.validated_data['create_schema']:
                schema = LibraryItem.objects.create(
                    item_type=LibraryItemType.RSFORM,
                    owner=oss.model.owner,
                    alias=data['alias'],
                    title=data['title'],
                    comment=data['comment'],
                    visible=False,
                    access_policy=oss.model.access_policy,
                    location=oss.model.location
                )
                Editor.set(schema, oss.model.editors())
                data['result'] = schema
            new_operation = oss.create_operation(**data)
            if new_operation.operation_type != m.OperationType.INPUT and 'arguments' in serializer.validated_data:
                oss.set_arguments(
                    operation=new_operation,
                    arguments=serializer.validated_data['arguments']
                )

        oss.refresh_from_db()
        return Response(
            status=c.HTTP_201_CREATED,
            data={
                'new_operation': s.OperationSerializer(new_operation).data,
                'oss': s.OperationSchemaSerializer(oss.model).data
            }
        )

    @extend_schema(
        summary='delete operation',
        tags=['OSS'],
        request=s.OperationTargetSerializer,
        responses={
            c.HTTP_200_OK: s.OperationSchemaSerializer,
            c.HTTP_400_BAD_REQUEST: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['patch'], url_path='delete-operation')
    def delete_operation(self, request: Request, pk):
        ''' Endpoint: Delete operation. '''
        serializer = s.OperationTargetSerializer(
            data=request.data,
            context={'oss': self.get_object()}
        )
        serializer.is_valid(raise_exception=True)

        oss = m.OperationSchema(self.get_object())
        with transaction.atomic():
            oss.update_positions(serializer.validated_data['positions'])
            oss.delete_operation(serializer.validated_data['target'])

        oss.refresh_from_db()
        return Response(
            status=c.HTTP_200_OK,
            data=s.OperationSchemaSerializer(oss.model).data
        )

    @extend_schema(
        summary='create input schema for target operation',
        tags=['OSS'],
        request=s.OperationTargetSerializer(),
        responses={
            c.HTTP_200_OK: s.NewSchemaResponse,
            c.HTTP_400_BAD_REQUEST: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['patch'], url_path='create-input')
    def create_input(self, request: Request, pk):
        ''' Create new input RSForm. '''
        serializer = s.OperationTargetSerializer(
            data=request.data,
            context={'oss': self.get_object()}
        )
        serializer.is_valid(raise_exception=True)

        operation: m.Operation = cast(m.Operation, serializer.validated_data['target'])
        if operation.operation_type != m.OperationType.INPUT:
            raise serializers.ValidationError({
                'target': msg.operationNotInput(operation.alias)
            })
        if operation.result is not None:
            raise serializers.ValidationError({
                'target': msg.operationResultNotEmpty(operation.alias)
            })

        oss = m.OperationSchema(self.get_object())
        with transaction.atomic():
            oss.update_positions(serializer.validated_data['positions'])
            schema = LibraryItem.objects.create(
                item_type=LibraryItemType.RSFORM,
                owner=oss.model.owner,
                alias=operation.alias,
                title=operation.title,
                comment=operation.comment,
                visible=False,
                access_policy=oss.model.access_policy,
                location=oss.model.location
            )
            Editor.set(schema, oss.model.editors())
            operation.result = schema
            operation.sync_text = True
            operation.save()

        oss.refresh_from_db()
        return Response(
            status=c.HTTP_200_OK,
            data={
                'new_schema': LibraryItemSerializer(schema).data,
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
    def set_input(self, request: Request, pk):
        ''' Set input schema for target operation. '''
        serializer = s.SetOperationInputSerializer(
            data=request.data,
            context={'oss': self.get_object()}
        )
        serializer.is_valid(raise_exception=True)

        operation: m.Operation = cast(m.Operation, serializer.validated_data['target'])
        result = serializer.validated_data['input']
        oss = m.OperationSchema(self.get_object())
        with transaction.atomic():
            oss.update_positions(serializer.validated_data['positions'])
            operation.result = result
            operation.sync_text = serializer.validated_data['sync_text']
            if result is not None and operation.sync_text:
                operation.title = result.title
                operation.comment = result.comment
                operation.alias = result.alias
            operation.save()

            # update arguments

        oss.refresh_from_db()
        return Response(
            status=c.HTTP_200_OK,
            data=s.OperationSchemaSerializer(oss.model).data
        )

    @extend_schema(
        summary='update operation',
        tags=['OSS'],
        request=s.OperationUpdateSerializer(),
        responses={
            c.HTTP_200_OK: s.OperationSchemaSerializer,
            c.HTTP_400_BAD_REQUEST: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['patch'], url_path='update-operation')
    def update_operation(self, request: Request, pk):
        ''' Update operation arguments and parameters. '''
        serializer = s.OperationUpdateSerializer(
            data=request.data,
            context={'oss': self.get_object()}
        )
        serializer.is_valid(raise_exception=True)

        operation: m.Operation = cast(m.Operation, serializer.validated_data['target'])
        oss = m.OperationSchema(self.get_object())
        with transaction.atomic():
            oss.update_positions(serializer.validated_data['positions'])
            operation.alias = serializer.validated_data['item_data']['alias']
            operation.title = serializer.validated_data['item_data']['title']
            operation.comment = serializer.validated_data['item_data']['comment']
            operation.sync_text = serializer.validated_data['item_data']['sync_text']
            operation.save()

            if operation.sync_text and operation.result is not None:
                can_edit = permissions.can_edit_item(request.user, operation.result)
                if can_edit:
                    operation.result.alias = operation.alias
                    operation.result.title = operation.title
                    operation.result.comment = operation.comment
                    operation.result.save()
            if 'arguments' in serializer.validated_data:
                oss.set_arguments(operation, serializer.validated_data['arguments'])
            if 'substitutions' in serializer.validated_data:
                oss.set_substitutions(operation, serializer.validated_data['substitutions'])
        return Response(
            status=c.HTTP_200_OK,
            data=s.OperationSchemaSerializer(oss.model).data
        )

    @extend_schema(
        summary='execute operation',
        tags=['OSS'],
        request=s.OperationTargetSerializer(),
        responses={
            c.HTTP_200_OK: s.OperationSchemaSerializer,
            c.HTTP_400_BAD_REQUEST: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['post'], url_path='execute-operation')
    def execute_operation(self, request: Request, pk):
        ''' Execute operation. '''
        serializer = s.OperationTargetSerializer(
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
        # with transaction.atomic():
        #     oss.update_positions(serializer.validated_data['positions'])
        #     operation.result.refresh_from_db()
        #     operation.result.title = operation.title
        #     operation.result.comment = operation.comment
        #     operation.result.alias = operation.alias
        #     operation.result.save()

        # update arguments

        oss.refresh_from_db()
        return Response(
            status=c.HTTP_200_OK,
            data=s.OperationSchemaSerializer(oss.model).data
        )
