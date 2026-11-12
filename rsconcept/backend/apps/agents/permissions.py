''' Permissions for agent routes. '''
from rest_framework.permissions import BasePermission, SAFE_METHODS
from rest_framework.request import Request
from rest_framework.views import APIView

from .models import ApiKey


class AgentDataAccess(BasePermission):
    ''' Allow public reads; require a scoped key for writes and identity. '''

    def has_permission(self, request: Request, view: APIView) -> bool:
        user = request.user
        key = request.auth
        if not isinstance(key, ApiKey):
            return request.method in SAFE_METHODS and not getattr(view, 'agent_require_key', False)
        if not bool(user and user.is_authenticated) or not key.is_active:
            return False
        required = getattr(view, 'agent_scope', 'read' if request.method in SAFE_METHODS else 'write')
        return required is None or key.allows_scope(required)


class IsSessionUser(BasePermission):
    ''' Require session-authenticated user (not API key) for key/log management. '''

    def has_permission(self, request: Request, view: APIView) -> bool:
        if not request.user or not request.user.is_authenticated:
            return False
        # Allow session (auth is None or not ApiKey). Block managing keys via API key.
        return not isinstance(request.auth, ApiKey)
