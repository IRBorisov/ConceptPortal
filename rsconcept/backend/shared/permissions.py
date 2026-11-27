''' Custom Permission classes.
    Hierarchy: Anyone -> User -> Editor -> Owner -> Admin
'''
from typing import Any, cast

from django.core.exceptions import PermissionDenied
from django.db.models import Q, QuerySet
from rest_framework.permissions import AllowAny as Anyone  # pylint: disable=unused-import
from rest_framework.permissions import BasePermission as _Base
from rest_framework.permissions import \
    IsAuthenticated as GlobalUser  # pylint: disable=unused-import
from rest_framework.request import Request
from rest_framework.views import APIView

from apps.library.models import AccessPolicy, Editor, LibraryItem, LibraryItemType, Version
from apps.oss.models import Inheritance, Operation, OperationType
from apps.rsform.models import Constituenta


def _extract_item(obj: Any) -> LibraryItem:
    ''' Resolve the owning ``LibraryItem`` from a library-related object. '''
    if isinstance(obj, LibraryItem):
        return obj
    elif isinstance(obj, Constituenta):
        return cast(LibraryItem, obj.schema)
    elif isinstance(obj, Operation):
        return cast(LibraryItem, obj.oss)
    elif isinstance(obj, (Version, Editor)):
        return cast(LibraryItem, obj.item)
    raise PermissionDenied({
        'message': 'Invalid type error. Please contact developers',
        'object_id': obj.pk
    })


def library_item_read_filter(user: Any) -> Q:
    ''' Direct object ACL, also usable in batched lookups. '''
    if user.is_anonymous:
        return Q(access_policy=AccessPolicy.PUBLIC)
    if user.is_staff:
        return Q()
    editor_items = Editor.objects.filter(editor_id=user.pk).values('item_id')
    return (Q(access_policy=AccessPolicy.PUBLIC) | Q(owner_id=user.pk)
            | (Q(pk__in=editor_items) & Q(access_policy=AccessPolicy.PROTECTED)))


def _relativization_links() -> QuerySet[Operation]:
    return Operation.objects.filter(
        operation_type=OperationType.RELATIVIZATION, result__isnull=False, relativization_source__isnull=False
    )


def source_schema_ids(schema_ids: set[int]) -> set[int]:
    ''' Find all live sources of derived data, including transitive sources. '''
    links = _relativization_links()
    sources: set[int] = set()
    frontier = schema_ids
    while frontier:
        parents = set(Inheritance.objects.filter(child__schema_id__in=frontier)
                      .values_list('parent__schema_id', flat=True).distinct())
        parents.update(
            source_id for source_id in links.filter(result_id__in=frontier)
            .values_list('relativization_source_id', flat=True).distinct() if source_id is not None
        )
        frontier = parents - sources - schema_ids
        sources.update(frontier)
    return sources


def unreadable_derived_schema_ids(user: Any) -> set[int]:
    ''' Find results with a source outside the reader's current ACL. '''
    if user.is_staff:
        return set()
    readable = LibraryItem.objects.filter(library_item_read_filter(user)).values('pk')
    links = Inheritance.objects.all()
    blocked = set(links.exclude(parent__schema_id__in=readable)
                  .values_list('child__schema_id', flat=True).distinct())
    relativizations = _relativization_links()
    blocked.update(
        result_id for result_id in relativizations.exclude(relativization_source_id__in=readable)
        .values_list('result_id', flat=True).distinct() if result_id is not None
    )
    frontier = blocked
    while frontier:
        children = set(links.filter(parent__schema_id__in=frontier)
                       .values_list('child__schema_id', flat=True).distinct())
        children.update(
            result_id for result_id in relativizations.filter(relativization_source_id__in=frontier)
            .values_list('result_id', flat=True).distinct() if result_id is not None
        )
        frontier = children - blocked
        blocked = blocked | frontier
    return blocked


def can_read_library_item(user: Any, item: LibraryItem) -> bool:
    ''' Read access includes all live sources of a derived schema. '''
    if user.is_staff:
        return True
    direct = (item.access_policy == AccessPolicy.PUBLIC
              or (not user.is_anonymous and (item.owner_id == user.pk
                  or (item.access_policy == AccessPolicy.PROTECTED
                      and Editor.objects.filter(item=item, editor_id=user.pk).exists()))))
    if not direct or item.item_type != LibraryItemType.RSFORM:
        return direct
    sources = source_schema_ids({item.pk})
    return not sources or not LibraryItem.objects.filter(pk__in=sources).exclude(
        library_item_read_filter(user)
    ).exists()


def can_edit_item(user, obj: Any) -> bool:
    ''' Whether *user* may mutate *obj* (owners/editors/staff; blocked for everyone when ``read_only``). '''
    if user.is_anonymous:
        return False

    item = _extract_item(obj)
    if item.read_only:
        return False
    if hasattr(user, 'is_staff') and user.is_staff:
        return True
    editable = item.owner_id == user.pk or (
        item.access_policy != AccessPolicy.PRIVATE and Editor.objects.filter(item=item, editor=user).exists()
    )
    return editable and can_read_library_item(user, item)


class GlobalAdmin(_Base):
    ''' Item permission: Admin or higher. '''

    def has_permission(self, request: Request, view: APIView) -> bool:
        if not hasattr(request.user, 'is_staff'):
            return False
        return request.user.is_staff  # type: ignore

    def has_object_permission(self, request: Request, view: APIView, obj: Any) -> bool:
        if not hasattr(request.user, 'is_staff'):
            return False
        return request.user.is_staff  # type: ignore


class ItemOwner(GlobalAdmin):
    ''' Item permission: Owner or higher. '''

    def has_permission(self, request: Request, view: APIView) -> bool:
        return not request.user.is_anonymous

    def has_object_permission(self, request: Request, view: APIView, obj: Any) -> bool:
        if request.user == _extract_item(obj).owner:
            return True
        return super().has_object_permission(request, view, obj)


class ItemEditor(ItemOwner):
    ''' Item permission: Editor or higher (blocked when ``read_only``). '''

    def has_object_permission(self, request: Request, view: APIView, obj: Any) -> bool:
        return can_edit_item(request.user, obj)


class ItemAnyone(ItemEditor):
    ''' Item permission: read access, including public items and read-only owners/editors. '''

    def has_permission(self, request: Request, view: APIView) -> bool:
        return True

    def has_object_permission(self, request: Request, view: APIView, obj: Any) -> bool:
        return can_read_library_item(request.user, _extract_item(obj))


class ItemReader(ItemAnyone):
    ''' Authenticated user who can read the item. '''
    def has_permission(self, request: Request, view: APIView) -> bool:
        return request.user.is_authenticated


class EditorMixin(APIView):
    ''' Editor permissions mixin for API views. '''

    def get_permissions(self):
        ''' GET and HEAD are read checks. Other methods require an editor.

        Replaces the global default so a public read is not also forced
        through ``IsAuthenticated``. Django serves HEAD with the GET handler,
        but the request method stays HEAD.
        '''
        if self.request.method.upper() in ('GET', 'HEAD'):
            return [ItemAnyone()]
        return [ItemEditor()]
