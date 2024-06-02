''' Custom Permission classes.
    Hierarchy: Anyone -> User -> Editor -> Owner -> Admin
'''
from typing import Any, cast

from django.core.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny as Anyone  # pylint: disable=unused-import
from rest_framework.permissions import BasePermission as _Base
from rest_framework.permissions import \
    IsAuthenticated as GlobalUser  # pylint: disable=unused-import
from rest_framework.request import Request
from rest_framework.views import APIView

from . import models as m


def _extract_item(obj: Any) -> m.LibraryItem:
    if isinstance(obj, m.LibraryItem):
        return obj
    elif isinstance(obj, m.Constituenta):
        return cast(m.LibraryItem, obj.schema)
    elif isinstance(obj, (m.Version, m.Subscription, m.Editor)):
        return cast(m.LibraryItem, obj.item)
    raise PermissionDenied({
        'message': 'Invalid type error. Please contact developers',
        'object_id': obj.id
    })


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
    ''' Item permission: Editor or higher. '''

    def has_object_permission(self, request: Request, view: APIView, obj: Any) -> bool:
        item = _extract_item(obj)
        if m.Editor.objects.filter(
            item=item,
            editor=cast(m.User, request.user)
        ).exists() and item.access_policy != m.AccessPolicy.PRIVATE:
            return True
        return super().has_object_permission(request, view, obj)


class ItemAnyone(ItemEditor):
    ''' Item permission: Anyone if public. '''

    def has_object_permission(self, request: Request, view: APIView, obj: Any) -> bool:
        item = _extract_item(obj)
        if item.access_policy == m.AccessPolicy.PUBLIC:
            return True
        return super().has_object_permission(request, view, obj)


class EditorMixin(APIView):
    ''' Editor permissions mixin for API views. '''

    def get_permissions(self):
        result = super().get_permissions()
        if self.request.method.upper() == 'GET':
            result.append(Anyone())
        else:
            result.append(ItemEditor())
        return result
