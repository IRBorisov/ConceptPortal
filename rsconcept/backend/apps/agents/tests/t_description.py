"""Description CAS preserves schema data and existing edit permissions."""
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
from django.test import TransactionTestCase, override_settings
from django.utils.dateparse import parse_datetime
from rest_framework.exceptions import PermissionDenied
from rest_framework.test import APIClient

from apps.agents.models import ApiKey, AgentActionLog
from apps.agents.views.description import AgentRsformDescriptionView
from apps.library.models import Editor, Version
from apps.rsform.models import RSForm
from apps.users.models import User
from shared.EndpointTester import EndpointTester


class TestAgentDescription(EndpointTester):
    def setUp(self):
        super().setUp()
        cache.clear()
        self.schema = RSForm.create(title='Schema', alias='SCHEMA', owner=self.user)
        self.schema.insert_last('X1')
        self.key, self.secret = ApiKey.create_for_user(self.user, 'Description test')
        self.client.force_authenticate(user=None)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.secret}')
        self.base = f'/api/agents/rsforms/{self.schema.model.pk}'
        self.before = self.client.get(self.base + '/details').data
        self.payload = {'expected_time_update': self.before['time_update'], 'description': 'Комментарий\n' * 200}

    def test_description_only_and_replay(self):
        response = self.client.post(self.base + '/description', self.payload)
        self.assertEqual(response.status_code, 200, response.data)
        after = self.client.get(self.base + '/details').data
        self.assertEqual(after['description'], self.payload['description'])
        self.assertNotEqual(after['time_update'], self.before['time_update'])
        self.assertEqual({k: v for k, v in after.items() if k not in ('description', 'time_update')},
                         {k: v for k, v in self.before.items() if k not in ('description', 'time_update')})
        self.assertFalse(Version.objects.exists())
        self.assertTrue(AgentActionLog.objects.filter(action='rsform.description').exists())
        self.assertEqual(self.client.post(self.base + '/description', self.payload).status_code, 409)

    def test_blank_and_whitespace_are_preserved(self):
        for description in ('  text\n ', ''):
            self.payload['description'] = description
            self.payload['expected_time_update'] = self.client.get(self.base + '/details').data['time_update']
            response = self.client.post(self.base + '/description', self.payload)
            self.assertEqual(response.status_code, 200, response.data)
            self.assertEqual(response.data['description'], description)

    def test_stale_revision_preserves_manual_edit(self):
        self.schema.model.description = 'Manual edit'
        self.schema.model.save(update_fields=['description'])
        self.assertEqual(self.client.post(self.base + '/description', self.payload).status_code, 409)
        self.schema.model.refresh_from_db()
        self.assertEqual(self.schema.model.description, 'Manual edit')

    def test_validation_rejects_other_fields_and_missing_base(self):
        for payload in ({**self.payload, 'title': 'Forbidden'}, {**self.payload, 'items': []},
                        {'description': 'Missing base'}, {**self.payload, 'description': 'x' * 100001}, []):
            self.assertEqual(self.client.post(self.base + '/description', payload).status_code, 400)
        self.schema.model.refresh_from_db()
        self.assertEqual(self.schema.model.description, self.before['description'])

    def test_permissions_editor_and_revoked_key(self):
        other = RSForm.create(title='Other', alias='OTHER', owner=self.user2)
        url = f'/api/agents/rsforms/{other.model.pk}/description'
        self.assertEqual(self.client.post(url, self.payload).status_code, 403)
        Editor.add(other.model.pk, self.user.pk)
        self.payload['expected_time_update'] = self.client.get(f'/api/agents/rsforms/{other.model.pk}/details').data['time_update']
        self.assertEqual(self.client.post(url, self.payload).status_code, 200)
        self.key.revoke()
        self.assertEqual(self.client.post(url, self.payload).status_code, 401)

    def test_stalled_clock_still_advances_revision(self):
        with patch('apps.agents.views.description.timezone.now', return_value=parse_datetime(self.before['time_update'])):
            self.assertEqual(self.client.post(self.base + '/description', self.payload).status_code, 200)
            self.assertEqual(self.client.post(self.base + '/description', self.payload).status_code, 409)

    @override_settings(TIME_ZONE='UTC')
    def test_unrepresentable_next_timestamp_is_validation_failure(self):
        before = self.client.get(self.base + '/details').data
        self.payload['expected_time_update'] = '9999-12-31T23:59:59.999999Z'
        response = self.client.post(self.base + '/description', self.payload)
        self.assertEqual(response.status_code, 400, response.data)
        self.assertEqual(str(response.data['expected_time_update']), 'Revision cannot be advanced.')
        self.assertEqual(self.client.get(self.base + '/details').data, before)

    def test_permission_change_rolls_back_claim(self):
        with patch('apps.agents.views.description.AgentRsformDescriptionView._require_edit',
                   side_effect=[None, PermissionDenied()]):
            self.assertEqual(self.client.post(self.base + '/description', self.payload).status_code, 403)
        self.schema.model.refresh_from_db()
        self.assertEqual(self.schema.model.description, self.before['description'])
        self.assertEqual(self.client.get(self.base + '/details').data['time_update'], self.before['time_update'])


@skipUnless(connection.vendor == 'sqlite', 'Exercise the deployed SQLite write-lock behavior')
class TestConcurrentAgentDescription(TransactionTestCase):
    """Run real overlapping API requests on independent file-backed SQLite connections."""

    def test_competing_descriptions_have_one_winner(self):
        cache.clear()
        user = User.objects.create(username='Concurrent publisher')
        schema = RSForm.create(title='Before', alias='BASE', owner=user)
        _, secret = ApiKey.create_for_user(user, 'Concurrency regression')
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f'Bearer {secret}')
        details = client.get(f'/api/agents/rsforms/{schema.model.pk}/details').data
        payload = {
            'expected_time_update': details['time_update'],
            'description': 'After',
        }
        barrier = Barrier(2, timeout=10)
        original_lookup = AgentRsformDescriptionView._get_item  # pylint: disable=protected-access

        def synchronized_lookup(view, *args):
            item = original_lookup(view, *args)
            barrier.wait()
            return item

        def publish():
            thread_client = APIClient()
            thread_client.credentials(HTTP_AUTHORIZATION=f'Bearer {secret}')
            try:
                return thread_client.post(f'/api/agents/rsforms/{schema.model.pk}/description', payload).status_code
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
                with patch.object(AgentRsformDescriptionView, '_get_item', synchronized_lookup):
                    with ThreadPoolExecutor(max_workers=2) as executor:
                        futures = [executor.submit(publish) for _ in range(2)]
                        self.assertEqual(sorted(future.result(timeout=20) for future in futures), [200, 409])
                self.assertEqual(Version.objects.filter(item_id=schema.model.pk).count(), 0)
                schema.model.refresh_from_db()
                self.assertEqual(schema.model.alias, 'BASE')
                self.assertEqual(schema.model.description, 'After')
            finally:
                connection.close()
                connection.settings_dict['NAME'] = original_name
                connection.connection = original_handle
