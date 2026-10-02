''' Quotas for /api/agents. The budget is per user and stored in the database. '''
from __future__ import annotations

from typing import cast

from rest_framework.request import Request
from rest_framework.throttling import BaseThrottle, SimpleRateThrottle
from rest_framework.views import APIView

from apps.users.models import User

from .models import ApiKey
from .services.quota import blocked_for, consume, remember_block


class ApiKeyAuthFailureThrottle(SimpleRateThrottle):
    ''' Cap failed Bearer API-key attempts (invalid/malformed tokens).

    Agent read/write quotas only run after a key is accepted, so invalid-token
    floods would otherwise be unlimited. Applied inside ``ApiKeyAuthentication``.
    Only failures are counted — successful authentications do not consume budget.
    '''
    scope = 'agent_api_key_auth'

    def get_cache_key(self, request, view):
        return self.cache_format % {
            'scope': self.scope,
            'ident': self.get_ident(request),
        }

    def is_limited(self, request: Request) -> bool:
        ''' True when the client already exhausted the failure budget. '''
        self.key = self.get_cache_key(request, None)
        if self.key is None:
            return False
        self.history = self.cache.get(self.key, [])
        self.now = self.timer()
        duration = cast(float, getattr(self, 'duration'))
        while self.history and self.history[-1] <= self.now - duration:
            self.history.pop()
        num_requests = cast(int, getattr(self, 'num_requests'))
        return num_requests <= len(self.history)

    def record_failure(self, request: Request) -> bool:
        ''' Record one failure. Returns False when the client is now limited. '''
        return bool(self.allow_request(request, cast(APIView, None)))


class _AgentQuotaThrottle(BaseThrottle):
    ''' Shared refusal bookkeeping for read and write quotas. '''
    kind = 'read'

    def __init__(self):
        self.retry_after: int | None = None

    def wait(self):
        return self.retry_after

    def allow_request(self, request: Request, view: APIView) -> bool:
        api_key = getattr(request, 'auth', None)
        user = getattr(request, 'user', None)
        if not isinstance(api_key, ApiKey) or not isinstance(user, User):
            return True

        heavy = self.kind == 'write' and bool(getattr(view, 'agent_heavy', False))
        block_kinds = ('write', 'heavy') if heavy else (self.kind,)
        blocked = blocked_for(user.pk, block_kinds)
        if blocked is not None:
            self.retry_after = blocked
            return False

        allowed, retry, reason = consume(user, kind=self.kind, heavy=heavy)
        if not allowed:
            self.retry_after = retry or 1
            remember_block(user.pk, reason or self.kind, self.retry_after)
            return False

        api_key.touch_last_used()
        return True


class AgentReadThrottle(_AgentQuotaThrottle):
    ''' Cap agent reads. Every key of the user draws from the same counter. '''
    kind = 'read'


class AgentWriteThrottle(_AgentQuotaThrottle):
    ''' Cap agent mutations. Full schema rewrites also hit the heavy hourly cap. '''
    kind = 'write'
