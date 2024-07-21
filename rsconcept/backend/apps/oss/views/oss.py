''' Endpoints for OSS. '''
from typing import cast

from django.db import transaction
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import generics
from rest_framework import status as c
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response

from shared import permissions

from .. import models as m
from .. import serializers as s


@extend_schema(tags=['OSS'])
@extend_schema_view()
class OssViewSet(viewsets.GenericViewSet, generics.ListAPIView, generics.RetrieveAPIView):
    ''' Endpoint: OperationSchema. '''
    queryset = m.LibraryItem.objects.filter(item_type=m.LibraryItemType.OPERATION_SCHEMA)
    serializer_class = s.LibraryItemSerializer

    def _get_schema(self) -> m.OperationSchema:
        return m.OperationSchema(cast(m.LibraryItem, self.get_object()))

    def get_permissions(self):
        ''' Determine permission class. '''
        if self.action in [
            'create_operation',
            'delete_operation',
            'update_positions'
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
        serializer = s.OperationSchemaSerializer(cast(m.LibraryItem, self.get_object()))
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
        schema = self._get_schema()
        serializer = s.PositionsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        schema.update_positions(serializer.validated_data['positions'])
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
        schema = self._get_schema()
        serializer = s.OperationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            schema.update_positions(serializer.validated_data['positions'])
            new_operation = schema.create_operation(**serializer.validated_data['item_data'])
            if new_operation.operation_type != m.OperationType.INPUT and 'arguments' in serializer.validated_data:
                for argument in serializer.validated_data['arguments']:
                    schema.add_argument(operation=new_operation, argument=argument)
            schema.item.refresh_from_db()

        response = Response(
            status=c.HTTP_201_CREATED,
            data={
                'new_operation': s.OperationSerializer(new_operation).data,
                'oss': s.OperationSchemaSerializer(schema.item).data
            }
        )
        return response

    @extend_schema(
        summary='delete operation',
        tags=['OSS'],
        request=s.OperationDeleteSerializer,
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
        schema = self._get_schema()
        serializer = s.OperationDeleteSerializer(
            data=request.data,
            context={'oss': schema.item}
        )
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            schema.update_positions(serializer.validated_data['positions'])
            schema.delete_operation(serializer.validated_data['target'])
            schema.item.refresh_from_db()

        return Response(
            status=c.HTTP_200_OK,
            data=s.OperationSchemaSerializer(schema.item).data
        )
