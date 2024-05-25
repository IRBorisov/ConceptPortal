''' Endpoints for library. '''
from copy import deepcopy
from typing import cast

from django.db import transaction
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import filters, generics
from rest_framework import status as c
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response

from .. import models as m
from .. import permissions
from .. import serializers as s


@extend_schema(tags=['Library'])
@extend_schema_view()
class LibraryActiveView(generics.ListAPIView):
    ''' Endpoint: Get list of library items available for active user. '''
    permission_classes = (permissions.Anyone,)
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
class LibraryAdminView(generics.ListAPIView):
    ''' Endpoint: Get list of all library items. Admin only '''
    permission_classes = (permissions.GlobalAdmin,)
    serializer_class = s.LibraryItemSerializer

    def get_queryset(self):
        return m.LibraryItem.objects.all().order_by('-time_update')


@extend_schema(tags=['Library'])
@extend_schema_view()
class LibraryTemplatesView(generics.ListAPIView):
    ''' Endpoint: Get list of templates. '''
    permission_classes = (permissions.Anyone,)
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
        if self.action in ['update', 'partial_update']:
            permission_list = [permissions.ItemEditor]
        elif self.action in [
            'destroy', 'set_owner',
            'editors_add', 'editors_remove', 'editors_set'
        ]:
            permission_list = [permissions.ItemOwner]
        elif self.action in ['create', 'clone', 'subscribe', 'unsubscribe']:
            permission_list = [permissions.GlobalUser]
        else:
            permission_list = [permissions.Anyone]
        return [permission() for permission in permission_list]

    def _get_item(self) -> m.LibraryItem:
        return cast(m.LibraryItem, self.get_object())

    @extend_schema(
        summary='clone item including contents',
        tags=['Library'],
        request=s.LibraryItemCloneSerializer,
        responses={
            c.HTTP_201_CREATED: s.RSFormParseSerializer,
            c.HTTP_400_BAD_REQUEST: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @transaction.atomic
    @action(detail=True, methods=['post'], url_path='clone')
    def clone(self, request: Request, pk):
        ''' Endpoint: Create deep copy of library item. '''
        serializer = s.LibraryItemCloneSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        item = self._get_item()
        clone = deepcopy(item)
        clone.pk = None
        clone.owner = self.request.user
        clone.title = serializer.validated_data['title']
        clone.alias = serializer.validated_data.get('alias', '')
        clone.comment = serializer.validated_data.get('comment', '')
        clone.is_common = serializer.validated_data.get('is_common', False)
        clone.is_canonical = False

        if clone.item_type == m.LibraryItemType.RSFORM:
            clone.save()

            need_filter = 'items' in request.data
            for cst in m.RSForm(item).constituents():
                if not need_filter or cst.pk in request.data['items']:
                    cst.pk = None
                    cst.schema = clone
                    cst.save()
            return Response(
                status=c.HTTP_201_CREATED,
                data=s.RSFormParseSerializer(clone).data
            )
        return Response(status=c.HTTP_400_BAD_REQUEST)

    @extend_schema(
        summary='subscribe to item',
        tags=['Library'],
        request=None,
        responses={
            c.HTTP_200_OK: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['post'])
    def subscribe(self, request: Request, pk):
        ''' Endpoint: Subscribe current user to item. '''
        item = self._get_item()
        m.Subscription.subscribe(user=cast(m.User, self.request.user), item=item)
        return Response(status=c.HTTP_200_OK)

    @extend_schema(
        summary='unsubscribe from item',
        tags=['Library'],
        request=None,
        responses={
            c.HTTP_200_OK: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        },
    )
    @action(detail=True, methods=['delete'])
    def unsubscribe(self, request: Request, pk):
        ''' Endpoint: Unsubscribe current user from item. '''
        item = self._get_item()
        m.Subscription.unsubscribe(user=cast(m.User, self.request.user), item=item)
        return Response(status=c.HTTP_200_OK)

    @extend_schema(
        summary='set owner for item',
        tags=['Library'],
        request=s.UserTargetSerializer,
        responses={
            c.HTTP_200_OK: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['patch'], url_path='set-owner')
    def set_owner(self, request: Request, pk):
        ''' Endpoint: Set item owner. '''
        item = self._get_item()
        serializer = s.UserTargetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_owner = serializer.validated_data['user']
        m.LibraryItem.objects.filter(pk=item.pk).update(owner=new_owner)
        return Response(status=c.HTTP_200_OK)

    @extend_schema(
        summary='add editor for item',
        tags=['Library'],
        request=s.UserTargetSerializer,
        responses={
            c.HTTP_200_OK: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['patch'], url_path='editors-add')
    def editors_add(self, request: Request, pk):
        ''' Endpoint: Add editor for item. '''
        item = self._get_item()
        serializer = s.UserTargetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_editor = serializer.validated_data['user']
        m.Editor.add(item=item, user=new_editor)
        return Response(status=c.HTTP_200_OK)

    @extend_schema(
        summary='remove editor for item',
        tags=['Library'],
        request=s.UserTargetSerializer,
        responses={
            c.HTTP_200_OK: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['patch'], url_path='editors-remove')
    def editors_remove(self, request: Request, pk):
        ''' Endpoint: Remove editor for item. '''
        item = self._get_item()
        serializer = s.UserTargetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        editor = serializer.validated_data['user']
        m.Editor.remove(item=item, user=editor)
        return Response(status=c.HTTP_200_OK)

    @extend_schema(
        summary='set list of editors for item',
        tags=['Library'],
        request=s.UsersListSerializer,
        responses={
            c.HTTP_200_OK: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['patch'], url_path='editors-set')
    def editors_set(self, request: Request, pk):
        ''' Endpoint: Set list of editors for item. '''
        item = self._get_item()
        serializer = s.UsersListSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        editors = serializer.validated_data['users']
        m.Editor.set(item=item, users=editors)
        return Response(status=c.HTTP_200_OK)
