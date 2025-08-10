''' Endpoints for library. '''
from copy import deepcopy
from typing import cast

from django.db import transaction
from django.db.models import Q
from django.http import HttpResponse
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import generics
from rest_framework import status as c
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response

from apps.oss.models import Layout, Operation, OperationSchema, PropagationFacade
from apps.rsform.models import RSFormCached
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
    ordering = '-time_update'

    def get_serializer_class(self):
        if self.action == 'create':
            return s.LibraryItemBaseSerializer
        return s.LibraryItemSerializer

    def perform_create(self, serializer) -> None:
        if not self.request.user.is_anonymous and 'owner' not in self.request.POST:
            serializer.save(owner=self.request.user)
        else:
            serializer.save()
        if serializer.data.get('item_type') == m.LibraryItemType.OPERATION_SCHEMA:
            Layout.objects.create(oss=serializer.instance, data=[])

    def perform_update(self, serializer) -> None:
        instance = serializer.save()
        operations = Operation.objects.filter(result__pk=instance.pk)
        if not operations.exists():
            return
        update_list: list[Operation] = []
        for operation in operations:
            changed = False
            if operation.alias != instance.alias:
                operation.alias = instance.alias
                changed = True
            if operation.title != instance.title:
                operation.title = instance.title
                changed = True
            if operation.description != instance.description:
                operation.description = instance.description
                changed = True
            if changed:
                update_list.append(operation)
        if update_list:
            Operation.objects.bulk_update(update_list, ['alias', 'title', 'description'])

    def perform_destroy(self, instance: m.LibraryItem) -> None:
        if instance.item_type == m.LibraryItemType.RSFORM:
            PropagationFacade.before_delete_schema(instance)
            super().perform_destroy(instance)
        if instance.item_type == m.LibraryItemType.OPERATION_SCHEMA:
            schemas = list(OperationSchema.owned_schemasQ(instance))
            super().perform_destroy(instance)
            for schema in schemas:
                self.perform_destroy(schema)

    def get_permissions(self):
        if self.action in ['update', 'partial_update']:
            access_level = permissions.ItemEditor
        elif self.action in [
            'destroy',
            'set_owner',
            'set_access_policy',
            'set_location',
            'set_editors'
        ]:
            access_level = permissions.ItemOwner
        elif self.action in [
            'create',
            'clone',
            'rename_location'
        ]:
            access_level = permissions.GlobalUser
        else:
            access_level = permissions.ItemAnyone
        return [access_level()]

    def _get_item(self) -> m.LibraryItem:
        return cast(m.LibraryItem, self.get_object())

    @extend_schema(
        summary='rename location',
        tags=['Library'],
        request=s.RenameLocationSerializer,
        responses={
            c.HTTP_200_OK: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=False, methods=['patch'], url_path='rename-location')
    def rename_location(self, request: Request) -> HttpResponse:
        ''' Endpoint: Rename location. '''
        serializer = s.RenameLocationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        target = serializer.validated_data['target']
        new_location = serializer.validated_data['new_location']
        if target == new_location:
            return Response(status=c.HTTP_200_OK)
        if new_location.startswith(m.LocationHead.LIBRARY) and not self.request.user.is_staff:
            return Response(status=c.HTTP_403_FORBIDDEN)

        user_involved = new_location.startswith(m.LocationHead.USER) or target.startswith(m.LocationHead.USER)

        with transaction.atomic():
            changed: list[m.LibraryItem] = []
            items = m.LibraryItem.objects \
                .filter(Q(location=target) | Q(location__startswith=f'{target}/')) \
                .only('location', 'owner_id')
            for item in items:
                if item.owner_id == self.request.user.pk or (self.request.user.is_staff and not user_involved):
                    item.location = item.location.replace(target, new_location)
                    changed.append(item)
            if changed:
                m.LibraryItem.objects.bulk_update(changed, ['location'])

        return Response(status=c.HTTP_200_OK)

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
    def clone(self, request: Request, pk) -> HttpResponse:
        ''' Endpoint: Create deep copy of library item. '''
        item = self._get_item()
        if item.item_type != m.LibraryItemType.RSFORM:
            return Response(status=c.HTTP_400_BAD_REQUEST)

        serializer = s.LibraryItemCloneSerializer(data=request.data, context={'schema': item})
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data['item_data']
        with transaction.atomic():
            clone = deepcopy(item)
            clone.pk = None
            clone.owner = cast(User, self.request.user)
            clone.title = data['title']
            clone.alias = data.get('alias', '')
            clone.description = data.get('description', '')
            clone.visible = data.get('visible', True)
            clone.read_only = False
            clone.access_policy = data.get('access_policy', m.AccessPolicy.PUBLIC)
            clone.location = data.get('location', m.LocationHead.USER)
            clone.save()
            need_filter = 'items' in request.data and len(request.data['items']) > 0
            for cst in RSFormCached(item).constituentsQ():
                if not need_filter or cst.pk in request.data['items']:
                    cst.pk = None
                    cst.schema = clone
                    cst.save()
            return Response(
                status=c.HTTP_201_CREATED,
                data=RSFormParseSerializer(clone).data
            )

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
    def set_owner(self, request: Request, pk) -> HttpResponse:
        ''' Endpoint: Set item owner. '''
        item = self._get_item()
        serializer = s.UserTargetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_owner = serializer.validated_data['user'].pk
        if new_owner == item.owner_id:
            return Response(status=c.HTTP_200_OK)

        with transaction.atomic():
            if item.item_type == m.LibraryItemType.OPERATION_SCHEMA:
                owned_schemas = OperationSchema.owned_schemasQ(item).only('owner')
                for schema in owned_schemas:
                    schema.owner_id = new_owner
                m.LibraryItem.objects.bulk_update(owned_schemas, ['owner'])
            item.owner_id = new_owner
            item.save(update_fields=['owner'])

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
    def set_location(self, request: Request, pk) -> HttpResponse:
        ''' Endpoint: Set item location. '''
        item = self._get_item()
        serializer = s.LocationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        location: str = serializer.validated_data['location']
        if location == item.location:
            return Response(status=c.HTTP_200_OK)
        if location.startswith(m.LocationHead.LIBRARY) and not self.request.user.is_staff:
            return Response(status=c.HTTP_403_FORBIDDEN)

        with transaction.atomic():
            if item.item_type == m.LibraryItemType.OPERATION_SCHEMA:
                owned_schemas = OperationSchema.owned_schemasQ(item).only('location')
                for schema in owned_schemas:
                    schema.location = location
                m.LibraryItem.objects.bulk_update(owned_schemas, ['location'])
            item.location = location
            item.save(update_fields=['location'])

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
    def set_access_policy(self, request: Request, pk) -> HttpResponse:
        ''' Endpoint: Set item AccessPolicy. '''
        item = self._get_item()
        serializer = s.AccessPolicySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_policy = serializer.validated_data['access_policy']
        if new_policy == item.access_policy:
            return Response(status=c.HTTP_200_OK)

        with transaction.atomic():
            if item.item_type == m.LibraryItemType.OPERATION_SCHEMA:
                owned_schemas = OperationSchema.owned_schemasQ(item).only('access_policy')
                for schema in owned_schemas:
                    schema.access_policy = new_policy
                m.LibraryItem.objects.bulk_update(owned_schemas, ['access_policy'])
            item.access_policy = new_policy
            item.save(update_fields=['access_policy'])

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
    def set_editors(self, request: Request, pk) -> HttpResponse:
        ''' Endpoint: Set list of editors for item. '''
        item = self._get_item()
        serializer = s.UsersListSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        editors: list[int] = request.data['users']

        with transaction.atomic():
            added, deleted = m.Editor.set_and_return_diff(item.pk, editors)
            if added or deleted:
                owned_schemas = OperationSchema.owned_schemasQ(item).only('pk')
                if owned_schemas.exists():
                    m.Editor.objects.filter(
                        item__in=owned_schemas,
                        editor_id__in=deleted
                    ).delete()

                    existing_editors = m.Editor.objects.filter(
                        item__in=owned_schemas,
                        editor__in=added
                    ).values_list('item_id', 'editor_id')
                    existing_editor_set = set(existing_editors)

                    new_editors = [
                        m.Editor(item=schema, editor_id=user)
                        for schema in owned_schemas
                        for user in added
                        if (item.id, user) not in existing_editor_set
                    ]
                    m.Editor.objects.bulk_create(new_editors)

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
                Q(editor__editor=user)
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
