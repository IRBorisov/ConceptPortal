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

from apps.rsform.models import RSForm
from apps.rsform.serializers import RSFormParseSerializer
from apps.users.models import User
from shared import permissions

from .. import models as m
from .. import serializers as s


@extend_schema(tags=['Library'])
@extend_schema_view()
class LibraryViewSet(viewsets.ModelViewSet):
    ''' Endpoint: Library operations. '''
    queryset = m.LibraryItem.objects.all()

    filter_backends = (DjangoFilterBackend, filters.OrderingFilter)
    filterset_fields = ['item_type', 'owner']
    ordering_fields = ('item_type', 'owner', 'alias', 'title', 'time_update')
    ordering = '-time_update'

    def get_serializer_class(self):
        if self.action == 'create':
            return s.LibraryItemBaseSerializer
        return s.LibraryItemSerializer

    def perform_create(self, serializer):
        if not self.request.user.is_anonymous and 'owner' not in self.request.POST:
            return serializer.save(owner=self.request.user)
        else:
            return serializer.save()

    def get_permissions(self):
        if self.action in ['update', 'partial_update']:
            access_level = permissions.ItemEditor
        elif self.action in [
            'destroy',
            'set_owner',
            'set_access_policy',
            'set_location',
            'add_editor',
            'remove_editor',
            'set_editors'
        ]:
            access_level = permissions.ItemOwner
        elif self.action in [
            'create',
            'clone',
            'subscribe',
            'unsubscribe'
        ]:
            access_level = permissions.GlobalUser
        else:
            access_level = permissions.ItemAnyone
        return [access_level()]

    def _get_item(self) -> m.LibraryItem:
        return cast(m.LibraryItem, self.get_object())

    @extend_schema(
        summary='clone item including contents',
        tags=['Library'],
        request=s.LibraryItemCloneSerializer,
        responses={
            c.HTTP_201_CREATED: RSFormParseSerializer,
            c.HTTP_400_BAD_REQUEST: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['post'], url_path='clone')
    def clone(self, request: Request, pk):
        ''' Endpoint: Create deep copy of library item. '''
        serializer = s.LibraryItemCloneSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        item = self._get_item()
        if item.item_type != m.LibraryItemType.RSFORM:
            return Response(status=c.HTTP_400_BAD_REQUEST)

        clone = deepcopy(item)
        clone.pk = None
        clone.owner = self.request.user
        clone.title = serializer.validated_data['title']
        clone.alias = serializer.validated_data.get('alias', '')
        clone.comment = serializer.validated_data.get('comment', '')
        clone.visible = serializer.validated_data.get('visible', True)
        clone.read_only = False
        clone.access_policy = serializer.validated_data.get('access_policy', m.AccessPolicy.PUBLIC)
        clone.location = serializer.validated_data.get('location', m.LocationHead.USER)

        with transaction.atomic():
            clone.save()
            need_filter = 'items' in request.data
            for cst in RSForm(item).constituents():
                if not need_filter or cst.pk in request.data['items']:
                    cst.pk = None
                    cst.schema = clone
                    cst.save()
            return Response(
                status=c.HTTP_201_CREATED,
                data=RSFormParseSerializer(clone).data
            )

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
        m.Subscription.subscribe(user=cast(User, self.request.user), item=item)
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
        m.Subscription.unsubscribe(user=cast(User, self.request.user), item=item)
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
        summary='set AccessPolicy for item',
        tags=['Library'],
        request=s.AccessPolicySerializer,
        responses={
            c.HTTP_200_OK: None,
            c.HTTP_400_BAD_REQUEST: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['patch'], url_path='set-access-policy')
    def set_access_policy(self, request: Request, pk):
        ''' Endpoint: Set item AccessPolicy. '''
        item = self._get_item()
        serializer = s.AccessPolicySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_policy = serializer.validated_data['access_policy']
        m.LibraryItem.objects.filter(pk=item.pk).update(access_policy=new_policy)
        return Response(status=c.HTTP_200_OK)

    @extend_schema(
        summary='set location for item',
        tags=['Library'],
        request=s.LocationSerializer,
        responses={
            c.HTTP_200_OK: None,
            c.HTTP_400_BAD_REQUEST: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['patch'], url_path='set-location')
    def set_location(self, request: Request, pk):
        ''' Endpoint: Set item location. '''
        item = self._get_item()
        serializer = s.LocationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        location: str = serializer.validated_data['location']
        if location.startswith(m.LocationHead.LIBRARY) and not self.request.user.is_staff:
            return Response(status=c.HTTP_403_FORBIDDEN)
        m.LibraryItem.objects.filter(pk=item.pk).update(location=location)
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
    @action(detail=True, methods=['patch'], url_path='add-editor')
    def add_editor(self, request: Request, pk):
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
    @action(detail=True, methods=['patch'], url_path='remove-editor')
    def remove_editor(self, request: Request, pk):
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
    @action(detail=True, methods=['patch'], url_path='set-editors')
    def set_editors(self, request: Request, pk):
        ''' Endpoint: Set list of editors for item. '''
        item = self._get_item()
        serializer = s.UsersListSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        editors = serializer.validated_data['users']
        m.Editor.set(item=item, users=editors)
        return Response(status=c.HTTP_200_OK)


@extend_schema(tags=['Library'])
@extend_schema_view()
class LibraryActiveView(generics.ListAPIView):
    ''' Endpoint: Get list of library items available for active user. '''
    permission_classes = (permissions.Anyone,)
    serializer_class = s.LibraryItemSerializer

    def get_queryset(self):
        common_location = Q(location__startswith=m.LocationHead.COMMON) | Q(location__startswith=m.LocationHead.LIBRARY)
        is_public = Q(access_policy=m.AccessPolicy.PUBLIC)
        if self.request.user.is_anonymous:
            return m.LibraryItem.objects \
                .filter(is_public) \
                .filter(common_location).order_by('-time_update')
        else:
            user = cast(User, self.request.user)
            # pylint: disable=unsupported-binary-operation
            return m.LibraryItem.objects.filter(
                (is_public & common_location) |
                Q(owner=user) |
                Q(editor__editor=user) |
                Q(subscription__user=user)
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
