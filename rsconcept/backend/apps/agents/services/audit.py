''' Write AgentActionLog entries. '''
from __future__ import annotations

from typing import Any

from apps.library.models import LibraryItem

from ..models import AgentActionLog, ApiKey


def log_agent_action(
    *,
    user,
    api_key: ApiKey | None,
    action: str,
    status_code: int,
    summary: str = '',
    item: LibraryItem | None = None,
    item_id: int | None = None,
    item_alias: str = '',
    item_title: str = '',
) -> AgentActionLog:
    ''' Persist a short audit record for an agent API call. '''
    resolved_id = item_id
    resolved_alias = item_alias
    resolved_title = item_title
    if item is not None:
        resolved_id = item.pk
        resolved_alias = item.alias or ''
        resolved_title = item.title or ''

    return AgentActionLog.objects.create(
        user=user,
        api_key=api_key,
        key_label=api_key.label if api_key else '',
        key_prefix=api_key.prefix if api_key else '',
        action=action,
        item_id=resolved_id,
        item_alias=resolved_alias,
        item_title=resolved_title,
        status_code=status_code,
        summary=summary[:500],
    )


def api_key_from_request(request) -> ApiKey | None:
    auth: Any = getattr(request, 'auth', None)
    return auth if isinstance(auth, ApiKey) else None
