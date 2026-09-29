''' Views: agent library helpers (API key auth). '''
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import generics
from rest_framework import status as c
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.library import serializers as lib_serializers
from apps.library.services.context_search import (
    context_search_query,
    get_accessible_items_queryset,
    get_accessible_library_items_by_ids,
    ids_for_context_search,
)

from ..authentication import ApiKeyAuthentication
from ..permissions import IsApiKeyAuthenticated
from ..throttling import AgentReadThrottle


@extend_schema(tags=['Agents'])
@extend_schema_view(
    get=extend_schema(summary='List library items accessible to the API key user'),
)
class AgentLibraryActiveView(generics.ListAPIView):
    ''' Agent: accessible library metadata. '''
    authentication_classes = [ApiKeyAuthentication]
    permission_classes = [IsApiKeyAuthenticated]
    throttle_classes = [AgentReadThrottle]
    serializer_class = lib_serializers.LibraryItemSerializer

    def get_queryset(self):
        return get_accessible_items_queryset(self.request.user).order_by('-time_update')


@extend_schema(tags=['Agents'])
@extend_schema_view(
    get=extend_schema(
        summary='Search library by nested text (as API key user)',
        parameters=[lib_serializers.LibraryContextSearchSerializer],
        responses={c.HTTP_200_OK: lib_serializers.LibraryContextSearchResponseSerializer},
    )
)
class AgentLibraryContextSearchView(APIView):
    ''' Agent: context search. '''
    authentication_classes = [ApiKeyAuthentication]
    permission_classes = [IsApiKeyAuthenticated]
    throttle_classes = [AgentReadThrottle]

    def get(self, request: Request) -> Response:
        serializer = lib_serializers.LibraryContextSearchSerializer(
            data=context_search_query(request.query_params)
        )
        serializer.is_valid(raise_exception=True)
        ids = ids_for_context_search(request.user, serializer.validated_data)
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
class AgentLibraryItemsByIdsView(APIView):
    ''' Agent: metadata by ids. '''
    authentication_classes = [ApiKeyAuthentication]
    permission_classes = [IsApiKeyAuthenticated]
    throttle_classes = [AgentReadThrottle]

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
