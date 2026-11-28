''' OAuth discovery, consent and delegation for clients using HTTPS metadata. '''
import base64
import hashlib
import io
import json
from unittest.mock import patch
from urllib.parse import parse_qs, urlencode, urlsplit

from django.core.cache import caches
from django.test import Client, SimpleTestCase, TestCase, override_settings

from apps.agents.services import cimd
from apps.users.models import User

CLIENT_ID = 'https://client.example/oauth/' + 'desktop/' * 15 + 'client.json'
REDIRECT = 'http://127.0.0.1:48761/callback'
ISSUER = 'https://portal.example'
MCP = 'https://mcp.example'
RESOURCE = f'{MCP}/mcp/work'
SERVICE_SECRET = 'fixture-service-' * 4
AUTHORIZE = '/api/agents/oauth/authorize'
INTROSPECT = '/api/agents/oauth/introspect'
CONFIG = {'issuer': ISSUER, 'mcp_origin': MCP, 'clients': {}, 'cimd': {
    'projects': {'work': {'users': '*', 'scopes': ['read']}},
}}


def document(**fields):
    ''' Public client defaults to authorization code and no client secret. '''
    return {'client_id': CLIENT_ID, 'client_name': 'Document Client',
            'redirect_uris': ['http://127.0.0.1/callback', 'https://client.example/return'], **fields}


def reply(metadata, cache_control='max-age=60'):
    ''' Wire format emitted by curl with response headers. '''
    head = f'HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nCache-Control: {cache_control}\r\n\r\n'
    return head.encode() + json.dumps(metadata).encode()


class TestClientMetadata(SimpleTestCase):
    ''' Validate document contents, caching and bounded HTTPS transport. '''

    def setUp(self):
        caches['oauth_client_metadata'].clear()
        self.addCleanup(caches['oauth_client_metadata'].clear)

    def test_reads_and_caches_a_public_client_document(self):
        with patch.object(cimd, '_download', return_value=reply(document())) as download:
            metadata = cimd.discover(CLIENT_ID)
            self.assertEqual(cimd.discover(CLIENT_ID), metadata)
            download.assert_called_once_with(CLIENT_ID, 'client.example', 443)
        self.assertTrue(metadata.accepts_redirect(REDIRECT))
        self.assertTrue(metadata.accepts_redirect('https://client.example/return'))
        self.assertFalse(metadata.accepts_redirect('https://client.example:8443/return'))
        self.assertFalse(metadata.accepts_redirect('http://127.0.0.1:48761/different'))
        self.assertEqual(metadata.consent_digest(REDIRECT), metadata.consent_digest('http://127.0.0.1:48762/callback'))

    def test_invalid_metadata_and_no_store_are_never_cached(self):
        for metadata in (document(client_id='https://different.example/client.json'), document(redirect_uris=[]),
                         document(token_endpoint_auth_methods_supported=['private_key_jwt']),
                         document(grant_types=['client_credentials']), document(response_types=['token'])):
            with self.subTest(metadata=metadata), patch.object(cimd, '_download', return_value=reply(metadata)) as download:
                for _ in range(2):
                    with self.assertRaises(cimd.InvalidMetadata):
                        cimd.discover(CLIENT_ID)
                self.assertEqual(download.call_count, 2)
        with patch.object(cimd, '_download', return_value=reply(document(), 'no-store')) as download:
            cimd.discover(CLIENT_ID)
            cimd.discover(CLIENT_ID)
            self.assertEqual(download.call_count, 2)

    def test_rejects_nonpublic_dns_answers_before_starting_the_http_client(self):
        for address in ('127.0.0.1', '10.0.0.1', '169.254.0.1', '224.0.0.1', '::1', '64:ff9b::7f00:1'):
            records = [(0, 0, 0, '', ('8.8.8.8', 443)), (0, 0, 0, '', (address, 443))]
            with (self.subTest(address=address), patch.object(cimd.socket, 'getaddrinfo', return_value=records),
                  patch.object(cimd.subprocess, 'Popen') as transfer):
                with self.assertRaises(cimd.InvalidMetadata):
                    cimd.discover(CLIENT_ID)
                transfer.assert_not_called()

    def test_https_fetch_pins_dns_and_rejects_redirect_response_and_large_body(self):
        records = [(0, 0, 0, '', ('8.8.8.8', 443))]
        with (patch.object(cimd.socket, 'getaddrinfo', return_value=records),
              patch.object(cimd.subprocess, 'Popen') as process):
            transfer = process.return_value.__enter__.return_value
            transfer.wait.return_value = 0
            transfer.stdout = io.BytesIO(b'HTTP/1.1 302 Found\r\nLocation: https://client.example/next\r\n\r\n')
            with self.assertRaises(cimd.InvalidMetadata):
                cimd.discover(CLIENT_ID)
            command = process.call_args.args[0]
            self.assertIn('client.example:443:8.8.8.8', command)
            self.assertNotIn('--location', command)
            self.assertEqual(command[command.index('--noproxy') + 1], '*')
            transfer.stdout = io.BytesIO(b'x' * (cimd.MAX_RESPONSE + 1))
            with self.assertRaises(cimd.InvalidMetadata):
                cimd.discover(CLIENT_ID)
            transfer.kill.assert_called_once()


