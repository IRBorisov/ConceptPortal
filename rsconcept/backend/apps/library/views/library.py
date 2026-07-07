''' Endpoints for library. '''
from typing import cast

from django.db import transaction
from django.db.models import Q
from django.http import HttpResponse
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import generics
from rest_framework import status as c
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.request import Request
from rest_framework.response import Response

from apps.oss.models import Layout, Operation, OperationSchema, PropagationFacade
from apps.rsmodel.models import RSModel
from apps.users.models import User
from shared import permissions
from shared.throttling import OssCloneRateThrottle

from .. import models as m
from .. import serializers as s
from ..services.clone import clone_library_item
from ..services.context_search import get_accessible_library_items_by_ids


@extend_schema(tags=['Library'])
@extend_schema_view()
class LibraryViewSet(viewsets.ModelViewSet):
    ''' Endpoint: Library operations. '''
    queryset = m.LibraryItem.objects.all()
    ordering = '-time_update'

    def get_serializer_class(self):
        if self.action == 'create':
            return s.LibraryItemCreateSerializer
        return s.LibraryItemSerializer

    def perform_create(self, serializer) -> None:
        location = serializer.validated_data.get('location')
        if location and location.startswith(m.LocationHead.LIBRARY) and not self.request.user.is_staff:
            raise PermissionDenied()

        if not self.request.user.is_anonymous and 'owner' not in self.request.POST:
            serializer.save(owner=self.request.user)
        else:
            serializer.save()
        if serializer.data.get('item_type') == m.LibraryItemType.OPERATION_SCHEMA:
            Layout.objects.create(oss=serializer.instance, data=[])
        if serializer.data.get('item_type') == m.LibraryItemType.RSMODEL:
            schema = getattr(serializer, '_schema')
            RSModel.objects.create(model=serializer.instance, schema=schema)

    def perform_update(self, serializer) -> None:
        instance_before = cast(m.LibraryItem, serializer.instance)
        old_read_only = instance_before.read_only
        instance = serializer.save()
        if (
            instance.item_type == m.LibraryItemType.OPERATION_SCHEMA
            and 'read_only' in serializer.validated_data
            and instance.read_only != old_read_only
        ):
            owned_schemas = OperationSchema.owned_schemasQ(instance).only('read_only')
            for schema in owned_schemas:
                schema.read_only = instance.read_only
            m.LibraryItem.objects.bulk_update(owned_schemas, ['read_only'])
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
            PropagationFacade().before_delete_schema(instance.pk)
            model_bindings = RSModel.objects.filter(schema=instance)
            for binding in model_bindings:
                self.perform_destroy(binding.model)
            super().perform_destroy(instance)
        elif instance.item_type == m.LibraryItemType.OPERATION_SCHEMA:
            schemas = list(OperationSchema.owned_schemasQ(instance))
            super().perform_destroy(instance)
            for schema in schemas:
                self.perform_destroy(schema)
        elif instance.item_type == m.LibraryItemType.RSMODEL:
            super().perform_destroy(instance)
        else:
            super().perform_destroy(instance)

    def get_throttles(self):
        if self.action == 'clone':
            return [OssCloneRateThrottle()]
        return super().get_throttles()

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
            c.HTTP_201_CREATED: None,
            c.HTTP_400_BAD_REQUEST: None,
            c.HTTP_403_FORBIDDEN: None,
            c.HTTP_404_NOT_FOUND: None
        }
    )
    @action(detail=True, methods=['post'], url_path='clone')
    def clone(self, request: Request, pk) -> HttpResponse:
        ''' Endpoint: Create deep copy of library item. '''
        item = self._get_item()
        if not permissions.can_read_library_item(request.user, item):
            raise PermissionDenied()
        if item.item_type not in [
            m.LibraryItemType.RSFORM,
            m.LibraryItemType.RSMODEL,
            m.LibraryItemType.OPERATION_SCHEMA
        ]:
            return Response(status=c.HTTP_400_BAD_REQUEST)

        serializer = s.LibraryItemCloneSerializer(
            data=request.data,
            context={'target': item, 'request': request}
        )
        serializer.is_valid(raise_exception=True)
        items_list = None
        if 'items' in serializer.validated_data:
            items_list = [item.pk for item in serializer.validated_data['items']]
        clone = clone_library_item(
            item,
            cast(User, self.request.user),
            serializer.validated_data['item_data'],
            items_list=items_list
        )

        return Response(status=c.HTTP_201_CREATED, data=(
            s.LibraryItemSerializer(clone).data
        ))

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
            m.LibraryItem.objects.filter(pk=item.pk).update(location=location)

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
            m.LibraryItem.objects.filter(pk=item.pk).update(access_policy=new_policy)

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


@extend_schema(tags=['Library'])
@extend_schema_view(
    get=extend_schema(
        summary='get library items by ids',
        parameters=[s.LibraryItemsByIdsSerializer],
        responses={c.HTTP_200_OK: s.LibraryItemSerializer(many=True)},
    )
)
class LibraryItemsByIdsView(generics.GenericAPIView):
    ''' Endpoint: Get library item metadata for accessible ids. '''
    queryset = m.LibraryItem.objects.none()
    permission_classes = (permissions.Anyone,)

    def get(self, request: Request) -> Response:
        serializer = s.LibraryItemsByIdsSerializer(
            data={'ids': request.query_params.get('ids', '')}
        )
        serializer.is_valid(raise_exception=True)
        items = get_accessible_library_items_by_ids(
            request.user,
            serializer.validated_data['ids']
        )
        return Response(s.LibraryItemSerializer(items, many=True).data)
