''' Shared auth, quota and audit for agent library routes. '''
from __future__ import annotations

from collections.abc import Callable

from drf_spectacular.utils import OpenApiParameter
from rest_framework import serializers, status
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.library.models import LibraryItem
from shared import permissions as shared_permissions

from ..authentication import ApiKeyAuthentication
from ..permissions import AgentDataAccess
from ..services.audit import api_key_from_request, log_agent_action
from ..services.mutation_receipts import complete_receipt, mutation_receipt
from ..throttling import AgentReadThrottle, AgentWriteThrottle

IDEMPOTENCY_PARAMETER = OpenApiParameter(
    'Idempotency-Key', str, OpenApiParameter.HEADER,
    description='Stable ASCII request key scoped to the account and operation.',
)


def exception_summary(exc: BaseException) -> str:
    ''' Short text for the action log. No request body. '''
    detail = getattr(exc, 'detail', None)
    text = str(detail if detail is not None else exc)
    return ' '.join(text.split())[:200]


class AgentItemView(APIView):
    ''' API-key auth for one library item type. '''
    authentication_classes = [ApiKeyAuthentication]
    permission_classes = [AgentDataAccess]
    agent_action: str | None = None
    agent_heavy = False

    def get_throttles(self):
        ''' Use the read quota for safe methods and the write quota otherwise. '''
        if self.request.method in ('GET', 'HEAD', 'OPTIONS'):
            return [AgentReadThrottle()]
        return [AgentWriteThrottle()]

    def initial(self, request, *args, **kwargs):
        ''' Mark the request so a later error is still written to the action log. '''
        super().initial(request, *args, **kwargs)
        if self.agent_action:
            self._quota_passed = True

    def handle_exception(self, exc):
        ''' Log a failed mutation once, after the quota check has passed. '''
        response = super().handle_exception(exc)
        action = self.agent_action
        should_log = (
            action
            and getattr(self, '_quota_passed', False)
            and not getattr(self, '_audited', False)
        )
        if should_log and action:
            self._log(action, response.status_code, summary=exception_summary(exc))
        return response

    def _get_item(self, pk: int, item_type: str) -> LibraryItem:
        ''' Load one library item of the given type, or answer 404. '''
        try:
            return LibraryItem.objects.get(pk=pk, item_type=item_type)
        except LibraryItem.DoesNotExist as exc:
            raise NotFound() from exc

    def _require_read(self, item: LibraryItem) -> None:
        ''' Refuse the call when the key user cannot read the item. '''
        if not shared_permissions.can_read_library_item(self.request.user, item):
            raise PermissionDenied()

    def _require_edit(self, item: LibraryItem) -> None:
        ''' Refuse the call when the key user cannot edit the item. '''
        if not shared_permissions.can_edit_item(self.request.user, item):
            raise PermissionDenied()

    def _create_with_receipt(
        self,
        operation: str,
        item_type: str,
        create: Callable[[], LibraryItem],
        serialize: Callable[[LibraryItem], dict],
    ) -> Response:
        ''' Create once, then enforce the current read ACL on any replay. '''
        with mutation_receipt(self.request, operation) as receipt:
            if receipt is not None and receipt.target_id is not None:
                item = self._get_item(receipt.target_id, item_type)
                self._require_read(item)
            else:
                item = create()
                complete_receipt(receipt, item)
                self._log(operation, status.HTTP_201_CREATED, summary=f'Created {item.alias}', item=item)
            data = serialize(item)
            if receipt is not None:
                data['committed_time_update'] = serializers.DateTimeField().to_representation(receipt.revision)
            return Response(data, status=status.HTTP_201_CREATED)

    def _log(
        self,
        action: str,
        status_code: int,
        summary: str = '',
        item: LibraryItem | None = None,
    ) -> None:
        ''' Store one action-log row and skip a second log for the same request. '''
        self._audited = True
        log_agent_action(
            user=self.request.user,
            api_key=api_key_from_request(self.request),
            action=action,
            status_code=status_code,
            summary=summary,
            item=item,
            request=self.request,
        )
