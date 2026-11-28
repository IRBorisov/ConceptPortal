''' OAuth discovery, consent and delegation for clients using HTTPS metadata. '''
import base64
import hashlib
import io
import json
import ssl
from http.client import HTTPMessage
from unittest.mock import MagicMock, patch
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
    ''' A JSON metadata response with standard HTTP cache headers. '''
    headers = HTTPMessage()
    headers['Content-Type'] = 'application/json'
    headers['Cache-Control'] = cache_control
    return json.dumps(metadata).encode(), headers


class TestClientMetadata(SimpleTestCase):
    ''' Validate document contents, caching and bounded HTTPS transport. '''

    def setUp(self):
        caches['oauth_client_metadata'].clear()
        self.addCleanup(caches['oauth_client_metadata'].clear)

    def test_reads_and_caches_a_public_client_document(self):
        with patch.object(cimd, '_download', return_value=reply(document())) as download:
            metadata = cimd.discover(CLIENT_ID)
            self.assertEqual(cimd.discover(CLIENT_ID), metadata)
            download.assert_called_once_with(CLIENT_ID, urlsplit(CLIENT_ID))
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

    def test_selected_client_authentication_cannot_be_downgraded_to_public(self):
        methods = ['none', 'private_key_jwt']
        confidential = document(token_endpoint_auth_method='private_key_jwt', token_endpoint_auth_methods_supported=methods)
        public = document(token_endpoint_auth_method='none', token_endpoint_auth_methods_supported=methods)
        with patch.object(cimd, '_download', side_effect=[reply(confidential), reply(public)]):
            with self.assertRaises(cimd.InvalidMetadata):
                cimd.discover(CLIENT_ID)
            self.assertEqual(cimd.discover(CLIENT_ID).name, 'Document Client')

    def test_rejects_nonpublic_dns_answers_before_starting_the_http_client(self):
        for address in ('127.0.0.1', '10.0.0.1', '169.254.0.1', '224.0.0.1', '::1', '64:ff9b::7f00:1'):
            records = [(0, 0, 0, '', ('8.8.8.8', 443)), (0, 0, 0, '', (address, 443))]
            with (self.subTest(address=address), patch.object(cimd.socket, 'getaddrinfo', return_value=records),
                  patch.object(cimd, '_connect') as connect):
                with self.assertRaises(cimd.InvalidMetadata):
                    cimd.discover(CLIENT_ID)
                connect.assert_not_called()

    def test_https_pins_dns_while_validating_tls_for_the_client_hostname(self):
        self.assertGreaterEqual(cimd._TLS.minimum_version, ssl.TLSVersion.TLSv1_2)
        self.assertTrue(cimd._TLS.check_hostname)
        self.assertEqual(cimd._TLS.verify_mode, ssl.CERT_REQUIRED)
        records = [(0, 0, 0, '', ('8.8.8.8', 443))]
        with (patch.object(cimd.socket, 'getaddrinfo', return_value=records),
              patch.object(cimd.socket, 'socket') as create_socket, patch.object(cimd._TLS, 'wrap_socket') as tls,
              patch.object(cimd, 'HTTPConnection') as http):
            socket = create_socket.return_value.__enter__.return_value
            connection = http.return_value
            response = connection.getresponse.return_value.__enter__.return_value
            response.status = 302
            with self.assertRaises(cimd.InvalidMetadata):
                cimd.discover(CLIENT_ID)
            socket.connect.assert_called_once_with(('8.8.8.8', 443))
            tls.assert_called_once_with(socket, server_hostname='client.example')
            self.assertIs(connection.sock, tls.return_value.__enter__.return_value)
            connection.request.assert_called_once_with('GET', urlsplit(CLIENT_ID).path, headers={
                'Host': 'client.example', 'Accept': 'application/json', 'Connection': 'close',
            })
            response.read.assert_not_called()

    def test_limits_http_headers_and_streamed_metadata_body(self):
        peer = MagicMock()
        peer.makefile.return_value = io.BytesIO(b'HTTP/1.1 200 OK\r\nX-Test: ' + b'x' * cimd.MAX_HEADERS + b'\r\n\r\n')
        with cimd._MetadataResponse(peer) as response, self.assertRaises(cimd.InvalidMetadata):
            response.begin()

        connection = MagicMock()
        response = connection.getresponse.return_value.__enter__.return_value
        response.status, response.length = 200, None
        response.read.return_value = b'x' * (cimd.MAX_DOCUMENT + 1)
        with self.assertRaises(cimd.InvalidMetadata):
            cimd._read_response(connection, '/client.json', 'client.example')
        response.read.assert_called_once_with(cimd.MAX_DOCUMENT + 1)


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
