''' Permissions for agent routes. '''
from rest_framework.permissions import BasePermission
from rest_framework.request import Request
from rest_framework.views import APIView

from .models import ApiKey


class IsApiKeyAuthenticated(BasePermission):
    ''' Require successful ApiKeyAuthentication (request.auth is ApiKey). '''

    def has_permission(self, request: Request, view: APIView) -> bool:
        return isinstance(request.auth, ApiKey) and request.user and request.user.is_authenticated


class IsSessionUser(BasePermission):
    ''' Require session-authenticated user (not API key) for key/log management. '''

    def has_permission(self, request: Request, view: APIView) -> bool:
        if not request.user or not request.user.is_authenticated:
            return False
        # Allow session (auth is None or not ApiKey). Block managing keys via API key.
        return not isinstance(request.auth, ApiKey)
