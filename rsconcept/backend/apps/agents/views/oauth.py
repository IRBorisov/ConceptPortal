''' Portal-hosted OAuth authorization code flow for MCP clients. '''
import base64
import hashlib
import hmac
import re
import secrets
from datetime import timedelta
from urllib.parse import urlencode, urlsplit, urlunsplit

from django.conf import settings
from django.contrib.auth import login
from django.contrib.auth.forms import AuthenticationForm
from django.db import transaction
from django.db.models import F
from django.http import Http404, HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.utils import timezone
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from django.views.decorators.http import require_GET, require_http_methods, require_POST
from rest_framework.request import Request

from apps.users.models import User
from shared.throttling import LoginRateThrottle, OAuthClientMetadataRateThrottle

from ..models import AgentMcpGrant, hash_api_key
from ..services import cimd
from ..services.mcp_oauth import (
    PROJECT_PATTERN, cimd_policy, configuration, grant_is_allowed, portal_token, project_scopes, safe_url,
)

SCOPE_MAP = {'portal.read': 'read', 'portal.write': 'write'}
TOKEN_LIFETIME = 1800


def _config():
    config = configuration()
    if config is None:
        raise Http404()
    return config


def _redirect(uri, **fields):
    parsed = urlsplit(uri)
    query = '&'.join(filter(None, [parsed.query, urlencode({k: v for k, v in fields.items() if v})]))
    return HttpResponseRedirect(urlunsplit(parsed._replace(query=query)))


def _error(code, status=400):
    return JsonResponse({'error': code}, status=status)


def _issue_code(user, project, authorization, response_params):
    code = secrets.token_urlsafe(32)
    AgentMcpGrant.objects.create(owner=user, project_id=project, code_hash=hash_api_key(code),
                                 code_expires_at=timezone.now() + timedelta(minutes=5), **authorization)
    return _redirect(authorization['redirect_uri'], code=code, **response_params)


def _lock_consent_owner(user):
    # Write first to serialize consent reuse with project revocation on SQLite as well.
    User.objects.filter(pk=user.pk).update(last_login=F('last_login'))


def _login(request):
    form = AuthenticationForm(request, data=request.POST if request.method == 'POST' else None)
    if request.method == 'POST':
        if not LoginRateThrottle().allow_request(Request(request), None):
            return _error('temporarily_unavailable', 429)
        if form.is_valid():
            login(request, form.get_user())
            return HttpResponseRedirect(reverse('agents-oauth-authorize', query=request.GET))
    return render(request, 'agents/mcp_oauth.html', {'login_form': form})


def _reuse_consent(user, project, authorization, response_params):
    with transaction.atomic():
        _lock_consent_owner(user)
        previous = AgentMcpGrant.objects.filter(owner=user, client_id=authorization['client_id'], project_id=project,
                                                client_metadata_digest=authorization['client_metadata_digest'],
                                                expires_at__gt=timezone.now(), portal_revoked_at__isnull=True)
        scopes = set(authorization['scopes'])
        if any(scopes.issubset(granted) for granted in previous.values_list('scopes', flat=True).distinct()):
            return _issue_code(user, project, authorization, response_params)
    return None


def _authorization_parameters(config, query):
    resource = query.get('resource', '')
    challenge = query.get('code_challenge', '')
    base = config['mcp_origin'] + '/mcp'
    if (len(resource) > 256
            or not (resource == base or re.fullmatch(re.escape(base) + '/' + PROJECT_PATTERN, resource))):
        return 'invalid_target'
    if query.get('response_type') != 'code':
        return 'unsupported_response_type'
    if query.get('code_challenge_method') != 'S256' or not re.fullmatch(r'[A-Za-z0-9_-]{43}', challenge):
        return 'invalid_request'
    requested = set(query.get('scope', 'portal.read').split())
    if 'portal.read' not in requested or requested - SCOPE_MAP.keys():
        return 'invalid_scope'
    return {'resource': resource, 'scopes': sorted(SCOPE_MAP[scope] for scope in requested), 'challenge': challenge}


def _discover_client(request, client_id, redirect_uri):
    if not OAuthClientMetadataRateThrottle().allow_request(Request(request), None):
        return _error('temporarily_unavailable', 429)
    try:
        metadata = cimd.discover(client_id)
    except cimd.InvalidMetadata:
        return _error('invalid_client')
    except cimd.MetadataUnavailable:
        return _error('temporarily_unavailable', 503)
    if not metadata.accepts_redirect(redirect_uri):
        return _error('invalid_request')
    return metadata


