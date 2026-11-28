''' Guarded publication for a separately authenticated MCP approval flow. '''
from datetime import timedelta
from uuid import uuid4

from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import serializers, status
from rest_framework.exceptions import APIException, PermissionDenied, ValidationError
from rest_framework.response import Response

from apps.library.models import AccessPolicy, LibraryItem, LibraryItemType
from apps.oss.models import Inheritance
from apps.rsform.models import RSForm
from apps.rsform.mutations import replace_schema_content
from apps.rsform.serializers import RSFormImportJsonSerializer, RSFormParseSerializer, RSFormSerializer
from shared.serializers import StrictSerializer

from ..services.mutation_receipts import complete_receipt, mutation_receipt
from .base import IDEMPOTENCY_PARAMETER, AgentItemView


class PublicationConflict(APIException):
    ''' A changed base cannot be replaced by a previously prepared publication. '''
    status_code = status.HTTP_409_CONFLICT
    default_detail = 'Schema changed. Prepare and approve publication again.'
    default_code = 'publication_conflict'


class ExpectedPublicationTarget(StrictSerializer):
    ''' Metadata shown in the agreed summary, including edits outside the content revision. '''
    owner = serializers.IntegerField(allow_null=True)
    location = serializers.CharField(allow_blank=True)
    access_policy = serializers.ChoiceField(choices=AccessPolicy.choices)


class PublicationSerializer(StrictSerializer):
    ''' A complete schema with the timestamp observed before human approval. '''
    expected_time_update = serializers.DateTimeField()
    expected_target = ExpectedPublicationTarget(required=False)
    schema = RSFormImportJsonSerializer()


class AgentIdentityView(AgentItemView):
    ''' Resolve the account owning a supplied key without returning its secret. '''
    agent_require_key = True
    agent_scope = None  # Introspection is available to every active key, independently of data scopes.

    @extend_schema(tags=['Agents'], responses={200: dict})
    def get(self, request):
        return Response({'id': request.user.pk, 'username': request.user.username,
                         'scopes': request.auth.scopes, 'expires_at': request.auth.expires_at})


class AgentRsformPublishView(AgentItemView):
    ''' Owner-only replacement with an atomic base claim and rollback snapshot. '''
    agent_action = 'rsform.publish'
    agent_heavy = True

    @extend_schema(tags=['Agents'], request=PublicationSerializer, responses={200: dict, 409: dict},
                   parameters=[IDEMPOTENCY_PARAMETER])
    def post(self, request, pk: int):
        serializer = PublicationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        item = self._get_item(pk, LibraryItemType.RSFORM)
        self._require_edit(item)
        if item.owner_id != request.user.pk and not request.user.is_staff:
            raise PermissionDenied('Publication requires owner access to preserve a version.')
        with mutation_receipt(request, 'rsform.publish', target_id=pk) as receipt:
            if receipt is not None and receipt.target_id is not None:
                item.refresh_from_db()
                self._require_read(item)
                return self._publication_response(item, receipt.version_id, receipt.revision)
            # Claim the approved base revision before reading or changing schema contents.
            claimed_time = max(
                timezone.now(), serializer.validated_data['expected_time_update'] + timedelta(microseconds=1),
            )
            target = LibraryItem.objects.filter(
                pk=item.pk, time_update=serializer.validated_data['expected_time_update'],
            )
            metadata = serializer.validated_data.get('expected_target')
            if metadata is not None:
                target = target.filter(owner_id=metadata['owner'], location=metadata['location'],
                                       access_policy=metadata['access_policy'])
            claimed = target.update(time_update=claimed_time)
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
                version=f'mcp-{uuid4().hex[:16]}', description='Before approved MCP publication',
                data=RSFormSerializer(item).to_versioned_data(),
            )
            replace_schema_content(item, serializer.validated_data['schema'])
            # Keep the revision claim monotonic even when the wall clock stalls or moves back.
            LibraryItem.objects.filter(pk=item.pk).update(time_update=claimed_time)
            item.refresh_from_db()
            self._log('rsform.publish', status.HTTP_200_OK, summary='Approved MCP publication', item=item)
            complete_receipt(receipt, item, version_id=snapshot.pk)
            return self._publication_response(item, snapshot.pk, claimed_time)

    def _publication_response(self, item, version_id, revision):
        schema = RSFormParseSerializer(item, context={'request': self.request}).data
        return Response({'version': version_id, 'schema': schema,
                         'committed_time_update': serializers.DateTimeField().to_representation(revision)})
