''' Guarded publication for a separately authenticated MCP approval flow. '''
from uuid import uuid4

from django.db import transaction
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import serializers, status
from rest_framework.exceptions import APIException, PermissionDenied, ValidationError
from rest_framework.response import Response

from apps.library.models import LibraryItem, LibraryItemType
from apps.oss.models import Inheritance
from apps.rsform.models import RSForm
from apps.rsform.mutations import replace_schema_content
from apps.rsform.serializers import RSFormImportJsonSerializer, RSFormParseSerializer, RSFormSerializer
from shared.serializers import StrictSerializer

from .base import AgentItemView


class PublicationConflict(APIException):
    ''' A changed base cannot be replaced by a previously prepared publication. '''
    status_code = status.HTTP_409_CONFLICT
    default_detail = 'Schema changed. Prepare and approve publication again.'
    default_code = 'publication_conflict'


class PublicationSerializer(StrictSerializer):
    ''' A complete schema with the timestamp observed before human approval. '''
    expected_time_update = serializers.DateTimeField()
    schema = RSFormImportJsonSerializer()


class AgentIdentityView(AgentItemView):
    ''' Resolve the account owning a supplied key without returning its secret. '''

    @extend_schema(tags=['Agents'], responses={200: dict})
    def get(self, request):
        return Response({'id': request.user.pk, 'username': request.user.username})


class AgentRsformPublishView(AgentItemView):
    ''' Owner-only replacement with an atomic base claim and rollback snapshot. '''
    agent_action = 'rsform.publish'
    agent_heavy = True

    @extend_schema(tags=['Agents'], request=PublicationSerializer, responses={200: dict, 409: dict})
    def post(self, request, pk: int):
        serializer = PublicationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            item = self._get_item(pk, LibraryItemType.RSFORM)
            self._require_edit(item)
            if item.owner_id != request.user.pk and not request.user.is_staff:
                raise PermissionDenied('Publication requires owner access to preserve a version.')
            claimed = LibraryItem.objects.filter(
                pk=item.pk, time_update=serializer.validated_data['expected_time_update'],
            ).update(time_update=timezone.now())
            if not claimed:
                raise PublicationConflict()
            # Recheck current object permissions after obtaining the write lock.
            item.refresh_from_db()
            self._require_edit(item)
            if item.owner_id != request.user.pk and not request.user.is_staff:
                raise PermissionDenied()
            if Inheritance.objects.filter(child__schema_id=item.pk).exists():
                raise ValidationError('Cannot replace an inherited schema.')
            snapshot = RSForm(item).create_version(
                version=f'mcp-{uuid4().hex}', description='Before approved MCP publication',
                data=RSFormSerializer(item).to_versioned_data(),
            )
            replace_schema_content(item, serializer.validated_data['schema'])
            item.refresh_from_db()
            self._log('rsform.publish', status.HTTP_200_OK, summary='Approved MCP publication', item=item)
            return Response({'version': snapshot.pk, 'schema': RSFormParseSerializer(item).data})