def _consent(request, client, authorization, response_params, client_name):
    redirect_uri = authorization['redirect_uri']
    metadata_digest = authorization['client_metadata_digest']
    scopes = set(authorization['scopes'])
    project_hint = request.GET.get('project')
    projects = [project for project in client.get('projects', {})
                if (project_hint is None or project == project_hint)
                and scopes.issubset(project_scopes(client, project, request.user))]
    if (metadata_digest or project_hint is not None) and not projects:
        return _redirect(redirect_uri, error='access_denied', **response_params)
    if request.method == 'POST':
        project = request.POST.get('project', '')
        if request.POST.get('decision') != 'allow' or project not in projects:
            return _redirect(redirect_uri, error='access_denied', **response_params)
        if metadata_digest and request.POST.get('client_metadata_digest') != metadata_digest:
            return _error('invalid_request')
        return _issue_code(request.user, project, authorization, response_params)
    if len(projects) == 1 and request.GET.get('prompt') != 'consent':
        reused = _reuse_consent(request.user, projects[0], authorization, response_params)
        if reused is not None:
            return reused
    return render(request, 'agents/mcp_oauth.html', {
        'client_id': authorization['client_id'], 'client_name': client_name, 'client_metadata_digest': metadata_digest,
        'projects': projects, 'can_write': 'write' in scopes,
    })


@require_GET
def authorization_metadata(_request):
    ''' Advertise CIMD when enabled by the operator. '''
    config = _config()
    issuer = config['issuer']
    metadata = {
        'issuer': issuer,
        'authorization_endpoint': f'{issuer}/api/agents/oauth/authorize',
        'token_endpoint': f'{issuer}/api/agents/oauth/token',
        'grant_types_supported': ['authorization_code'], 'response_types_supported': ['code'],
        'code_challenge_methods_supported': ['S256'], 'token_endpoint_auth_methods_supported': ['none'],
        'scopes_supported': list(SCOPE_MAP), 'authorization_response_iss_parameter_supported': True,
    }
    if cimd_policy(config):
        metadata['client_id_metadata_document_supported'] = True
    return JsonResponse(metadata)


@never_cache
@csrf_protect
@require_http_methods(['GET', 'POST'])
def authorize(request):
    ''' Authenticate a Portal account and ask it to approve the registered project and scope. '''
    config = _config()
    query = request.GET
    if any(len(query.getlist(key)) != 1 for key in query):
        return _error('invalid_request')
    client_id = query.get('client_id', '')
    redirect_uri = query.get('redirect_uri', '')
    state = query.get('state', '')
    if len(state) > 512 or len(redirect_uri) > cimd.MAX_CLIENT_URI or not safe_url(redirect_uri):
        return _error('invalid_request')
    uses_cimd = client_id not in config['clients']
    client = cimd_policy(config) if uses_cimd else config['clients'][client_id]
    if not client:
        return _error('invalid_request')
    if uses_cimd:
        try:
            cimd.client_identifier(client_id)
        except cimd.InvalidMetadata:
            return _error('invalid_client')
        if not cimd.valid_redirect(redirect_uri):
            return _error('invalid_request')
    elif len(client_id) > 128 or len(redirect_uri) > 512 or redirect_uri not in client.get('redirect_uris', []):
        return _error('invalid_request')
    response_params = {'state': state, 'iss': config['issuer']}
    parameters = _authorization_parameters(config, query)
    if isinstance(parameters, str):
        return _error(parameters) if uses_cimd else _redirect(redirect_uri, error=parameters, **response_params)
    if not request.user.is_authenticated:
        return _login(request)

    client_name = metadata_digest = ''
    if uses_cimd:
        metadata = _discover_client(request, client_id, redirect_uri)
        if isinstance(metadata, HttpResponse):
            return metadata
        client_name = metadata.name
        metadata_digest = metadata.consent_digest(redirect_uri)
    authorization = {'client_id': client_id, 'redirect_uri': redirect_uri, 'client_metadata_digest': metadata_digest,
                     **parameters}
    return _consent(request, client, authorization, response_params, client_name)


