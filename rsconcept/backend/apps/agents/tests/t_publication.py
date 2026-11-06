''' Guarded publication must preserve versions and reject stale or unauthorized writes. '''
from unittest.mock import patch

from django.core.cache import cache

from apps.agents.models import ApiKey
from apps.library.models import Editor, Version
from apps.rsform.models import RSForm
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
        self.assertEqual(response.data, {'id': self.user.pk, 'username': self.user.username})
        self.assertNotIn(self.secret, str(response.data))
        self.key.revoke()
        self.assertEqual(self.client.get('/api/agents/me').status_code, 401)

    def test_publish_preserves_snapshot_and_rejects_replay(self):
        response = self.client.post(self.url, self.payload)
        self.assertEqual(response.status_code, 200, response.data)
        snapshot = Version.objects.get(pk=response.data['version'])
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
