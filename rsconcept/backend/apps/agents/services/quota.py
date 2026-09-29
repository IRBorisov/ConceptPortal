''' Shared quotas for /api/agents.

Counters live in the database so every gunicorn worker sees the same budget.
A short cache entry only remembers a recent refusal, so a flood of 429s does not
keep locking the counter row.
'''
from __future__ import annotations

import time
from datetime import datetime

from django.core.cache import cache
from django.db import IntegrityError, transaction
from django.utils import timezone

from apps.users.models import User

from ..models import AgentRateState

READ_PER_MINUTE = 120
WRITE_PER_MINUTE = 30
WRITE_PER_HOUR = 300
HEAVY_PER_HOUR = 15
MAX_ACTIVE_KEYS = 5

_MINUTE = 60
_HOUR = 3600
_CACHE_PREFIX = 'agent-quota-block'


def too_many_active_keys() -> str:
    ''' Error text when the user already has the maximum number of live keys. '''
    return f'Можно иметь не больше {MAX_ACTIVE_KEYS} активных API-ключей.'


def blocked_for(user_id: int, kinds: tuple[str, ...]) -> int | None:
    ''' Seconds until the cached refusal expires, if this worker already refused the user. '''
    now_ts = time.time()
    remaining: int | None = None
    for kind in kinds:
        deadline = cache.get(f'{_CACHE_PREFIX}:{user_id}:{kind}')
        if isinstance(deadline, (int, float)) and deadline > now_ts:
            wait = max(1, int(deadline - now_ts))
            remaining = wait if remaining is None else max(remaining, wait)
    return remaining


def remember_block(user_id: int, kind: str, retry_after: int) -> None:
    ''' Remember a refusal on this worker until the quota window moves on. '''
    retry_after = max(1, int(retry_after))
    cache.set(
        f'{_CACHE_PREFIX}:{user_id}:{kind}',
        time.time() + retry_after,
        timeout=retry_after
    )


def consume(user: User, *, kind: str, heavy: bool = False) -> tuple[bool, int | None, str | None]:
    ''' Reserve one read or write. Returns (allowed, retry_after, block_kind). '''
    for _attempt in range(5):
        state = _get_or_create_state(user)
        if state is None:
            continue
        now = timezone.now()
        decision = _decide(state, now, kind=kind, heavy=heavy)
        if not decision['allowed']:
            return False, decision['retry'], decision['reason']
        match = {field: getattr(state, field) for field in decision['updates']}
        rows = AgentRateState.objects.filter(pk=state.pk, **match).update(**decision['updates'])
        if rows == 1:
            return True, None, None
    return False, 1, kind


def _get_or_create_state(user: User) -> AgentRateState | None:
    try:
        return AgentRateState.objects.get(user=user)
    except AgentRateState.DoesNotExist:
        pass
    try:
        with transaction.atomic():
            return AgentRateState.objects.create(user=user)
    except IntegrityError:
        return None


def _decide(state: AgentRateState, now: datetime, *, kind: str, heavy: bool) -> dict:
    if kind == 'read':
        started, count, allowed, retry = _roll(
            state.read_window_started_at, state.read_count, now, _MINUTE, READ_PER_MINUTE
        )
        if not allowed:
            return {'allowed': False, 'retry': retry, 'reason': 'read', 'updates': {}}
        return {
            'allowed': True,
            'retry': None,
            'reason': None,
            'updates': {
                'read_window_started_at': started,
                'read_count': count,
            },
        }

    minute_started, minute_count, minute_ok, minute_retry = _roll(
        state.write_window_started_at, state.write_count, now, _MINUTE, WRITE_PER_MINUTE
    )
    if not minute_ok:
        return {'allowed': False, 'retry': minute_retry, 'reason': 'write', 'updates': {}}
    hour_started, hour_count, hour_ok, hour_retry = _roll(
        state.write_hour_started_at, state.write_hour_count, now, _HOUR, WRITE_PER_HOUR
    )
    if not hour_ok:
        return {'allowed': False, 'retry': hour_retry, 'reason': 'write', 'updates': {}}

    updates = {
        'write_window_started_at': minute_started,
        'write_count': minute_count,
        'write_hour_started_at': hour_started,
        'write_hour_count': hour_count,
    }
    if heavy:
        heavy_started, heavy_count, heavy_ok, heavy_retry = _roll(
            state.heavy_hour_started_at, state.heavy_hour_count, now, _HOUR, HEAVY_PER_HOUR
        )
        if not heavy_ok:
            return {'allowed': False, 'retry': heavy_retry, 'reason': 'heavy', 'updates': {}}
        updates['heavy_hour_started_at'] = heavy_started
        updates['heavy_hour_count'] = heavy_count
    return {'allowed': True, 'retry': None, 'reason': None, 'updates': updates}


def _roll(
    started: datetime | None,
    count: int,
    now: datetime,
    window: int,
    limit: int
) -> tuple[datetime, int, bool, int | None]:
    ''' Return (window start, next count, allowed, retry seconds). '''
    if started is None or (now - started).total_seconds() >= window:
        return now, 1, True, None
    if count >= limit:
        elapsed = (now - started).total_seconds()
        return started, count, False, max(1, int(window - elapsed))
    return started, count + 1, True, None
