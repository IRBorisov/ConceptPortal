''' Endpoint: library context search. '''
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import generics
from rest_framework import status as c
from rest_framework.request import Request
from rest_framework.response import Response

from shared import permissions

from .. import models as m
from .. import serializers as s
from ..services.context_search import context_search_query, ids_for_context_search


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
    queryset = m.LibraryItem.objects.none()
    permission_classes = (permissions.Anyone,)

    def get(self, request: Request) -> Response:
        serializer = s.LibraryContextSearchSerializer(
            data=context_search_query(request.query_params)
        )
        serializer.is_valid(raise_exception=True)
        ids = ids_for_context_search(request.user, serializer.validated_data)
        return Response(s.LibraryContextSearchResponseSerializer({'ids': ids}).data)
