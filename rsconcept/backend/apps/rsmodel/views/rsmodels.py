''' Endpoints for RSModel. '''
from typing import cast

from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import generics
from rest_framework import status as c
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response

from apps.library.models import LibraryItem, LibraryItemType
from apps.library.serializers import LibraryItemSerializer
from shared import permissions

from .. import serializers as s


@extend_schema(tags=['RSModel'])
@extend_schema_view()
class RSModelViewSet(viewsets.GenericViewSet, generics.ListAPIView, generics.RetrieveAPIView):
    ''' Endpoint: RSModel operations. '''
    queryset = LibraryItem.objects.filter(item_type=LibraryItemType.RSMODEL)
    serializer_class = LibraryItemSerializer

    def _get_item(self) -> LibraryItem:
        return cast(LibraryItem, self.get_object())

    def get_permissions(self):
        ''' Determine permission class. '''
        if self.action in ['contents', 'details']:
            permission_list = [permissions.ItemAnyone]
        else:
            permission_list = [permissions.Anyone]
        return [permission() for permission in permission_list]

    @extend_schema(
        summary='get model db contents (schema_id + constituents)',
        tags=['RSModel'],
        request=None,
        responses={
            c.HTTP_200_OK: s.RSModelSerializer,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['get'], url_path='contents')
    def contents(self, request: Request, pk) -> Response:
        ''' Endpoint: View model db contents. '''
        serializer = s.RSModelSerializer(self._get_item())
        return Response(
            status=c.HTTP_200_OK,
            data=serializer.data
        )

    @extend_schema(
        summary='get model details (same as contents)',
        tags=['RSModel'],
        request=None,
        responses={
            c.HTTP_200_OK: s.RSModelSerializer,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['get'], url_path='details')
    def details(self, request: Request, pk) -> Response:
        ''' Endpoint: Detailed model view. '''
        serializer = s.RSModelSerializer(self._get_item())
        return Response(
            status=c.HTTP_200_OK,
            data=serializer.data
        )
