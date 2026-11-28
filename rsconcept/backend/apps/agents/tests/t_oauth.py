''' Portal OAuth consent, PKCE, audience separation and live revocation. '''
import base64
import hashlib
from urllib.parse import parse_qs, urlencode, urlsplit

from django.test import Client, TestCase, override_settings
from django.utils import timezone

from apps.agents.models import AgentMcpGrant
from apps.rsform.models import RSForm
from apps.users.models import User


class TestMcpOAuth(TestCase):
    ''' Exercise the browser and server endpoints using their ordinary HTTP contracts. '''

    def test_delegation_uses_one_time_codes_and_distinct_audiences(self):
        user = User.objects.create_user(username='OAuth test', password='local-fixture-password')  # nosec B106
        target = RSForm.create(title='Private', alias='P', owner=user, access_policy='private', location='/U')
        issuer, origin, service = 'https://portal.example', 'https://mcp.example', 'test-only' * 6
        resource = f'{origin}/mcp/chat-one'
        callback = 'http://127.0.0.1:38737/callback'
        verifier = 'v' * 43
        challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).rstrip(b'=').decode()
        config = {'issuer': issuer, 'mcp_origin': origin, 'clients': {'pilot': {
            'redirect_uris': [callback], 'projects': {
                'research': {'users': [user.pk], 'scopes': ['read']},
                'other': {'users': [user.pk], 'scopes': ['read']},
            },
        }}}
        query = {'client_id': 'pilot', 'redirect_uri': callback, 'resource': resource, 'response_type': 'code',
                 'scope': 'portal.read', 'state': 'test-state', 'code_challenge': challenge, 'code_challenge_method': 'S256'}
        endpoint = '/api/agents/oauth/authorize?' + urlencode(query)
        browser = Client(enforce_csrf_checks=True)
        agent = Client()
        with override_settings(AGENT_MCP_OAUTH=config, AGENT_MCP_OAUTH_SERVICE_SECRET=service):
            self.assertEqual(agent.get('/.well-known/oauth-authorization-server').json()['issuer'], issuer)
            self.assertContains(browser.get(endpoint), 'Sign in')
            self.assertEqual(browser.post(endpoint, {'username': user.username, 'password': 'local-fixture-password'}).status_code, 403)
            response = browser.post(endpoint, {'username': user.username, 'password': 'local-fixture-password',
                                              'csrfmiddlewaretoken': browser.cookies['csrftoken'].value})
            self.assertEqual(response.status_code, 302)
            response = browser.get(endpoint)
            self.assertContains(response, 'research')
            csrf = browser.cookies['csrftoken'].value
            refused = browser.post(endpoint, {'project': 'foreign', 'decision': 'allow', 'csrfmiddlewaretoken': csrf})
            self.assertEqual(parse_qs(urlsplit(refused.url).query)['error'], ['access_denied'])
            consent = browser.post(endpoint, {'project': 'research', 'decision': 'allow', 'csrfmiddlewaretoken': csrf})
            result = parse_qs(urlsplit(consent.url).query)
            self.assertEqual(result['iss'], [issuer])
            self.assertEqual(result['state'], ['test-state'])
            token_data = {'grant_type': 'authorization_code', 'code': result['code'][0], 'client_id': 'pilot',
                          'redirect_uri': callback, 'resource': resource, 'code_verifier': verifier}
            token_url = '/api/agents/oauth/token'
            self.assertEqual(agent.post(token_url, {**token_data, 'code_verifier': 'w' * 43}).status_code, 400)
            token_response = agent.post(token_url, token_data)
            self.assertEqual(token_response.status_code, 200, token_response.content)
            mcp_token = token_response.json()['access_token']
            self.assertEqual(agent.post(token_url, token_data).status_code, 400)
            introspection = '/api/agents/oauth/introspect'
            args = {'token': mcp_token, 'resource': resource}
            auth = {'HTTP_AUTHORIZATION': f'Bearer {service}'}
            self.assertEqual(agent.post(introspection, args).status_code, 401)
            self.assertEqual(agent.post(introspection, {**args, 'resource': origin + '/mcp/other'}, **auth).json(), {'active': False})
            grant = agent.post(introspection, args, **auth).json()
            portal_token = grant['portal_token']
            self.assertNotEqual(portal_token, mcp_token)
            details = f'/api/agents/rsforms/{target.model.pk}/details'
            self.assertEqual(agent.get(details, HTTP_AUTHORIZATION=f'Bearer {mcp_token}').status_code, 401)
            self.assertEqual(agent.get(details, HTTP_AUTHORIZATION=f'Bearer {portal_token}').status_code, 200)
            self.assertEqual(agent.post('/api/agents/rsforms', {}, HTTP_AUTHORIZATION=f'Bearer {portal_token}').status_code, 403)
            second_resource = f'{origin}/mcp/chat-two'
            next_query = {**query, 'resource': second_resource}
            self.assertContains(browser.get('/api/agents/oauth/authorize?' + urlencode(next_query)), 'other')
            denied = browser.get('/api/agents/oauth/authorize?' + urlencode({**next_query, 'project': 'foreign'}))
            self.assertEqual(parse_qs(urlsplit(denied.url).query)['error'], ['access_denied'])
            second_endpoint = '/api/agents/oauth/authorize?' + urlencode({**next_query, 'project': 'research'})
            reused = browser.get(second_endpoint)
            second_code = parse_qs(urlsplit(reused.url).query)['code'][0]
            second_token = agent.post(token_url, {**token_data, 'code': second_code, 'resource': second_resource}).json()['access_token']
            second = {'token': second_token, 'resource': second_resource}
            self.assertEqual(agent.post(introspection, second, **auth).json()['project_id'], 'research')
            self.assertEqual(browser.post('/api/agents/oauth/grants', {'project': 'research',
                            'csrfmiddlewaretoken': csrf}).status_code, 302)
            self.assertEqual(agent.get(details, HTTP_AUTHORIZATION=f'Bearer {portal_token}').status_code, 401)
            self.assertIsNone(agent.post(introspection, args, **auth).json()['portal_token'])
            self.assertIsNone(agent.post(introspection, second, **auth).json()['portal_token'])
            AgentMcpGrant.objects.update(expires_at=timezone.now())
            self.assertEqual(agent.post(introspection, args, **auth).json(), {'active': False})
            self.assertContains(browser.get(second_endpoint), 'research')
            renewed = browser.post(second_endpoint, {'project': 'research', 'decision': 'allow', 'csrfmiddlewaretoken': csrf})
            new_code = parse_qs(urlsplit(renewed.url).query)['code'][0]
            new_token = agent.post(token_url, {**token_data, 'code': new_code, 'resource': second_resource}).json()['access_token']
            self.assertNotEqual(new_token, second_token)
            new_grant = agent.post(introspection, {**second, 'token': new_token}, **auth).json()
            self.assertEqual((new_grant['sub'], new_grant['project_id']), (grant['sub'], grant['project_id']))
            self.assertEqual(agent.get(details, HTTP_AUTHORIZATION=f"Bearer {new_grant['portal_token']}").status_code, 200)
