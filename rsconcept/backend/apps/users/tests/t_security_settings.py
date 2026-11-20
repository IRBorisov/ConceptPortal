''' Regression: production security settings match the deployment contract. '''
# pylint: disable=protected-access
import os
import tempfile
import warnings
from unittest.mock import Mock, patch

from django.conf import settings
from django.test import Client, SimpleTestCase, override_settings
from sentry_sdk import Client as SentryClient
from sentry_sdk.transport import Transport

from project import settings as project_settings
from project.settings import _get_secret, _hsts_policy, _proxy_ssl_header


class TestSecuritySettings(SimpleTestCase):
    ''' Defaults that must not depend on DEBUG, and secret/database wiring. '''

    def test_default_permission_is_authenticated(self):
        self.assertEqual(
            settings.REST_FRAMEWORK['DEFAULT_PERMISSION_CLASSES'],
            ['rest_framework.permissions.IsAuthenticated'],
        )

    def test_database_port_uses_django_key(self):
        database = settings.DATABASES['default']
        self.assertIn('PORT', database)
        self.assertNotIn('DB_PORT', database)
        self.assertEqual(database['PORT'], os.environ.get('DB_PORT'))

    def test_secret_file_strips_trailing_whitespace(self):
        handle = tempfile.NamedTemporaryFile(
            mode='w',
            encoding='utf-8',
            delete=False,
        )
        handle.write('secret-value\r\n')
        handle.close()
        self.addCleanup(os.remove, handle.name)
        with patch.dict(os.environ, {'DB_PASSWORD': handle.name}):
            self.assertEqual(_get_secret('DB_PASSWORD', ''), 'secret-value')

    def test_secret_file_keeps_leading_space(self):
        handle = tempfile.NamedTemporaryFile(
            mode='w',
            encoding='utf-8',
            delete=False,
        )
        handle.write(' secret-value\n')
        handle.close()
        self.addCleanup(os.remove, handle.name)
        with patch.dict(os.environ, {'DB_PASSWORD': handle.name}):
            self.assertEqual(_get_secret('DB_PASSWORD', ''), ' secret-value')

    def test_secret_env_value_is_not_stripped(self):
        with patch.dict(os.environ, {'SMTP_HOST': 'mail.example'}):
            self.assertEqual(_get_secret('SMTP_HOST', ''), 'mail.example')

    def test_production_hsts_meets_preload_minimum(self):
        seconds, include_subdomains, preload = _hsts_policy(False)
        self.assertGreaterEqual(seconds, 31536000)
        self.assertTrue(include_subdomains)
        self.assertTrue(preload)

    def test_proxy_ssl_header_follows_debug(self):
        self.assertEqual(_proxy_ssl_header(False), ('HTTP_X_FORWARDED_PROTO', 'https'))
        self.assertIsNone(_proxy_ssl_header(True))
        self.assertEqual(settings.SECURE_PROXY_SSL_HEADER, project_settings._proxy_ssl_header(project_settings.DEBUG))

    def test_forwarded_https_request_gets_hsts(self):
        with override_settings(
            SECURE_PROXY_SSL_HEADER=('HTTP_X_FORWARDED_PROTO', 'https'),
            SECURE_HSTS_SECONDS=31536000,
            SECURE_HSTS_INCLUDE_SUBDOMAINS=True,
            SECURE_HSTS_PRELOAD=True,
            SESSION_ENGINE='django.contrib.sessions.backends.signed_cookies',
        ):
            response = Client().get('/users/api/auth', HTTP_X_FORWARDED_PROTO='https')
        self.assertEqual(
            response['Strict-Transport-Security'],
            'max-age=31536000; includeSubDomains; preload',
        )

    def test_debug_hsts_is_disabled(self):
        seconds, include_subdomains, preload = _hsts_policy(True)
        self.assertEqual(seconds, 0)
        self.assertFalse(include_subdomains)
        self.assertFalse(preload)

    def test_configured_hsts_follows_policy(self):
        ''' The live settings stay tied to the policy chosen at startup.

        The test runner later forces DEBUG off, so this compares against the
        policy tuple captured when settings were imported.
        '''
        seconds, include_subdomains, preload = project_settings._HSTS_POLICY
        self.assertEqual(
            (
                settings.SECURE_HSTS_SECONDS,
                settings.SECURE_HSTS_INCLUDE_SUBDOMAINS,
                settings.SECURE_HSTS_PRELOAD,
            ),
            (seconds, include_subdomains, preload),
        )

    def test_sentry_scrubber_hides_password_aliases(self):
        ''' The real SDK sends masked aliases in both errors and transactions. '''
        with patch('sentry_sdk.init') as init:
            project_settings._init_sentry()
        transport = Mock(spec=Transport)
        password_fields = ('password', 'password1', 'password2', 'old_password', 'new_password', 'new_password2')
        with warnings.catch_warnings():
            warnings.simplefilter('error')
            with SentryClient(**init.call_args.kwargs, transport=transport, default_integrations=False) as sdk:
                sdk.capture_event({'message': 'test error', 'request': {'data': {'password1': 'secret'}}})
                sdk.capture_event({
                    'type': 'transaction',
                    'transaction': 'test transaction',
                    'request': {'data': {
                        'username': 'ada',
                        **dict.fromkeys(password_fields, 'secret'),
                        'nested': [{'password2': 'secret-nested'}],
                    }},
                })
        error_envelope, transaction_envelope = (call.args[0] for call in transport.capture_envelope.call_args_list)
        error = error_envelope.get_event()
        transaction = transaction_envelope.get_transaction_event()
        self.assertEqual(error['request']['data']['password1'], '[Filtered]')
        data = transaction['request']['data']
        self.assertEqual(data['username'], 'ada')
        for key in password_fields:
            self.assertEqual(data[key], '[Filtered]')
        self.assertEqual(data['nested'][0]['password2'], '[Filtered]')
