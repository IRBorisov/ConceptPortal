''' Views: API key management (session auth only). '''
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import status as c
from rest_framework import viewsets
from rest_framework.authentication import SessionAuthentication
from rest_framework.request import Request
from rest_framework.response import Response

from ..models import ApiKey
from ..permissions import IsSessionUser
from ..serializers import (
    ApiKeyCreatedSerializer,
    ApiKeyCreateSerializer,
    ApiKeySerializer,
    ApiKeyUpdateSerializer
)


@extend_schema(tags=['Agents'])
@extend_schema_view(
    list=extend_schema(summary='List own API keys'),
    create=extend_schema(
        summary='Create API key (secret shown once)',
        request=ApiKeyCreateSerializer,
        responses={c.HTTP_201_CREATED: ApiKeyCreatedSerializer},
    ),
    partial_update=extend_schema(
        summary='Rename API key',
        request=ApiKeyUpdateSerializer,
        responses={c.HTTP_200_OK: ApiKeySerializer},
    ),
    destroy=extend_schema(summary='Revoke API key'),
)
class ApiKeyViewSet(viewsets.ViewSet):
    ''' CRUD for the current user's API keys. Session auth only. '''
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsSessionUser]

    def list(self, request: Request) -> Response:
        keys = ApiKey.objects.filter(owner=request.user, revoked_at__isnull=True)
        return Response(ApiKeySerializer(keys, many=True).data)

    def create(self, request: Request) -> Response:
        serializer = ApiKeyCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        key, secret = ApiKey.create_for_user(
            owner=request.user,
            label=serializer.validated_data['label'],
        )
        payload = {
            'id': key.id,
            'label': key.label,
            'prefix': key.prefix,
            'created_at': key.created_at,
            'secret': secret,
        }
        return Response(ApiKeyCreatedSerializer(payload).data, status=c.HTTP_201_CREATED)

    def partial_update(self, request: Request, pk=None) -> Response:
        try:
            key = ApiKey.objects.get(pk=pk, owner=request.user, revoked_at__isnull=True)
        except ApiKey.DoesNotExist:
            return Response(status=c.HTTP_404_NOT_FOUND)
        serializer = ApiKeyUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        key.label = serializer.validated_data['label']
        key.save(update_fields=['label'])
        return Response(ApiKeySerializer(key).data)

    def destroy(self, request: Request, pk=None) -> Response:
        try:
            key = ApiKey.objects.get(pk=pk, owner=request.user, revoked_at__isnull=True)
        except ApiKey.DoesNotExist:
            return Response(status=c.HTTP_404_NOT_FOUND)
        key.revoke()
        return Response(status=c.HTTP_204_NO_CONTENT)
