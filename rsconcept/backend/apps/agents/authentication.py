''' Authentication: Bearer API keys for /api/agents data routes. '''
from __future__ import annotations

from rest_framework import authentication, exceptions
from rest_framework.request import Request

from .models import ApiKey


class ApiKeyAuthentication(authentication.BaseAuthentication):
    ''' Authenticate via ``Authorization: Bearer rcp_…``. '''
    keyword = 'Bearer'

    def authenticate(self, request: Request):
        auth_header = authentication.get_authorization_header(request).decode('utf-8')
        if not auth_header:
            return None

        parts = auth_header.split()
        if not parts or parts[0] != self.keyword:
            return None
        if len(parts) != 2:
            raise exceptions.AuthenticationFailed('Invalid Authorization header for API key.')

        key = ApiKey.authenticate_token(parts[1])
        if key is None:
            raise exceptions.AuthenticationFailed('Invalid or revoked API key.')

        key.touch_last_used()
        return (key.owner, key)
