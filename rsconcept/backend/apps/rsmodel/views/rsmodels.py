''' Endpoints for RSModel. '''
from typing import cast

from django.db import transaction
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import generics
from rest_framework import status as c
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response

from apps.library.models import LibraryItem, LibraryItemType
from apps.library.serializers import LibraryItemSerializer
from apps.rsform.models import Constituenta
from apps.rsform.serializers import CstListSerializer
from shared import permissions

from .. import models as m
from .. import serializers as s


@extend_schema(tags=['RSModel'])
@extend_schema_view()
class RSModelViewSet(viewsets.GenericViewSet, generics.ListAPIView, generics.RetrieveAPIView):
    ''' Endpoint: RSModel operations. '''
    queryset = LibraryItem.objects.filter(item_type=LibraryItemType.RSMODEL)
    serializer_class = LibraryItemSerializer

    def _get_item(self) -> LibraryItem:
        return cast(LibraryItem, self.get_object())

    def _get_schema(self) -> LibraryItem | None:
        return m.RSModel.objects.get(model=self.get_object()).schema

    def get_permissions(self):
        ''' Determine permission class. '''
        if self.action in [
            'set_value',
            'clear_values',
            'reset_all'
        ]:
            permission_list = [permissions.ItemEditor]
        elif self.action in ['details']:
            permission_list = [permissions.ItemAnyone]
        else:
            permission_list = [permissions.Anyone]
        return [permission() for permission in permission_list]

    @extend_schema(
        summary='get model details',
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

    @extend_schema(
        summary='set value for a specific constituent of the model',
        tags=['RSModel'],
        request=s.CstDataUpdateSerializer,
        responses={
            c.HTTP_200_OK: None,
            c.HTTP_400_BAD_REQUEST: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['post'], url_path='set-value')
    def set_value(self, request: Request, pk) -> Response:
        ''' Endpoint: Set value for a specific constituent in the model. '''
        item = self._get_item()
        serializer = s.CstDataUpdateSerializer(data=request.data, context={'schema': self._get_schema()})
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        with transaction.atomic():
            m.ConstituentData.objects.update_or_create(
                model=item,
                constituent=validated_data['target'],
                type=validated_data['type'],
                data=validated_data['data']
            )
            item.save(update_fields=['time_update'])
        return Response(
            status=c.HTTP_200_OK
        )

    @extend_schema(
        summary='clear values for one or more constituents',
        tags=['RSModel'],
        request=CstListSerializer,
        responses={
            c.HTTP_200_OK: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['post'], url_path='clear-values')
    def clear_values(self, request: Request, pk) -> Response:
        ''' Endpoint: Clear values for one or more constituents in the model. '''
        item = self._get_item()
        serializer = CstListSerializer(data=request.data, context={'schema': self._get_schema()})
        serializer.is_valid(raise_exception=True)
        cst_list: list[Constituenta] = serializer.validated_data['items']
        ids = [cst.pk for cst in cst_list]

        with transaction.atomic():
            m.ConstituentData.objects.filter(model=item, constituent_id__in=ids).delete()
            item.save(update_fields=['time_update'])
        return Response(status=c.HTTP_200_OK)

    @extend_schema(
        summary='reset all constituent values in a model',
        tags=['RSModel'],
        request=None,
        responses={
            c.HTTP_200_OK: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['post'], url_path='reset-all')
    def reset_all(self, request: Request, pk) -> Response:
        ''' Endpoint: Reset all constituent values in the model. '''
        item = self._get_item()
        with transaction.atomic():
            m.ConstituentData.objects.filter(model=item).delete()
            item.save(update_fields=['time_update'])
        return Response(status=c.HTTP_200_OK)
