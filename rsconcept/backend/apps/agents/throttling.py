''' Throttle agent API writes. '''
from rest_framework.throttling import SimpleRateThrottle


class AgentsRateThrottle(SimpleRateThrottle):
    ''' Throttle authenticated agent API requests by user id. '''
    scope = 'agents'

    def get_cache_key(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return None
        return self.cache_format % {
            'scope': self.scope,
            'ident': request.user.pk,
        }
