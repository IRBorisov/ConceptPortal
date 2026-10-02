''' Authentication: Bearer API keys for /api/agents data routes. '''
from __future__ import annotations

from typing import NoReturn

from rest_framework import authentication, exceptions
from rest_framework.request import Request

from .models import ApiKey
from .throttling import ApiKeyAuthFailureThrottle


class ApiKeyAuthentication(authentication.BaseAuthentication):
    ''' Authenticate via ``Authorization: Bearer rcp_…``. '''
    keyword = 'Bearer'

    def authenticate(self, request: Request):
        try:
            auth_header = authentication.get_authorization_header(request).decode('utf-8')
        except UnicodeError as error:
            raise exceptions.AuthenticationFailed('Invalid Authorization header.') from error
        if not auth_header:
            return None

        parts = auth_header.split()
        if not parts or parts[0] != self.keyword:
            return None

        throttle = ApiKeyAuthFailureThrottle()
        if throttle.is_limited(request):
            raise exceptions.Throttled(wait=throttle.wait())

        if len(parts) != 2:
            self._reject(request, throttle, 'Invalid Authorization header for API key.')

        key = ApiKey.authenticate_token(parts[1])
        if key is None:
            self._reject(request, throttle, 'Invalid or revoked API key.')

        return (key.owner, key)

    def _reject(
        self,
        request: Request,
        throttle: ApiKeyAuthFailureThrottle,
        message: str,
    ) -> NoReturn:
        if not throttle.record_failure(request):
            raise exceptions.Throttled(wait=throttle.wait())
        raise exceptions.AuthenticationFailed(message)
