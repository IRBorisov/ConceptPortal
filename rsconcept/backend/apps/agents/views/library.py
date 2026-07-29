''' Views: agent library helpers (API key auth). '''
from typing import cast

from django.db.models import Q
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import generics
from rest_framework import status as c
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.library import models as lib_models
from apps.library import serializers as lib_serializers
from apps.library.services.context_search import (
    get_accessible_library_items_by_ids,
    search_library_context
)
from apps.users.models import User

from ..authentication import ApiKeyAuthentication
from ..permissions import IsApiKeyAuthenticated
from ..throttling import AgentsRateThrottle

_CONTEXT_SEARCH_PARAMS = ('q', 'search_fields', 'admin', 'location', 'subfolders', 'item_type')


class AgentApiMixin:
    ''' Shared auth for agent data routes. '''
    authentication_classes = [ApiKeyAuthentication]
    permission_classes = [IsApiKeyAuthenticated]
    throttle_classes = [AgentsRateThrottle]


@extend_schema(tags=['Agents'])
@extend_schema_view(
    get=extend_schema(summary='List library items accessible to the API key user'),
)
class AgentLibraryActiveView(AgentApiMixin, generics.ListAPIView):
    ''' Agent: accessible library metadata. '''
    serializer_class = lib_serializers.LibraryItemSerializer

    def get_queryset(self):
        common_location = Q(location__startswith=lib_models.LocationHead.COMMON) | Q(
            location__startswith=lib_models.LocationHead.LIBRARY
        )
        is_public = Q(access_policy=lib_models.AccessPolicy.PUBLIC)
        user = cast(User, self.request.user)
        return lib_models.LibraryItem.objects.filter(
            (is_public & common_location) |
            Q(owner=user) |
            Q(editor__editor=user)
        ).distinct().order_by('-time_update')


@extend_schema(tags=['Agents'])
@extend_schema_view(
    get=extend_schema(
        summary='Search library by nested text (as API key user)',
        parameters=[lib_serializers.LibraryContextSearchSerializer],
        responses={c.HTTP_200_OK: lib_serializers.LibraryContextSearchResponseSerializer},
    )
)
class AgentLibraryContextSearchView(AgentApiMixin, APIView):
    ''' Agent: context search. '''

    def get(self, request: Request) -> Response:
        data = {
            key: request.query_params[key]
            for key in _CONTEXT_SEARCH_PARAMS
            if key in request.query_params
        }
        serializer = lib_serializers.LibraryContextSearchSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        validated = serializer.validated_data

        admin = validated.get('admin', False)
        if admin and not request.user.is_staff:
            admin = False

        ids = search_library_context(
            request.user,
            validated.get('q', ''),
            fields=validated.get('search_fields'),
            all_items=admin,
            location=validated.get('location'),
            subfolders=validated.get('subfolders', False),
            item_type=validated.get('item_type'),
        )
        return Response(
            lib_serializers.LibraryContextSearchResponseSerializer({'ids': ids}).data
        )


@extend_schema(tags=['Agents'])
@extend_schema_view(
    get=extend_schema(
        summary='Get library item metadata by ids',
        parameters=[lib_serializers.LibraryItemsByIdsSerializer],
        responses={c.HTTP_200_OK: lib_serializers.LibraryItemSerializer(many=True)},
    )
)
class AgentLibraryItemsByIdsView(AgentApiMixin, APIView):
    ''' Agent: metadata by ids. '''

    def get(self, request: Request) -> Response:
        serializer = lib_serializers.LibraryItemsByIdsSerializer(
            data={'ids': request.query_params.get('ids', '')}
        )
        serializer.is_valid(raise_exception=True)
        items = get_accessible_library_items_by_ids(
            request.user,
            serializer.validated_data['ids'],
        )
        return Response(lib_serializers.LibraryItemSerializer(items, many=True).data)
