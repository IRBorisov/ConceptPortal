"""Scoped, expiring keys must restrict capabilities without changing owner ACLs."""
from datetime import timedelta

from django.core.cache import cache
from django.utils import timezone
from rest_framework.test import APIClient

from apps.agents.models import ApiKey
from apps.library.models import Editor, Version
from apps.rsform.models import RSForm
from shared.EndpointTester import EndpointTester
from shared.portal_json import PORTAL_JSON_CONTRACT_VERSION


class TestApiKeyPolicy(EndpointTester):
    def setUp(self):
        super().setUp()
        cache.clear()

    def bearer(self, **policy):
        key, token = ApiKey.create_for_user(self.user, 'Synthetic policy key', **policy)
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
        return key, token, client

    def test_legacy_key_preserves_permissions_and_no_expiry(self):
        key, token, client = self.bearer()
        self.assertEqual(key.scopes, ['read', 'write', 'publish'])
        self.assertIsNone(key.expires_at)
        self.assertEqual(ApiKey.authenticate_token(token), key)
        self.assertEqual(client.get('/api/agents/me').status_code, 200)

    def test_expired_and_boundary_keys_cannot_authenticate(self):
        for moment in (timezone.now(), timezone.now() - timedelta(days=1)):
            with self.subTest(moment=moment):
                key, token, client = self.bearer(expires_at=moment)
                self.assertFalse(key.is_active)
                self.assertIsNone(ApiKey.authenticate_token(token))
                self.assertEqual(client.get('/api/agents/me').status_code, 401)
        key, token, client = self.bearer(expires_at=timezone.now() + timedelta(days=1))
        self.assertTrue(key.is_active)
        self.assertIsNotNone(ApiKey.authenticate_token(token))
        self.assertEqual(client.get('/api/agents/me').status_code, 200)

    def test_read_only_key_rejects_writes_without_mutating_schema(self):
        key, _, client = self.bearer(scopes=['read'])
        schema = RSForm.create(title='Synthetic schema', alias='SCOPED', owner=self.user)
        self.assertEqual(client.get('/api/agents/me').data['scopes'], ['read'])
        response = client.post(f'/api/agents/rsforms/{schema.model.pk}/description', {
            'expected_time_update': schema.model.time_update.isoformat(), 'description': 'Forbidden change',
        })
        self.assertEqual(response.status_code, 403)
        schema.model.refresh_from_db()
        self.assertNotEqual(schema.model.description, 'Forbidden change')
        self.assertEqual(key.scopes, ['read'])

    def test_write_scope_does_not_grant_publication(self):
        _, _, client = self.bearer(scopes=['read', 'write'])
        schema = RSForm.create(title='Synthetic schema', alias='SCOPED', owner=self.user)
        response = client.post(f'/api/agents/rsforms/{schema.model.pk}/publish', {})
        self.assertEqual(response.status_code, 403)
        self.assertFalse(Version.objects.exists())

    def test_publish_scope_still_requires_owner_acl(self):
        _, _, client = self.bearer(scopes=['read', 'publish'])
        schema = RSForm.create(title='Foreign synthetic schema', alias='OTHER', owner=self.user2)
        Editor.add(schema.model.pk, self.user.pk)
        response = client.post(f'/api/agents/rsforms/{schema.model.pk}/publish', {
            'expected_time_update': schema.model.time_update.isoformat(),
            'schema': {'contract_version': PORTAL_JSON_CONTRACT_VERSION, 'title': 'Attempted', 'alias': 'OTHER', 'description': '', 'items': []},
        })
        self.assertEqual(response.status_code, 403)
        self.assertFalse(Version.objects.exists())

    def test_create_validates_scopes_and_expiration(self):
        for policy in ({'scopes': []}, {'scopes': ['admin']}, {'expires_at': (timezone.now() - timedelta(days=1)).isoformat()}):
            with self.subTest(policy=policy):
                self.assertEqual(self.client.post('/api/agents/keys', {'label': 'Invalid', **policy}).status_code, 400)
        expiry = timezone.now() + timedelta(days=30)
        response = self.client.post('/api/agents/keys', {
            'label': 'Read only', 'scopes': ['read', 'read'], 'expires_at': expiry.isoformat(),
        })
        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(response.data['scopes'], ['read'])
        key = ApiKey.objects.get(pk=response.data['id'])
        self.assertEqual(key.expires_at, expiry)
        listed = self.client.get('/api/agents/keys')
        self.assertEqual(listed.data[0]['scopes'], ['read'])
        self.assertNotIn('secret', listed.data[0])

    def test_expired_keys_do_not_consume_active_key_quota(self):
        for index in range(5):
            ApiKey.create_for_user(self.user, f'Expired {index}', expires_at=timezone.now() - timedelta(days=1))
        self.assertEqual(self.client.post('/api/agents/keys', {'label': 'Replacement'}).status_code, 201)

    def test_identity_is_available_without_a_data_read_scope(self):
        _, _, client = self.bearer(scopes=['write'])
        self.assertEqual(client.get('/api/agents/me').status_code, 200)
        self.assertEqual(client.get('/api/agents/me').data['scopes'], ['write'])
        self.assertEqual(client.get('/api/agents/rsforms').status_code, 403)
