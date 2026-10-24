''' Testing API: Agent RSForm editing routes and library lookup by ids. '''
from django.core.cache import cache
from rest_framework import status

from apps.agents.models import AgentActionLog, ApiKey
from apps.library.models import AccessPolicy, Editor, Version
from apps.rsform.models import Constituenta, CstType, RSForm
from shared.EndpointTester import EndpointTester, decl_endpoint


class TestAgentRsformRoutes(EndpointTester):
    ''' create-version, constituents/delete, substitute, move-cst and library/by-ids. '''

    def setUp(self):
        super().setUp()
        cache.clear()
        self.owned = RSForm.create(title='Owned', alias='OWN', owner=self.user)
        self.owned_id = self.owned.model.pk
        self.x1 = self.owned.insert_last('X1')
        self.x2 = self.owned.insert_last('X2')
        self.d1 = self.owned.insert_last('D1', cst_type=CstType.TERM, definition_formal=r'X2\X2')

        self.shared = RSForm.create(
            title='Shared',
            alias='SHR',
            owner=self.user2,
            access_policy=AccessPolicy.PROTECTED,
        )
        self.shared_x1 = self.shared.insert_last('X1')
        Editor.add(self.shared.model.pk, self.user.pk)
        self.private_other = RSForm.create(
            title='Other',
            alias='OTH',
            owner=self.user2,
            access_policy=AccessPolicy.PRIVATE,
        )
        self.other_x1 = self.private_other.insert_last('X1')

        self.key, secret = ApiKey.create_for_user(self.user, 'TestAgent')
        self.client.force_authenticate(user=None)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {secret}')

    def _logged(self, action: str, code: int = status.HTTP_200_OK, item_id: int | None = None) -> bool:
        rows = AgentActionLog.objects.filter(action=action, status_code=code, api_key=self.key)
        if item_id is not None:
            rows = rows.filter(item_id=item_id)
        return rows.exists()

    def _set_read_only(self, schema: RSForm) -> None:
        schema.model.read_only = True
        schema.model.save(update_fields=['read_only'])


    @decl_endpoint('/api/agents/rsforms/{item}/create-version', method='post')
    def test_create_version(self):
        data = {'version': '1.0', 'description': 'Snapshot', 'items': [self.x1.pk]}
        response = self.executeCreated(data, item=self.owned_id)
        version = Version.objects.get(pk=response.data['version'])
        self.assertEqual(version.item_id, self.owned_id)
        self.assertEqual(version.version, '1.0')
        self.assertEqual([cst['id'] for cst in version.data['items']], [self.x1.pk])
        self.assertEqual(response.data['schema']['id'], self.owned_id)
        self.assertTrue(self._logged('rsform.create_version', status.HTTP_201_CREATED, self.owned_id))


    @decl_endpoint('/api/agents/rsforms/{item}/create-version', method='post')
    def test_create_version_owner_only(self):
        data = {'version': '1.0', 'description': ''}
        self.executeForbidden(data, item=self.shared.model.pk)
        self.executeForbidden(data, item=self.private_other.model.pk)
        self.assertFalse(Version.objects.exists())
        self.assertTrue(self._logged('rsform.create_version', status.HTTP_403_FORBIDDEN))


    @decl_endpoint('/api/agents/rsforms/{item}/constituents/delete', method='post')
    def test_delete_constituents(self):
        response = self.executeOK({'items': [self.x2.pk]}, item=self.owned_id)
        self.assertFalse(Constituenta.objects.filter(pk=self.x2.pk).exists())
        self.assertEqual([cst['alias'] for cst in response.data['items']], ['X1', 'D1'])
        self.assertTrue(self._logged('rsform.delete_cst', item_id=self.owned_id))

        self.executeOK({'items': [self.shared_x1.pk]}, item=self.shared.model.pk)
        self.assertFalse(Constituenta.objects.filter(pk=self.shared_x1.pk).exists())


    @decl_endpoint('/api/agents/rsforms/{item}/constituents/delete', method='post')
    def test_delete_constituents_denied(self):
        self.executeForbidden({'items': [self.other_x1.pk]}, item=self.private_other.model.pk)
        self.executeBadData({'items': [self.other_x1.pk]}, item=self.owned_id)
        self._set_read_only(self.owned)
        self.executeForbidden({'items': [self.x2.pk]}, item=self.owned_id)
        self.assertEqual(Constituenta.objects.filter(pk__in=[self.x2.pk, self.other_x1.pk]).count(), 2)
        self.assertTrue(self._logged('rsform.delete_cst', status.HTTP_403_FORBIDDEN))


    @decl_endpoint('/api/agents/rsforms/{item}/substitute', method='post')
    def test_substitute(self):
        data = {'substitutions': [{'original': self.x2.pk, 'substitution': self.x1.pk}]}
        self.executeOK(data, item=self.owned_id)
        self.assertFalse(Constituenta.objects.filter(pk=self.x2.pk).exists())
        self.d1.refresh_from_db()
        self.assertEqual(self.d1.definition_formal, r'X1\X1')
        self.assertTrue(self._logged('rsform.substitute', item_id=self.owned_id))


    @decl_endpoint('/api/agents/rsforms/{item}/substitute', method='post')
    def test_substitute_denied(self):
        data = {'substitutions': [{'original': self.x2.pk, 'substitution': self.x1.pk}]}
        self._set_read_only(self.owned)
        self.executeForbidden(data, item=self.owned_id)
        self.assertTrue(Constituenta.objects.filter(pk=self.x2.pk).exists())

        foreign = {'substitutions': [{'original': self.other_x1.pk, 'substitution': self.other_x1.pk}]}
        self.executeForbidden(foreign, item=self.private_other.model.pk)
        self.assertTrue(self._logged('rsform.substitute', status.HTTP_403_FORBIDDEN))


    @decl_endpoint('/api/agents/rsforms/{item}/move-cst', method='patch')
    def test_move_cst(self):
        response = self.executeOK({'items': [self.d1.pk], 'move_to': 0}, item=self.owned_id)
        self.assertEqual([cst['alias'] for cst in response.data['items']], ['D1', 'X1', 'X2'])
        self.assertTrue(self._logged('rsform.move_cst', item_id=self.owned_id))


    @decl_endpoint('/api/agents/rsforms/{item}/move-cst', method='patch')
    def test_move_cst_denied(self):
        self.executeForbidden({'items': [self.other_x1.pk], 'move_to': 0}, item=self.private_other.model.pk)
        self._set_read_only(self.owned)
        self.executeForbidden({'items': [self.d1.pk], 'move_to': 0}, item=self.owned_id)
        self.d1.refresh_from_db()
        self.assertEqual(self.d1.order, 2)


    @decl_endpoint('/api/agents/library/by-ids', method='get')
    def test_items_by_ids(self):
        ids = [self.shared.model.pk, self.private_other.model.pk, self.owned_id]
        response = self.client.get(self.endpoint, {'ids': ','.join(str(pk) for pk in ids)})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual([row['id'] for row in response.data], [self.shared.model.pk, self.owned_id])

        response = self.client.get(self.endpoint, {'ids': 'abc'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


    @decl_endpoint('/api/agents/library/by-ids', method='get')
    def test_items_by_ids_requires_api_key(self):
        self.client.credentials()
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.endpoint, {'ids': str(self.owned_id)})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
