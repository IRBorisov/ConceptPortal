''' Trusted deployment configuration and audience-bound Portal credentials. '''
import hashlib
import hmac
import re
from urllib.parse import urlsplit

from django.conf import settings
from django.utils import timezone

from ..models import AgentMcpGrant

PROJECT_PATTERN = r'[A-Za-z0-9][A-Za-z0-9._-]{0,63}'


def safe_url(value):
    ''' Permit TLS endpoints and explicit loopback URLs for local clients. '''
    if not isinstance(value, str) or re.search(r'[\s\\]', value):
        return False
    try:
        url = urlsplit(value)
        if url.port is not None and url.port == 0:
            return False
    except ValueError:
        return False
    return bool(url.hostname and not (url.username or url.password or url.fragment) and (
        url.scheme == 'https' or (url.scheme == 'http' and url.hostname in ('127.0.0.1', 'localhost', '::1'))
    ))


def configuration():
    ''' OAuth routes exist only when the trusted issuer and its service secret are configured. '''
    config = settings.AGENT_MCP_OAUTH
    if not isinstance(config, dict):
        return None
    origin = config.get('mcp_origin')
    issuer = config.get('issuer')
    secret = settings.AGENT_MCP_OAUTH_SERVICE_SECRET
    if (not safe_url(issuer) or not safe_url(origin) or issuer.endswith('/')
            or urlsplit(issuer).path or urlsplit(issuer).query or urlsplit(origin).path or urlsplit(origin).query
            or not isinstance(config.get('clients'), dict) or len(secret) < 32):
        return None
    return config


def project_scopes(config, client_id, project_id, owner_id):
    ''' Resolve membership and maximum scopes from server-side registration. '''
    if not re.fullmatch(PROJECT_PATTERN, project_id):
        return set()
    client = config['clients'].get(client_id, {})
    project = client.get('projects', {}).get(project_id, {})
    if owner_id not in project.get('users', []):
        return set()
    return {'read', 'write'}.intersection(project.get('scopes', ['read']))


def grant_is_allowed(config, grant):
    ''' Revalidate current registration on both MCP and Portal requests. '''
    allowed = project_scopes(config, grant.client_id, grant.project_id, grant.owner_id)
    return grant.owner.is_active and bool(allowed) and set(grant.scopes).issubset(allowed)


def portal_token(grant):
    ''' Mint a distinct deterministic bearer restricted to this Portal deployment. '''
    data = f'portal-agent-delegation-v1:{grant.pk.hex}'.encode()
    signature = hmac.new(settings.SECRET_KEY.encode(), data, hashlib.sha256).hexdigest()
    return f'rcd_{grant.pk.hex}_{signature}'


def authenticate_delegation(token):
    ''' Validate a short-lived Portal-only credential and its live authorization. '''
    match = re.fullmatch(r'rcd_([a-f0-9]{32})_[a-f0-9]{64}', token)
    config = configuration()
    if match is None or config is None:
        return None
    grant = AgentMcpGrant.objects.select_related('owner').filter(
        pk=match[1], portal_revoked_at__isnull=True, expires_at__gt=timezone.now(),
    ).first()
    if grant is None or not hmac.compare_digest(portal_token(grant), token) or not grant_is_allowed(config, grant):
        return None
    return grant
