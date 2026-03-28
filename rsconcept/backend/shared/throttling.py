''' Scoped throttles for public authentication flows. '''

from rest_framework.throttling import SimpleRateThrottle


class EndpointRateThrottle(SimpleRateThrottle):
    ''' Throttle requests by client identity regardless of auth state. '''

    def get_cache_key(self, request, view):
        return self.cache_format % {
            'scope': self.scope,
            'ident': self.get_ident(request),
        }


class LoginRateThrottle(EndpointRateThrottle):
    ''' Throttle repeated login attempts. '''
    scope = 'login'


class SignupRateThrottle(EndpointRateThrottle):
    ''' Throttle public account creation attempts. '''
    scope = 'signup'


class PasswordResetRateThrottle(EndpointRateThrottle):
    ''' Throttle password reset flows. '''
    scope = 'password_reset'
