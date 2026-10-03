''' Quotas for /api/agents. The budget is per user and stored in the database. '''
from rest_framework.request import Request
from rest_framework.throttling import BaseThrottle
from rest_framework.views import APIView

from apps.users.models import User

from .models import ApiKey
from .services.quota import blocked_for, consume, remember_block


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
