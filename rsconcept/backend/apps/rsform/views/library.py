''' Endpoints for library. '''
from typing import cast
from django.db import transaction
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from rest_framework import viewsets, filters, generics, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.request import Request
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import status as c

from .. import models as m
from .. import serializers as s
from .. import utils


@extend_schema(tags=['Library'])
@extend_schema_view()
class LibraryActiveView(generics.ListAPIView):
    ''' Endpoint: Get list of library items available for active user. '''
    permission_classes = (permissions.AllowAny,)
    serializer_class = s.LibraryItemSerializer

    def get_queryset(self):
        if self.request.user.is_anonymous:
            return m.LibraryItem.objects.filter(is_common=True).order_by('-time_update')
        else:
            user = cast(m.User, self.request.user)
            # pylint: disable=unsupported-binary-operation
            return m.LibraryItem.objects.filter(
                Q(is_common=True) | Q(owner=user) | Q(subscription__user=user)
            ).distinct().order_by('-time_update')


@extend_schema(tags=['Library'])
@extend_schema_view()
class LibraryTemplatesView(generics.ListAPIView):
    ''' Endpoint: Get list of templates. '''
    permission_classes = (permissions.AllowAny,)
    serializer_class = s.LibraryItemSerializer

    def get_queryset(self):
        template_ids = m.LibraryTemplate.objects.values_list('lib_source', flat=True)
        return m.LibraryItem.objects.filter(pk__in=template_ids)


# pylint: disable=too-many-ancestors
@extend_schema(tags=['Library'])
@extend_schema_view()
class LibraryViewSet(viewsets.ModelViewSet):
    ''' Endpoint: Library operations. '''
    queryset = m.LibraryItem.objects.all()
    serializer_class = s.LibraryItemSerializer

    filter_backends = (DjangoFilterBackend, filters.OrderingFilter)
    filterset_fields = ['item_type', 'owner', 'is_common', 'is_canonical']
    ordering_fields = ('item_type', 'owner', 'title', 'time_update')
    ordering = '-time_update'

    def perform_create(self, serializer):
        if not self.request.user.is_anonymous and 'owner' not in self.request.POST:
            return serializer.save(owner=self.request.user)
        else:
            return serializer.save()

    def get_permissions(self):
        if self.action in ['update', 'destroy', 'partial_update']:
            permission_list = [utils.ObjectOwnerOrAdmin]
        elif self.action in ['create', 'clone', 'subscribe', 'unsubscribe']:
            permission_list = [permissions.IsAuthenticated]
        elif self.action in ['claim']:
            permission_list = [utils.IsClaimable]
        else:
            permission_list = [permissions.AllowAny]
        return [permission() for permission in permission_list]

    def _get_item(self) -> m.LibraryItem:
        return cast(m.LibraryItem, self.get_object())

    @extend_schema(
        summary='clone item including contents',
        tags=['Library'],
        request=s.LibraryItemSerializer,
        responses={
            c.HTTP_201_CREATED: s.RSFormParseSerializer,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @transaction.atomic
    @action(detail=True, methods=['post'], url_path='clone')
    def clone(self, request: Request, pk):
        ''' Endpoint: Create deep copy of library item. '''
        serializer = s.LibraryItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        item = self._get_item()
        if item.item_type == m.LibraryItemType.RSFORM:
            schema = m.RSForm(item)
            clone_data = s.RSFormTRSSerializer(schema).data
            clone_data['item_type'] = item.item_type
            clone_data['owner'] = self.request.user
            clone_data['title'] = serializer.validated_data['title']
            clone_data['alias'] = serializer.validated_data.get('alias', '')
            clone_data['comment'] = serializer.validated_data.get('comment', '')
            clone_data['is_common'] = serializer.validated_data.get('is_common', False)
            clone_data['is_canonical'] = serializer.validated_data.get('is_canonical', False)
            clone = s.RSFormTRSSerializer(data=clone_data, context={'load_meta': True})
            clone.is_valid(raise_exception=True)
            new_schema = clone.save()
            return Response(
                status=c.HTTP_201_CREATED,
                data=s.RSFormParseSerializer(new_schema.item).data
            )
        return Response(status=c.HTTP_404_NOT_FOUND)

    @extend_schema(
        summary='claim item',
        tags=['Library'],
        request=None,
        responses={c.HTTP_200_OK: s.LibraryItemSerializer}
    )
    @transaction.atomic
    @action(detail=True, methods=['post'])
    def claim(self, request: Request, pk=None):
        ''' Endpoint: Claim ownership of LibraryItem. '''
        item = self._get_item()
        if item.owner == self.request.user:
            return Response(status=c.HTTP_304_NOT_MODIFIED)
        else:
            item.owner = cast(m.User, self.request.user)
            item.save()
            m.Subscription.subscribe(user=item.owner, item=item)
            return Response(
                status=c.HTTP_200_OK,
                data=s.LibraryItemSerializer(item).data
            )

    @extend_schema(
        summary='subscribe to item',
        tags=['Library'],
        request=None,
        responses={c.HTTP_204_NO_CONTENT: None}
    )
    @action(detail=True, methods=['post'])
    def subscribe(self, request: Request, pk):
        ''' Endpoint: Subscribe current user to item. '''
        item = self._get_item()
        m.Subscription.subscribe(user=cast(m.User, self.request.user), item=item)
        return Response(status=c.HTTP_204_NO_CONTENT)

    @extend_schema(
        summary='unsubscribe from item',
        tags=['Library'],
        request=None,
        responses={c.HTTP_204_NO_CONTENT: None},
    )
    @action(detail=True, methods=['delete'])
    def unsubscribe(self, request: Request, pk):
        ''' Endpoint: Unsubscribe current user from item. '''
        item = self._get_item()
        m.Subscription.unsubscribe(user=cast(m.User, self.request.user), item=item)
        return Response(status=c.HTTP_204_NO_CONTENT)