@never_cache
@csrf_exempt
@require_POST
def token(request):
    ''' Redeem one code from its registered client, redirect URI, resource and PKCE verifier. '''
    config = _config()
    data = request.POST
    if any(len(data.getlist(key)) != 1 for key in data):
        return _error('invalid_request')
    if data.get('grant_type') != 'authorization_code':
        return _error('unsupported_grant_type')
    verifier = data.get('code_verifier', '')
    code = data.get('code', '')
    client_id = data.get('client_id', '')
    redirect_uri = data.get('redirect_uri', '')
    if (not re.fullmatch(r'[A-Za-z0-9._~-]{43,128}', verifier) or not re.fullmatch(r'[A-Za-z0-9_-]{43}', code)
            or not client_id or len(client_id) > cimd.MAX_CLIENT_URI or '\0' in client_id
            or len(redirect_uri) > cimd.MAX_CLIENT_URI or '\0' in redirect_uri or not safe_url(redirect_uri)):
        return _error('invalid_grant')
    challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).rstrip(b'=').decode()
    now = timezone.now()
    grant = AgentMcpGrant.objects.select_related('owner').filter(
        code_hash=hash_api_key(code), code_expires_at__gt=now, token_hash__isnull=True,
        client_id=client_id, redirect_uri=redirect_uri, portal_revoked_at__isnull=True,
    ).first()
    if (grant is None or not hmac.compare_digest(grant.challenge, challenge) or not grant_is_allowed(config, grant)
            or data.get('resource', grant.resource) != grant.resource):
        return _error('invalid_grant')
    access = 'rcm_' + secrets.token_urlsafe(32)
    claimed = AgentMcpGrant.objects.filter(pk=grant.pk, token_hash__isnull=True, portal_revoked_at__isnull=True).update(
        token_hash=hash_api_key(access), expires_at=now + timedelta(seconds=TOKEN_LIFETIME),
    )
    if not claimed:
        return _error('invalid_grant')
    return JsonResponse({'access_token': access, 'token_type': 'Bearer', 'expires_in': TOKEN_LIFETIME,
                         'scope': ' '.join(key for key, scope in SCOPE_MAP.items() if scope in grant.scopes)})


@never_cache
@csrf_exempt
@require_POST
def introspect(request):
    ''' Give the trusted MCP host identity and a separate Portal bearer for an active grant. '''
    config = _config()
    authorization = request.headers.get('Authorization', '')
    expected = f'Bearer {settings.AGENT_MCP_OAUTH_SERVICE_SECRET}'
    if not hmac.compare_digest(authorization.encode(), expected.encode()):
        return _error('invalid_client', 401)
    bearer = request.POST.get('token', '')
    if not re.fullmatch(r'rcm_[A-Za-z0-9_-]{43}', bearer):
        return JsonResponse({'active': False})
    grant = AgentMcpGrant.objects.select_related('owner').filter(
        token_hash=hash_api_key(bearer), expires_at__gt=timezone.now(),
    ).first()
    if grant is None or request.POST.get('resource') != grant.resource or not grant_is_allowed(config, grant):
        return JsonResponse({'active': False})
    return JsonResponse({
        'active': True, 'iss': config['issuer'], 'aud': grant.resource, 'sub': f'portal:{grant.owner_id}',
        'project_id': grant.project_id, 'exp': int(grant.expires_at.timestamp()), 'scopes': grant.scopes,
        'portal_account_id': grant.owner_id, 'portal_username': grant.owner.username, 'grant_id': str(grant.pk),
        'portal_token': portal_token(grant) if grant.portal_revoked_at is None else None,
    })


@never_cache
@csrf_protect
@require_http_methods(['GET', 'POST'])
def manage(request):
    ''' Revoke Portal access while allowing the MCP token to reopen its saved sessions until expiry. '''
    _config()
    if not request.user.is_authenticated:
        return HttpResponse('Sign in to Portal to manage MCP access.', status=403)
    grants = AgentMcpGrant.objects.filter(
        owner=request.user, expires_at__gt=timezone.now(), portal_revoked_at__isnull=True,
    )
    if request.method == 'POST':
        project = request.POST.get('project', '')
        if not re.fullmatch(PROJECT_PATTERN, project):
            return _error('invalid_request')
        # Also invalidate any outstanding code for this project that has not been exchanged yet.
        with transaction.atomic():
            _lock_consent_owner(request.user)
            pending = AgentMcpGrant.objects.filter(
                owner=request.user, project_id=project, portal_revoked_at__isnull=True,
            )
            pending.update(
                portal_revoked_at=timezone.now(),
            )
        return HttpResponseRedirect(reverse('agents-oauth-grants'))
    projects = grants.order_by('project_id').values_list('project_id', flat=True).distinct()
    return render(request, 'agents/mcp_oauth.html', {'manage_projects': projects, 'management': True})
