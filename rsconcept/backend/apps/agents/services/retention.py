''' Drop agent action logs that are older than the configured retention. '''
from __future__ import annotations

import logging
from datetime import timedelta

from django.conf import settings
from django.db import IntegrityError, transaction
from django.utils import timezone

from ..models import AgentActionLog, AgentLogCleanup

logger = logging.getLogger(__name__)

_SINGLETON_PK = 1


def prune_agent_logs(*, force: bool = False) -> int:
    ''' Delete expired rows. Without force, skip the delete until the cleanup interval has passed. '''
    now = timezone.now()
    if not force and not _claim_cleanup(now):
        return 0
    if force:
        AgentLogCleanup.objects.update_or_create(
            pk=_SINGLETON_PK,
            defaults={'last_run_at': now}
        )
    cutoff = now - timedelta(days=settings.AGENT_LOG_RETENTION_DAYS)
    deleted, _per_model = AgentActionLog.objects.filter(created_at__lt=cutoff).delete()
    return deleted


def maybe_prune_agent_logs() -> int:
    ''' Best-effort cleanup. A database error must not fail the agent call that triggered it. '''
    try:
        return prune_agent_logs()
    except Exception:  # pylint: disable=broad-exception-caught
        logger.exception('Agent log cleanup failed')
        return 0


def _claim_cleanup(now) -> bool:
    interval = timedelta(days=settings.AGENT_LOG_CLEANUP_INTERVAL_DAYS)
    try:
        with transaction.atomic():
            state, _created = AgentLogCleanup.objects.get_or_create(pk=_SINGLETON_PK)
    except IntegrityError:
        return False
    if state.last_run_at is not None and now - state.last_run_at < interval:
        return False
    updated = AgentLogCleanup.objects.filter(
        pk=_SINGLETON_PK,
        last_run_at=state.last_run_at
    ).update(last_run_at=now)
    return updated == 1
