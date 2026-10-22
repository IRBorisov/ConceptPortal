''' Shared auth, quota and audit for agent library routes. '''
from __future__ import annotations

from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.views import APIView

from apps.library.models import LibraryItem
from shared import permissions as shared_permissions

from ..authentication import ApiKeyAuthentication
from ..permissions import IsApiKeyAuthenticated
from ..services.audit import api_key_from_request, log_agent_action
from ..throttling import AgentReadThrottle, AgentWriteThrottle


def exception_summary(exc: BaseException) -> str:
    ''' Short text for the action log. No request body. '''
    detail = getattr(exc, 'detail', None)
    text = str(detail if detail is not None else exc)
    return ' '.join(text.split())[:200]


class AgentItemView(APIView):
    ''' API-key auth for one library item type. '''
    authentication_classes = [ApiKeyAuthentication]
    permission_classes = [IsApiKeyAuthenticated]
    agent_action: str | None = None
    agent_heavy = False

    def get_throttles(self):
        if self.request.method in ('GET', 'HEAD', 'OPTIONS'):
            return [AgentReadThrottle()]
        return [AgentWriteThrottle()]

    def initial(self, request, *args, **kwargs):
        super().initial(request, *args, **kwargs)
        if self.agent_action:
            self._quota_passed = True

    def handle_exception(self, exc):
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
        try:
            return LibraryItem.objects.get(pk=pk, item_type=item_type)
        except LibraryItem.DoesNotExist as exc:
            raise NotFound() from exc

    def _require_read(self, item: LibraryItem) -> None:
        if not shared_permissions.can_read_library_item(self.request.user, item):
            raise PermissionDenied()

    def _require_edit(self, item: LibraryItem) -> None:
        if not shared_permissions.can_edit_item(self.request.user, item):
            raise PermissionDenied()

    def _log(
        self,
        action: str,
        status_code: int,
        summary: str = '',
        item: LibraryItem | None = None,
    ) -> None:
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
