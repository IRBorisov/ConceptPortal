''' OAuth authorization and Portal delegation for a registered MCP client. '''
from uuid import uuid4

from django.conf import settings
from django.db import models


class AgentMcpGrant(models.Model):
    ''' Store authorization codes and MCP bearer tokens as SHA-256 digests. '''

    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    client_id = models.CharField(max_length=2048)
    client_metadata_digest = models.CharField(max_length=64, blank=True, default='', db_default='')
    project_id = models.CharField(max_length=64)
    resource = models.URLField(max_length=256)
    redirect_uri = models.CharField(max_length=2048)
    code_hash = models.CharField(max_length=64, unique=True)
    challenge = models.CharField(max_length=43)
    code_expires_at = models.DateTimeField()
    token_hash = models.CharField(max_length=64, null=True, unique=True)
    expires_at = models.DateTimeField(null=True)
    scopes = models.JSONField(default=list)
    portal_revoked_at = models.DateTimeField(null=True)

    @property
    def is_active(self):
        ''' Authenticated instances were checked for expiry and revocation. '''
        return self.portal_revoked_at is None

    def allows_scope(self, scope):
        ''' Delegation narrows the current Portal user's object rights. '''
        scopes = self.scopes
        # Django resolves the JSON field to a list on model instances.
        return isinstance(scopes, list) and scope in scopes  # pylint: disable=unsupported-membership-test
