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

from apps.library.models import AccessPolicy, Editor, LibraryItem, Subscription, Version
from apps.oss.models import Operation
from apps.rsform.models import Constituenta
from apps.users.models import User


def _extract_item(obj: Any) -> LibraryItem:
    if isinstance(obj, LibraryItem):
        return obj
    elif isinstance(obj, Constituenta):
        return cast(LibraryItem, obj.schema)
    elif isinstance(obj, Operation):
        return cast(LibraryItem, obj.oss)
    elif isinstance(obj, (Version, Subscription, Editor)):
        return cast(LibraryItem, obj.item)
    raise PermissionDenied({
        'message': 'Invalid type error. Please contact developers',
        'object_id': obj.pk
    })


def can_edit_item(user, obj: Any) -> bool:
    if user.is_anonymous:
        return False
    if hasattr(user, 'is_staff') and user.is_staff:
        return True

    item = _extract_item(obj)
    if item.owner == user:
        return True

    if Editor.objects.filter(
        item=item,
        editor=cast(User, user)
    ).exists() and item.access_policy != AccessPolicy.PRIVATE:
        return True
    return False


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
        if request.user.is_anonymous:
            return False
        item = _extract_item(obj)
        if Editor.objects.filter(
            item=item,
            editor=cast(User, request.user)
        ).exists() and item.access_policy != AccessPolicy.PRIVATE:
            return True
        return super().has_object_permission(request, view, obj)


class ItemAnyone(ItemEditor):
    ''' Item permission: Anyone if public. '''

    def has_permission(self, request: Request, view: APIView) -> bool:
        return True

    def has_object_permission(self, request: Request, view: APIView, obj: Any) -> bool:
        item = _extract_item(obj)
        if item.access_policy == AccessPolicy.PUBLIC:
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
