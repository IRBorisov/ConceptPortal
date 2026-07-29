''' Testing API: Agents keys, auth, rsform mutations, audit log. '''
from rest_framework import status

from apps.agents.models import AgentActionLog, ApiKey
from apps.library.models import AccessPolicy
from apps.rsform.models import CstType, RSForm
from shared.EndpointTester import EndpointTester, decl_endpoint
from shared.portal_json import PORTAL_JSON_CONTRACT_VERSION


class TestAgentApiKeys(EndpointTester):
    ''' Session-managed API keys. '''

    @decl_endpoint('/api/agents/keys', method='post')
    def test_create_and_list_key(self):
        response = self.executeCreated({'label': 'Cursor'})
        self.assertIn('secret', response.data)
        self.assertTrue(response.data['secret'].startswith('rcp_'))
        self.assertEqual(response.data['label'], 'Cursor')
        secret = response.data['secret']

        self.endpoint = '/api/agents/keys'
        self.method = 'get'
        listed = self.executeOK()
        self.assertEqual(len(listed.data), 1)
        self.assertNotIn('secret', listed.data[0])
        self.assertEqual(listed.data[0]['prefix'], response.data['prefix'])

        key = ApiKey.authenticate_token(secret)
        self.assertIsNotNone(key)
        self.assertEqual(key.owner_id, self.user.pk)

    @decl_endpoint('/api/agents/keys/{item}', method='delete')
    def test_revoke_key(self):
        key, secret = ApiKey.create_for_user(self.user, 'Temp')
        self.executeNoContent(item=key.pk)
        key.refresh_from_db()
        self.assertIsNotNone(key.revoked_at)
        self.assertIsNone(ApiKey.authenticate_token(secret))

    @decl_endpoint('/api/agents/keys', method='post')
    def test_create_key_requires_session_not_api_key(self):
        _, secret = ApiKey.create_for_user(self.user, 'Agent')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {secret}')
        # force_authenticate still sets user; IsSessionUser blocks when auth is ApiKey
        self.client.force_authenticate(user=self.user)
        # Re-auth via header only: clear session auth then set bearer
        self.client.force_authenticate(user=None)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {secret}')
        response = self.execute(data={'label': 'Nope'})
        self.assertIn(response.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))


class TestAgentRsformApi(EndpointTester):
    ''' API-key authenticated RSForm agent routes. '''

    def setUp(self):
        super().setUp()
        self.owned = RSForm.create(title='Owned', alias='OWN', owner=self.user)
        self.owned_id = self.owned.model.pk
        self.private_other = RSForm.create(
            title='Other',
            alias='OTH',
            owner=self.user2,
            access_policy=AccessPolicy.PRIVATE,
        )
        self.key, self.secret = ApiKey.create_for_user(self.user, 'TestAgent')
        self.client.force_authenticate(user=None)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.secret}')

    @decl_endpoint('/api/agents/rsforms/{item}/details', method='get')
    def test_details_owned(self):
        response = self.executeOK(item=self.owned_id)
        self.assertEqual(response.data['alias'], 'OWN')

    @decl_endpoint('/api/agents/rsforms/{item}/details', method='get')
    def test_details_private_forbidden(self):
        self.executeForbidden(item=self.private_other.model.pk)

    @decl_endpoint('/api/agents/rsforms/{item}/details', method='get')
    def test_details_rejects_session_without_key(self):
        self.client.credentials()
        self.client.force_authenticate(user=self.user)
        self.executeForbidden(item=self.owned_id)

    @decl_endpoint('/api/agents/rsforms', method='post')
    def test_create_rsform(self):
        response = self.executeCreated({'title': 'Agent Schema', 'alias': 'AG1'})
        self.assertEqual(response.data['alias'], 'AG1')
        self.assertEqual(
            AgentActionLog.objects.filter(user=self.user, action='rsform.create').count(),
            1,
        )

    @decl_endpoint('/api/agents/rsforms/{item}/constituents', method='post')
    def test_create_and_update_constituenta(self):
        response = self.executeCreated(
            {
                'alias': 'X1',
                'cst_type': CstType.BASE,
                'term_raw': 'элемент',
            },
            item=self.owned_id,
        )
        cst_id = response.data['new_cst']['id']
        self.assertEqual(response.data['new_cst']['alias'], 'X1')

        self.endpoint_mask = '/api/agents/rsforms/{item}/constituents/{cst}'
        self.method = 'patch'
        # resolve manually
        self.endpoint = f'/api/agents/rsforms/{self.owned_id}/constituents/{cst_id}'
        updated = self.executeOK({'term_raw': 'множество', 'definition_formal': ''})
        items = {row['id']: row for row in updated.data['items']}
        self.assertEqual(items[cst_id]['term_raw'], 'множество')
        self.assertTrue(
            AgentActionLog.objects.filter(action='rsform.create_cst', api_key=self.key).exists()
        )
        self.assertTrue(
            AgentActionLog.objects.filter(action='rsform.update_cst', api_key=self.key).exists()
        )

    @decl_endpoint('/api/agents/rsforms/{item}/replace', method='patch')
    def test_replace_schema(self):
        data = {
            'contract_version': PORTAL_JSON_CONTRACT_VERSION,
            'title': 'Replaced',
            'alias': 'REP',
            'description': '',
            'items': [
                {
                    'id': 1,
                    'alias': 'X1',
                    'convention': '',
                    'crucial': False,
                    'cst_type': CstType.BASE,
                    'definition_formal': '',
                    'definition_raw': '',
                    'definition_resolved': '',
                    'term_raw': 'вещь',
                    'term_resolved': '',
                    'term_forms': [],
                }
            ],
        }
        response = self.executeOK(data, item=self.owned_id)
        self.assertEqual(response.data['alias'], 'REP')
        self.assertEqual(len(response.data['items']), 1)
        self.assertEqual(response.data['items'][0]['alias'], 'X1')
        self.assertTrue(
            AgentActionLog.objects.filter(action='rsform.replace', item_id=self.owned_id).exists()
        )

    @decl_endpoint('/api/agents/library/context-search', method='get')
    def test_context_search(self):
        response = self.client.get('/api/agents/library/context-search', {'q': 'Owned'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn(self.owned_id, response.data['ids'])

    @decl_endpoint('/api/agents/logs', method='get')
    def test_logs_session_only(self):
        # create an action first via agent API
        self.client.post(
            '/api/agents/rsforms',
            {'title': 'Logged', 'alias': 'LG1'},
            format='json',
        )
        # logs require session
        self.client.credentials()
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/agents/logs')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(response.data['count'], 1)
        self.assertIn('results', response.data)
