''' Scoped throttles for public authentication flows. '''

from rest_framework.throttling import SimpleRateThrottle

from apps.library.models import LibraryItemType


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


class OssCloneRateThrottle(EndpointRateThrottle):
    ''' Throttle expensive OSS clone requests (library or OSS clone routes). '''
    scope = 'oss_clone'

    def allow_request(self, request, view):
        if getattr(view, 'action', None) != 'clone':
            return True
        try:
            item = view.get_object()
        except Exception:  # pylint: disable=broad-exception-caught
            return True
        if item.item_type != LibraryItemType.OPERATION_SCHEMA:
            return True
        return super().allow_request(request, view)
