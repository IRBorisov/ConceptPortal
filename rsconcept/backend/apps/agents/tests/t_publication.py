''' Guarded publication must preserve versions and reject stale or unauthorized writes. '''
import sqlite3
from concurrent.futures import ThreadPoolExecutor
from contextlib import closing
from pathlib import Path
from tempfile import TemporaryDirectory
from threading import Barrier
from unittest import skipUnless
from unittest.mock import patch

from django.core.cache import cache
from django.db import connection, connections
from django.test import TransactionTestCase
from rest_framework.test import APIClient
from django.utils.dateparse import parse_datetime

from apps.agents.models import ApiKey
from apps.library.models import Editor, Version
from apps.rsform.models import RSForm
from apps.users.models import User
from apps.agents.views.publication import AgentRsformPublishView
from shared.EndpointTester import EndpointTester
from shared.portal_json import PORTAL_JSON_CONTRACT_VERSION


class TestAgentPublication(EndpointTester):
    ''' Integration tests for identity and atomic schema publication. '''

    def setUp(self):
        super().setUp()
        cache.clear()
        self.schema = RSForm.create(title='Before', alias='BASE', owner=self.user)
        self.schema.insert_last('X1')
        self.key, self.secret = ApiKey.create_for_user(self.user, 'MCP')
        self.client.force_authenticate(user=None)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.secret}')
        self.url = f'/api/agents/rsforms/{self.schema.model.pk}/publish'
        details = self.client.get(f'/api/agents/rsforms/{self.schema.model.pk}/details')
        self.payload = {
            'expected_time_update': details.data['time_update'],
            'schema': {'contract_version': PORTAL_JSON_CONTRACT_VERSION, 'title': 'After',
                       'alias': 'NEW', 'description': '', 'items': []},
        }

    def test_identity_never_returns_the_key(self):
        response = self.client.get('/api/agents/me')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {'id': self.user.pk, 'username': self.user.username,
                                         'scopes': ['read', 'write', 'publish'], 'expires_at': None})
        self.assertNotIn(self.secret, str(response.data))
        self.key.revoke()
        self.assertEqual(self.client.get('/api/agents/me').status_code, 401)

    def test_publish_preserves_snapshot_and_rejects_replay(self):
        response = self.client.post(self.url, self.payload)
        self.assertEqual(response.status_code, 200, response.data)
        snapshot = Version.objects.get(pk=response.data['version'])
        # SQLite does not enforce varchar limits; validate the PostgreSQL constraint explicitly.
        snapshot.full_clean()
        self.assertEqual(snapshot.data['alias'], 'BASE')
        self.assertEqual(len(snapshot.data['items']), 1)
        self.assertEqual(response.data['schema']['alias'], 'NEW')
        self.assertEqual(self.client.post(self.url, self.payload).status_code, 409)
        self.assertEqual(Version.objects.count(), 1)

    def test_stale_base_changes_nothing(self):
        self.schema.model.title = 'Concurrent edit'
        self.schema.model.save(update_fields=['title'])
        response = self.client.post(self.url, self.payload)
        self.assertEqual(response.status_code, 409)
        self.schema.model.refresh_from_db()
        self.assertEqual(self.schema.model.title, 'Concurrent edit')
        self.assertFalse(Version.objects.exists())

    def test_stalled_clock_does_not_make_a_base_reusable(self):
        before = parse_datetime(self.payload['expected_time_update'])
        with patch('apps.agents.views.publication.timezone.now', return_value=before):
            response = self.client.post(self.url, self.payload)
            self.assertEqual(response.status_code, 200, response.data)
            self.assertEqual(self.client.post(self.url, self.payload).status_code, 409)
        self.assertEqual(Version.objects.count(), 1)

    def test_editor_cannot_publish_without_snapshot_rights(self):
        other = RSForm.create(title='Other', alias='OTHER', owner=self.user2)
        Editor.add(other.model.pk, self.user.pk)
        response = self.client.post(f'/api/agents/rsforms/{other.model.pk}/publish', self.payload)
        self.assertEqual(response.status_code, 403)
        self.assertFalse(Version.objects.exists())

    def test_validation_failure_does_not_claim_base(self):
        before = self.schema.model.time_update
        self.payload['schema']['items'] = 'invalid'
        self.assertEqual(self.client.post(self.url, self.payload).status_code, 400)
        self.schema.model.refresh_from_db()
        self.assertEqual(self.schema.model.time_update, before)
        self.assertFalse(Version.objects.exists())

    def test_replace_failure_rolls_back_claim_and_snapshot(self):
        before = self.schema.model.time_update
        with patch('apps.agents.views.publication.replace_schema_content', side_effect=RuntimeError('failed')):
            with self.assertRaises(RuntimeError):
                self.client.post(self.url, self.payload)
        self.schema.model.refresh_from_db()
        self.assertEqual(self.schema.model.time_update, before)
        self.assertEqual(self.schema.model.alias, 'BASE')
        self.assertFalse(Version.objects.exists())

    def test_missing_base_and_session_auth_are_rejected(self):
        self.assertEqual(self.client.post(self.url, {'schema': self.payload['schema']}).status_code, 400)
        self.client.credentials()
        self.client.force_authenticate(user=self.user)
        self.assertEqual(self.client.post(self.url, self.payload).status_code, 403)


