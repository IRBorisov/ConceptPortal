''' Non-mutating preflight and account-bound mutation receipt reads. '''
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import serializers
from rest_framework.exceptions import NotFound
from rest_framework.response import Response

from apps.library.models import LibraryItem, LibraryItemType
from apps.oss.models import Inheritance, Relativization
from shared import permissions

from ..models import AGENT_CREDENTIAL_TYPES
from ..services.mutation_receipts import lookup_receipt
from .base import AgentItemView


class ItemAccessSerializer(serializers.Serializer):
    ''' Revision and capabilities of an item already readable by the caller. '''
    id = serializers.IntegerField()
    item_type = serializers.ChoiceField(choices=LibraryItemType.choices)
    title = serializers.CharField()
    alias = serializers.CharField()
    location = serializers.CharField()
    access_policy = serializers.CharField()
    owner = serializers.IntegerField(allow_null=True)
    time_update = serializers.DateTimeField()
    can_write = serializers.BooleanField()
    can_publish_schema = serializers.BooleanField()


class AgentItemAccessView(AgentItemView):
    ''' Check edit and publication capability without reading or writing contents. '''

    @extend_schema(tags=['Agents'], responses={200: ItemAccessSerializer, 404: dict})
    def get(self, request, pk):
        item = LibraryItem.objects.filter(pk=pk).first()
        if item is None or not permissions.can_read_library_item(request.user, item):
            raise NotFound()
        can_write = (isinstance(request.auth, AGENT_CREDENTIAL_TYPES) and request.auth.allows_scope('write')
                     and permissions.can_edit_item(request.user, item))
        can_publish = (can_write and item.item_type == LibraryItemType.RSFORM
                       and (request.user.pk == item.owner_id or request.user.is_staff)
                       and not Inheritance.objects.filter(child__schema_id=pk).exists()
                       and not Relativization.objects.filter(operation__result_id=pk).exclude(parameters={}).exists())
        return Response(ItemAccessSerializer({
            'id': item.pk, 'item_type': item.item_type, 'time_update': item.time_update,
            'title': item.title, 'alias': item.alias, 'location': item.location,
            'access_policy': item.access_policy, 'owner': item.owner_id,
            'can_write': can_write, 'can_publish_schema': can_publish,
        }).data)


RECEIPT_OPERATIONS = {
    'rsform.create': LibraryItemType.RSFORM,
    'model.create': LibraryItemType.RSMODEL,
    'oss.create': LibraryItemType.OPERATION_SCHEMA,
    'rsform.publish': LibraryItemType.RSFORM,
}


class MutationReceiptSerializer(serializers.Serializer):
    ''' A committed write, with the exact stored revision. '''
    target_id = serializers.IntegerField()
    version_id = serializers.IntegerField(allow_null=True)
    revision = serializers.DateTimeField()
    target_metadata = serializers.DictField()


class AgentMutationReceiptView(AgentItemView):
    ''' Recover a committed write independently of the original HTTP response. '''
    agent_require_key = True

    @extend_schema(tags=['Agents'], responses={200: MutationReceiptSerializer, 404: dict}, parameters=[
        OpenApiParameter('Idempotency-Key', str, OpenApiParameter.HEADER, required=True),
    ])
    def get(self, request, operation):
        item_type = RECEIPT_OPERATIONS.get(operation)
        if item_type is None:
            raise NotFound()
        receipt = lookup_receipt(request, operation)
        item = self._get_item(receipt.target_id, item_type)
        if not permissions.can_read_library_item(request.user, item):
            raise NotFound()
        return Response(MutationReceiptSerializer(receipt).data)


class AgentCapabilitiesView(AgentItemView):
    ''' Advertise additive Agents API capabilities to clients during rollout. '''
    agent_scope = None

    @extend_schema(tags=['Agents'], responses={200: dict})
    def get(self, _request):
        return Response({'mutation_receipts': 1})
