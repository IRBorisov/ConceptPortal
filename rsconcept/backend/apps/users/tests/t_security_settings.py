''' Regression: production security settings match the deployment contract. '''
# pylint: disable=protected-access
import os
import tempfile
from unittest.mock import patch

from django.conf import settings
from django.test import Client, SimpleTestCase, override_settings

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
        ''' EventScrubber matches keys exactly, so password aliases need their own entries. '''
        with patch('sentry_sdk.init') as init:
            project_settings._init_sentry()
        scrubber = init.call_args.kwargs['event_scrubber']
        event = {
            'request': {
                'data': {
                    'username': 'ada',
                    'password': 'secret-password',
                    'password1': 'secret-password1',
                    'password2': 'secret-password2',
                    'old_password': 'secret-old',
                    'new_password': 'secret-new',
                    'new_password2': 'secret-new2',
                    'nested': {'password2': 'secret-nested'},
                }
            }
        }
        scrubber.scrub_event(event)
        data = event['request']['data']
        self.assertEqual(data['username'], 'ada')
        for key in ('password', 'password1', 'password2', 'old_password', 'new_password', 'new_password2'):
            self.assertNotIsInstance(data[key], str)
        self.assertNotIsInstance(data['nested']['password2'], str)
