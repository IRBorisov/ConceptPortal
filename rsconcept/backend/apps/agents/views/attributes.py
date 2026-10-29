''' Views: agent updates of library item attributes (API key, owner). '''
from __future__ import annotations

from django.db import transaction
from django.http import HttpResponse
from drf_spectacular.utils import extend_schema
from rest_framework import status as c
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.request import Request
from rest_framework.response import Response

from apps.library import serializers as lib_serializers
from apps.library.models import LibraryItem
from apps.library.services.item_attributes import set_item_access_policy, set_item_location
from apps.library.services.location_access import assert_can_write_location

from .base import AgentItemView


class AgentLibraryAttributeView(AgentItemView):
    ''' Owner or staff may change one library attribute. Editors may not. '''

    def _owned_item(self, pk: int) -> LibraryItem:
        ''' Lock an item the key user owns, or that staff may manage.

        Call inside ``transaction.atomic``. The row stays locked until the
        write commits, so an owner transfer cannot land between the check and
        the update.
        '''
        try:
            item = LibraryItem.objects.select_for_update().get(pk=pk)
        except LibraryItem.DoesNotExist as exc:
            raise NotFound() from exc
        user = self.request.user
        if not getattr(user, 'is_staff', False) and item.owner_id != user.pk:
            raise PermissionDenied()
        return item

    def _respond(self, item: LibraryItem, action: str, summary: str) -> Response:
        ''' Log the change and return the item metadata. '''
        self._log(action, c.HTTP_200_OK, summary=summary, item=item)
        return Response(lib_serializers.LibraryItemSerializer(item).data)


@extend_schema(
    tags=['Agents'],
    summary='Set library item location (owner or staff)',
    request=lib_serializers.LocationSerializer,
    responses={c.HTTP_200_OK: lib_serializers.LibraryItemSerializer},
)
class AgentSetLocationView(AgentLibraryAttributeView):
    ''' Agent: move a library item. Same folder rules as the library UI. '''
    agent_action = 'library.set_location'

    def patch(self, request: Request, pk: int) -> HttpResponse:
        ''' Set ``location``. Owned OSS results in the same folder move too. '''
        with transaction.atomic():
            item = self._owned_item(pk)
            serializer = lib_serializers.LocationSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            location: str = serializer.validated_data['location']
            if location != item.location:
                assert_can_write_location(request.user, location)
                set_item_location(item, location)
            return self._respond(item, 'library.set_location', f'Location {item.location}')


@extend_schema(
    tags=['Agents'],
    summary='Set library item access policy (owner or staff)',
    request=lib_serializers.AccessPolicySerializer,
    responses={c.HTTP_200_OK: lib_serializers.LibraryItemSerializer},
)
class AgentSetAccessPolicyView(AgentLibraryAttributeView):
    ''' Agent: change access policy. Editors cannot. '''
    agent_action = 'library.set_access_policy'

    def patch(self, request: Request, pk: int) -> HttpResponse:
        ''' Set ``access_policy``. Owned OSS results in the same folder follow it. '''
        with transaction.atomic():
            item = self._owned_item(pk)
            serializer = lib_serializers.AccessPolicySerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            access_policy: str = serializer.validated_data['access_policy']
            if access_policy != item.access_policy:
                set_item_access_policy(item, access_policy)
            return self._respond(
                item,
                'library.set_access_policy',
                f'Access policy {item.access_policy}',
            )