@skipUnless(connection.vendor == 'sqlite', 'Exercise the deployed SQLite write-lock behavior')
class TestConcurrentAgentPublication(TransactionTestCase):
    """Run real overlapping API requests on independent file-backed SQLite connections."""

    def test_competing_publications_have_one_winner_and_one_snapshot(self):
        cache.clear()
        user = User.objects.create(username='Concurrent publisher')
        schema = RSForm.create(title='Before', alias='BASE', owner=user)
        _, secret = ApiKey.create_for_user(user, 'Concurrency regression')
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f'Bearer {secret}')
        details = client.get(f'/api/agents/rsforms/{schema.model.pk}/details').data
        payload = {
            'expected_time_update': details['time_update'],
            'schema': {'contract_version': PORTAL_JSON_CONTRACT_VERSION, 'title': 'After',
                       'alias': 'NEW', 'description': '', 'items': []},
        }
        barrier = Barrier(2, timeout=10)
        original_lookup = AgentRsformPublishView._get_item  # pylint: disable=protected-access

        def synchronized_lookup(view, *args):
            item = original_lookup(view, *args)
            barrier.wait()
            return item

        def publish():
            thread_client = APIClient()
            thread_client.credentials(HTTP_AUTHORIZATION=f'Bearer {secret}')
            try:
                return thread_client.post(f'/api/agents/rsforms/{schema.model.pk}/publish', payload).status_code
            finally:
                connections.close_all()

        # Keep Django's in-memory handle while exercising production's waiting writers on a file DB.
        with TemporaryDirectory(prefix='portal-publication-') as directory:
            filename = str(Path(directory) / 'concurrent.sqlite3')
            original_handle = connection.connection
            original_name = connection.settings_dict['NAME']
            with closing(sqlite3.connect(filename)) as destination:
                original_handle.backup(destination)
            try:
                connection.settings_dict['NAME'] = filename
                connection.connection = None
                connection.ensure_connection()
                with patch.object(AgentRsformPublishView, '_get_item', synchronized_lookup):
                    with ThreadPoolExecutor(max_workers=2) as executor:
                        futures = [executor.submit(publish) for _ in range(2)]
                        self.assertEqual(sorted(future.result(timeout=20) for future in futures), [200, 409])
                self.assertEqual(Version.objects.filter(item_id=schema.model.pk).count(), 1)
                schema.model.refresh_from_db()
                self.assertEqual(schema.model.alias, 'NEW')
            finally:
                connection.close()
                connection.settings_dict['NAME'] = original_name
                connection.connection = original_handle