@override_settings(AGENT_MCP_OAUTH=CONFIG, AGENT_MCP_OAUTH_SERVICE_SECRET=SERVICE_SECRET)
class TestCimdAuthorization(TestCase):
    ''' Connect an unregistered public client through normal Portal HTTP endpoints. '''

    def setUp(self):
        caches['oauth_client_metadata'].clear()
        self.addCleanup(caches['oauth_client_metadata'].clear)
        self.browser = Client(enforce_csrf_checks=True)
        self.user = User.objects.create_user(username='CIMD account')
        self.verifier = 'v' * 43
        challenge = base64.urlsafe_b64encode(hashlib.sha256(self.verifier.encode()).digest()).rstrip(b'=').decode()
        self.query = {'client_id': CLIENT_ID, 'redirect_uri': REDIRECT, 'resource': RESOURCE, 'response_type': 'code',
                      'state': 'browser-state', 'code_challenge': challenge, 'code_challenge_method': 'S256'}
        self.endpoint = f'{AUTHORIZE}?{urlencode(self.query)}'

    def approve(self, page):
        ''' Submit the consent form with its CSRF token and metadata digest. '''
        return self.browser.post(self.endpoint, {'decision': 'allow', 'project': 'work',
            'csrfmiddlewaretoken': self.browser.cookies['csrftoken'].value,
            'client_metadata_digest': page.context['client_metadata_digest']})

    def test_full_authorization_uses_a_discovered_client_and_current_portal_policy(self):
        agent = Client()
        discovery = agent.get('/.well-known/oauth-authorization-server').json()
        self.assertTrue(discovery['client_id_metadata_document_supported'])
        with patch.object(cimd, '_download', return_value=reply(document())) as download:
            self.assertContains(self.browser.get(self.endpoint), 'name="password"')
            download.assert_not_called()
            self.browser.force_login(self.user)
            page = self.browser.get(self.endpoint)
            self.assertContains(page, 'Document Client')
            self.assertContains(page, CLIENT_ID)
            completed = self.approve(page)
            result = parse_qs(urlsplit(completed.url).query)
            self.assertEqual((result['state'], result['iss']), (['browser-state'], [ISSUER]))
            payload = {'grant_type': 'authorization_code', 'code': result['code'][0], 'client_id': CLIENT_ID,
                       'redirect_uri': REDIRECT, 'resource': RESOURCE, 'code_verifier': self.verifier}
            self.assertEqual(agent.post('/api/agents/oauth/token', {**payload, 'redirect_uri': REDIRECT + '/alt'}).status_code, 400)
            issued = agent.post('/api/agents/oauth/token', payload)
            self.assertEqual(issued.status_code, 200, issued.content)
            args = {'token': issued.json()['access_token'], 'resource': RESOURCE}
            auth = {'HTTP_AUTHORIZATION': f'Bearer {SERVICE_SECRET}'}
            grant = agent.post(INTROSPECT, args, **auth).json()
            self.assertEqual(grant['sub'], f'portal:{self.user.pk}')
            self.assertEqual(grant['scopes'], ['read'])
            bearer = {'HTTP_AUTHORIZATION': f"Bearer {grant['portal_token']}"}
            self.assertEqual(agent.get('/api/agents/me', **bearer).status_code, 200)
            with override_settings(AGENT_MCP_OAUTH={**CONFIG, 'cimd': None}):
                self.assertEqual(agent.post(INTROSPECT, args, **auth).json(), {'active': False})
                self.assertEqual(agent.get('/api/agents/me', **bearer).status_code, 401)
            download.assert_called_once()

    def test_refuses_an_unlisted_callback_and_does_not_accept_stale_consent(self):
        self.browser.force_login(self.user)
        with patch.object(cimd, '_download', return_value=reply(document(), 'no-store')) as download:
            response = self.browser.get(AUTHORIZE, {**self.query, 'redirect_uri': 'https://other.example/return'})
            self.assertEqual(response.status_code, 400)
            self.assertNotIn('Location', response.headers)
            page = self.browser.get(self.endpoint)
            download.return_value = reply(document(client_name='Changed client'), 'no-store')
            self.assertEqual(self.approve(page).status_code, 400)
            self.assertEqual(self.approve(self.browser.get(self.endpoint)).status_code, 302)
