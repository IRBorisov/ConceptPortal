''' Endpoint: library context search. '''
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import generics
from rest_framework import status as c
from rest_framework.request import Request
from rest_framework.response import Response

from shared import permissions

from .. import serializers as s
from ..services.context_search import search_library_context

_CONTEXT_SEARCH_PARAMS = ('q', 'search_fields', 'admin', 'location', 'subfolders', 'item_type')


@extend_schema(tags=['Library'])
@extend_schema_view(
    get=extend_schema(
        summary='search library items by nested text',
        parameters=[s.LibraryContextSearchSerializer],
        responses={c.HTTP_200_OK: s.LibraryContextSearchResponseSerializer},
    )
)
class LibraryContextSearchView(generics.GenericAPIView):
    ''' Endpoint: search library items by text in nested fields. '''
    permission_classes = (permissions.Anyone,)

    def get(self, request: Request) -> Response:
        data = {
            key: request.query_params[key]
            for key in _CONTEXT_SEARCH_PARAMS
            if key in request.query_params
        }
        serializer = s.LibraryContextSearchSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        validated = serializer.validated_data

        admin = validated.get('admin', False)
        if admin and not (request.user.is_authenticated and request.user.is_staff):
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
        return Response(s.LibraryContextSearchResponseSerializer({'ids': ids}).data)
