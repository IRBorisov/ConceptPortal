''' Endpoints for OSS. '''
from typing import cast

from django.core.exceptions import PermissionDenied
from django.http import HttpResponse
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import generics
from rest_framework import status as c
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response

from apps.library.models import LibraryItem, LibraryItemType
from apps.library.serializers import LibraryItemSerializer
from apps.library.services.context_search import get_accessible_items_queryset
from apps.rsform.models import Constituenta
from apps.rsform.serializers import CstTargetSerializer
from shared import permissions
from shared.concurrency import ConcurrencyMixin

from .. import models as m
from .. import mutations
from .. import serializers as s


@extend_schema(tags=['OSS'])
@extend_schema_view()
class OssViewSet(ConcurrencyMixin, viewsets.GenericViewSet, generics.ListAPIView, generics.RetrieveAPIView):
    ''' Endpoint: OperationSchema. '''
    queryset = LibraryItem.objects.filter(item_type=LibraryItemType.OPERATION_SCHEMA)
    serializer_class = LibraryItemSerializer

    def _get_item(self) -> LibraryItem:
        return cast(LibraryItem, self.get_object())

    def _operation_created(self, item: LibraryItem, operation: m.Operation) -> Response:
        return Response(
            status=c.HTTP_201_CREATED,
            data={
                'new_operation': operation.pk,
                'oss': s.OperationSchemaSerializer(item).data
            }
        )

    def get_queryset(self):
        if self.action == 'list':
            return get_accessible_items_queryset(self.request.user).filter(
                item_type=LibraryItemType.OPERATION_SCHEMA
            )
        return super().get_queryset()

    def get_permissions(self):
        ''' Determine permission class. '''
        if self.action in [
            'update_layout',
            'create_block',
            'update_block',
            'delete_block',
            'move_items',
            'create_schema',
            'clone_schema',
            'import_schema',
            'create_replica',
            'create_synthesis',
            'update_operation',
            'delete_operation',
            'delete_replica',
            'create_input',
            'set_input',
            'execute_operation',
            'relocate_constituents'
        ]:
            permission_list = [permissions.ItemEditor]
        elif self.action in ['list', 'retrieve', 'details']:
            permission_list = [permissions.ItemAnyone]
        elif self.action in ['get_predecessor']:
            permission_list = [permissions.GlobalUser]
        else:
            permission_list = [permissions.ItemEditor]
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
        serializer = s.OperationSchemaSerializer(self._get_item(), context={'request': request})
        return Response(
            status=c.HTTP_200_OK,
            data=serializer.data
        )

    @extend_schema(
        summary='update layout',
        tags=['OSS'],
        request=s.LayoutSerializer,
        responses={
            c.HTTP_200_OK: s.OperationSchemaSerializer,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['patch'], url_path='update-layout')
    def update_layout(self, request: Request, pk) -> HttpResponse:
        ''' Endpoint: Update schema layout. '''
        serializer = s.LayoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        item = self._get_item()
        mutations.update_layout(item, serializer.validated_data['data'], request)
        return Response(status=c.HTTP_200_OK, data=s.OperationSchemaSerializer(item).data)

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
        item = self._get_item()
        serializer = s.CreateBlockSerializer(data=request.data, context={'oss': item})
        serializer.is_valid(raise_exception=True)
        new_block = mutations.create_block(item, serializer.validated_data, request)
        return Response(
            status=c.HTTP_201_CREATED,
            data={
                'new_block': new_block.pk,
                'oss': s.OperationSchemaSerializer(item).data
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
        item = self._get_item()
        serializer = s.UpdateBlockSerializer(data=request.data, context={'oss': item})
        serializer.is_valid(raise_exception=True)
        mutations.update_block(item, serializer.validated_data, request)
        return Response(
            status=c.HTTP_200_OK,
            data=s.OperationSchemaSerializer(item).data
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
        item = self._get_item()
        serializer = s.DeleteBlockSerializer(data=request.data, context={'oss': item})
        serializer.is_valid(raise_exception=True)
        mutations.delete_block(item, serializer.validated_data, request)
        return Response(
            status=c.HTTP_200_OK,
            data=s.OperationSchemaSerializer(item).data
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
        item = self._get_item()
        serializer = s.MoveItemsSerializer(data=request.data, context={'oss': item})
        serializer.is_valid(raise_exception=True)
        mutations.move_items(item, serializer.validated_data, request)
        return Response(
            status=c.HTTP_200_OK,
            data=s.OperationSchemaSerializer(item).data
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
        item = self._get_item()
        serializer = s.CreateSchemaSerializer(data=request.data, context={'oss': item})
        serializer.is_valid(raise_exception=True)
        new_operation = mutations.create_schema_operation(item, serializer.validated_data, request)
        return self._operation_created(item, new_operation)


    @extend_schema(
        summary='clone conceptual schema - result of a target operation',
        tags=['OSS'],
        request=s.CloneSchemaSerializer(),
        responses={
            c.HTTP_201_CREATED: s.OperationCreatedResponse,
            c.HTTP_400_BAD_REQUEST: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['post'], url_path='clone-schema')
    def clone_schema(self, request: Request, pk) -> HttpResponse:
        ''' Clone schema. '''
        item = self._get_item()
        serializer = s.CloneSchemaSerializer(data=request.data, context={'oss': item})
        serializer.is_valid(raise_exception=True)
        new_operation = mutations.clone_schema_operation(item, serializer.validated_data, request)
        return self._operation_created(item, new_operation)


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
        item = self._get_item()
        serializer = s.ImportSchemaSerializer(data=request.data, context={'oss': item, 'request': request})
        serializer.is_valid(raise_exception=True)
        new_operation = mutations.import_schema_operation(item, serializer.validated_data, request)
        return self._operation_created(item, new_operation)


    @extend_schema(
        summary='create replica for operation',
        tags=['OSS'],
        request=s.CreateReplicaSerializer(),
        responses={
            c.HTTP_201_CREATED: s.OperationCreatedResponse,
            c.HTTP_400_BAD_REQUEST: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['post'], url_path='create-replica')
    def create_replica(self, request: Request, pk) -> HttpResponse:
        ''' Replicate schema. '''
        item = self._get_item()
        serializer = s.CreateReplicaSerializer(data=request.data, context={'oss': item})
        serializer.is_valid(raise_exception=True)
        new_operation = mutations.create_replica_operation(item, serializer.validated_data, request)
        return self._operation_created(item, new_operation)

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
        item = self._get_item()
        serializer = s.CreateSynthesisSerializer(data=request.data, context={'oss': item})
        serializer.is_valid(raise_exception=True)
        new_operation = mutations.create_synthesis_operation(item, serializer.validated_data, request)
        return self._operation_created(item, new_operation)

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
        item = self._get_item()
        serializer = s.UpdateOperationSerializer(data=request.data, context={'oss': item})
        serializer.is_valid(raise_exception=True)
        mutations.update_operation(item, serializer.validated_data, request.user, request)
        return Response(
            status=c.HTTP_200_OK,
            data=s.OperationSchemaSerializer(item).data
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
        item = self._get_item()
        serializer = s.DeleteOperationSerializer(data=request.data, context={'oss': item})
        serializer.is_valid(raise_exception=True)
        mutations.delete_operation(item, serializer.validated_data, request)
        return Response(
            status=c.HTTP_200_OK,
            data=s.OperationSchemaSerializer(item).data
        )

    @extend_schema(
        summary='delete replica',
        tags=['OSS'],
        request=s.DeleteReplicaSerializer(),
        responses={
            c.HTTP_200_OK: s.OperationSchemaSerializer,
            c.HTTP_400_BAD_REQUEST: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['patch'], url_path='delete-replica')
    def delete_replica(self, request: Request, pk) -> HttpResponse:
        ''' Endpoint: Delete Replica Operation. '''
        item = self._get_item()
        serializer = s.DeleteReplicaSerializer(data=request.data, context={'oss': item})
        serializer.is_valid(raise_exception=True)
        mutations.delete_replica(item, serializer.validated_data, request)
        return Response(
            status=c.HTTP_200_OK,
            data=s.OperationSchemaSerializer(item).data
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
        item = self._get_item()
        serializer = s.TargetOperationSerializer(data=request.data, context={'oss': item})
        serializer.is_valid(raise_exception=True)
        schema = mutations.create_input_schema(item, serializer.validated_data, request)
        return Response(
            status=c.HTTP_200_OK,
            data={
                'new_schema': LibraryItemSerializer(schema).data,
                'oss': s.OperationSchemaSerializer(item).data
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
        item = self._get_item()
        serializer = s.SetOperationInputSerializer(data=request.data, context={'oss': item, 'request': request})
        serializer.is_valid(raise_exception=True)
        mutations.set_operation_input(item, serializer.validated_data, request)
        return Response(
            status=c.HTTP_200_OK,
            data=s.OperationSchemaSerializer(item).data
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
        item = self._get_item()
        serializer = s.TargetOperationSerializer(data=request.data, context={'oss': item})
        serializer.is_valid(raise_exception=True)
        mutations.execute_operation(item, serializer.validated_data, request)
        return Response(
            status=c.HTTP_200_OK,
            data=s.OperationSchemaSerializer(item).data
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
        if not permissions.can_read_library_item(request.user, cast(LibraryItem, cst.schema)):
            raise PermissionDenied()
        inheritance_query = m.Inheritance.objects.filter(child=cst)
        while inheritance_query.exists():
            inheritance = inheritance_query.first()
            if inheritance is None:
                break
            cst = inheritance.parent
            inheritance_query = m.Inheritance.objects.filter(child=cst)

        # Re-check after walking inheritance: the predecessor may live in another schema.
        if not permissions.can_read_library_item(request.user, cast(LibraryItem, cst.schema)):
            raise PermissionDenied()

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
            c.HTTP_200_OK: None,
            c.HTTP_400_BAD_REQUEST: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['post'], url_path='relocate-constituents')
    def relocate_constituents(self, request: Request, pk) -> Response:
        ''' Relocate constituents from one schema to another. '''
        item = self._get_item()
        serializer = s.RelocateConstituentsSerializer(data=request.data, context={'oss': item})
        serializer.is_valid(raise_exception=True)
        mutations.relocate_constituents(item, serializer.validated_data, request)
        return Response(status=c.HTTP_200_OK)
