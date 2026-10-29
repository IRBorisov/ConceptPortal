''' Testing API: agent changes of library location and access policy. '''
from unittest.mock import patch

from django.core.cache import cache
from django.db import connection
from rest_framework import status

from apps.agents.models import AgentActionLog, ApiKey
from apps.agents.views.attributes import AgentSetAccessPolicyView, AgentSetLocationView
from apps.library.models import AccessPolicy, Editor, LibraryItem
from apps.oss.models import OperationSchema, OperationType
from apps.rsform.models import RSForm
from shared.EndpointTester import EndpointTester, decl_endpoint


class TestAgentItemAttributes(EndpointTester):
    ''' Owner and staff can move an item and change its access policy. '''

    def setUp(self):
        super().setUp()
        cache.clear()
        self.owned = RSForm.create(
            title='Owned',
            alias='OWN',
            owner=self.user,
            location='/U/inbox',
            access_policy=AccessPolicy.PRIVATE,
        )
        self.owned_id = self.owned.model.pk
        self.shared = RSForm.create(
            title='Shared',
            alias='SHR',
            owner=self.user2,
            location='/S/shared',
            access_policy=AccessPolicy.PROTECTED,
        )
        Editor.add(self.shared.model.pk, self.user.pk)
        self.private_other = RSForm.create(
            title='Other',
            alias='OTH',
            owner=self.user2,
            location='/U/other',
            access_policy=AccessPolicy.PRIVATE,
        )
        self.key, secret = ApiKey.create_for_user(self.user, 'TestAgent')
        self.client.force_authenticate(user=None)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {secret}')

    def _logged(self, action: str, code: int = status.HTTP_200_OK, item_id: int | None = None) -> bool:
        rows = AgentActionLog.objects.filter(action=action, status_code=code, api_key=self.key)
        if item_id is not None:
            rows = rows.filter(item_id=item_id)
        return rows.exists()


    @decl_endpoint('/api/agents/library/{item}/set-location', method='patch')
    def test_set_location(self):
        time_update = self.owned.model.time_update
        target = '/S/Агентская автоматизация процессов'
        response = self.executeOK({'location': target}, item=self.owned_id)
        self.owned.model.refresh_from_db()
        self.assertEqual(self.owned.model.location, target)
        self.assertEqual(self.owned.model.time_update, time_update)
        self.assertEqual(response.data['location'], target)
        self.assertEqual(response.data['id'], self.owned_id)
        self.assertTrue(self._logged('library.set_location', item_id=self.owned_id))

        self.executeOK({'location': target}, item=self.owned_id)
        self.assertEqual(AgentActionLog.objects.filter(action='library.set_location').count(), 2)


    @decl_endpoint('/api/agents/library/{item}/set-location', method='patch')
    def test_set_location_denied(self):
        data = {'location': '/S/moved'}
        self.executeBadData({'location': 'invalid'}, item=self.owned_id)
        self.executeBadData({}, item=self.owned_id)
        self.executeNotFound(data, item=999999)
        self.executeForbidden(data, item=self.shared.model.pk)
        self.executeForbidden(data, item=self.private_other.model.pk)

        self.owned.model.read_only = True
        self.owned.model.save(update_fields=['read_only'])
        self.executeOK(data, item=self.owned_id)
        self.owned.model.refresh_from_db()
        self.assertEqual(self.owned.model.location, data['location'])

        self.owned.model.location = '/U/inbox'
        self.owned.model.save(update_fields=['location'])
        self.executeForbidden({'location': '/L'}, item=self.owned_id)
        self.owned.model.refresh_from_db()
        self.assertEqual(self.owned.model.location, '/U/inbox')
        self.shared.model.refresh_from_db()
        self.assertEqual(self.shared.model.location, '/S/shared')
        self.assertTrue(self._logged('library.set_location', status.HTTP_403_FORBIDDEN))
        self.assertTrue(self._logged('library.set_location', status.HTTP_400_BAD_REQUEST))


    @decl_endpoint('/api/agents/library/{item}/set-location', method='patch')
    def test_set_location_staff(self):
        self.toggle_admin(True)
        response = self.executeOK({'location': '/L/catalog'}, item=self.private_other.model.pk)
        self.private_other.model.refresh_from_db()
        self.assertEqual(self.private_other.model.location, '/L/catalog')
        self.assertEqual(response.data['location'], '/L/catalog')


    @decl_endpoint('/api/agents/library/{item}/set-location', method='patch')
    def test_set_location_requires_api_key(self):
        self.client.credentials()
        self.client.force_authenticate(user=self.user)
        self.executeForbidden({'location': '/S/moved'}, item=self.owned_id)
        self.owned.model.refresh_from_db()
        self.assertEqual(self.owned.model.location, '/U/inbox')
        self.assertFalse(AgentActionLog.objects.filter(action='library.set_location').exists())


    @decl_endpoint('/api/agents/library/{item}/set-access-policy', method='patch')
    def test_set_access_policy(self):
        time_update = self.owned.model.time_update
        response = self.executeOK(
            {'access_policy': AccessPolicy.PROTECTED},
            item=self.owned_id,
        )
        self.owned.model.refresh_from_db()
        self.assertEqual(self.owned.model.access_policy, AccessPolicy.PROTECTED)
        self.assertEqual(self.owned.model.time_update, time_update)
        self.assertEqual(response.data['access_policy'], AccessPolicy.PROTECTED)
        self.assertTrue(self._logged('library.set_access_policy', item_id=self.owned_id))

        self.executeOK({'access_policy': AccessPolicy.PROTECTED}, item=self.owned_id)


    @decl_endpoint('/api/agents/library/{item}/set-access-policy', method='patch')
    def test_set_access_policy_denied(self):
        data = {'access_policy': AccessPolicy.PRIVATE}
        self.executeBadData({'access_policy': 'invalid'}, item=self.owned_id)
        self.executeNotFound(data, item=999999)
        self.executeForbidden(data, item=self.shared.model.pk)
        self.executeForbidden(data, item=self.private_other.model.pk)
        self.shared.model.refresh_from_db()
        self.assertEqual(self.shared.model.access_policy, AccessPolicy.PROTECTED)
        self.assertTrue(self._logged('library.set_access_policy', status.HTTP_403_FORBIDDEN))


    @decl_endpoint('/api/agents/library/{item}/set-access-policy', method='patch')
    def test_set_access_policy_staff(self):
        self.toggle_admin(True)
        self.executeOK({'access_policy': AccessPolicy.PUBLIC}, item=self.private_other.model.pk)
        self.private_other.model.refresh_from_db()
        self.assertEqual(self.private_other.model.access_policy, AccessPolicy.PUBLIC)


    @decl_endpoint('/api/agents/library/{item}/set-location', method='patch')
    def test_oss_owned_results_follow_attributes(self):
        oss = OperationSchema.create(
            title='OSS',
            alias='OSS',
            owner=self.user,
            location='/S/old',
            access_policy=AccessPolicy.PUBLIC,
        )
        owned_input = oss.create_operation(alias='1', operation_type=OperationType.INPUT)
        owned_schema = OperationSchema.create_input(oss.model.pk, owned_input)
        other = RSForm.create(
            title='Foreign',
            alias='FRN',
            owner=self.user2,
            location='/S/old',
            access_policy=AccessPolicy.PUBLIC,
        )
        oss.create_operation(
            alias='2',
            operation_type=OperationType.INPUT,
            result=other.model,
        )
        aside = RSForm.create(
            title='Aside',
            alias='ASD',
            owner=self.user,
            location='/U/aside',
            access_policy=AccessPolicy.PUBLIC,
        )
        oss.create_operation(
            alias='3',
            operation_type=OperationType.INPUT,
            result=aside.model,
        )

        target = '/S/Агентская автоматизация процессов'
        self.executeOK({'location': target}, item=oss.model.pk)

        oss.model.refresh_from_db()
        owned_schema.refresh_from_db()
        other.model.refresh_from_db()
        aside.model.refresh_from_db()
        self.assertEqual(oss.model.location, target)
        self.assertEqual(owned_schema.location, target)
        self.assertEqual(other.model.location, '/S/old')
        self.assertEqual(aside.model.location, '/U/aside')

        self.endpoint_mask = '/api/agents/library/{item}/set-access-policy'
        self.method = 'patch'
        self.executeOK({'access_policy': AccessPolicy.PROTECTED}, item=oss.model.pk)
        for row in (oss.model, owned_schema, other.model, aside.model):
            row.refresh_from_db()
        self.assertEqual(oss.model.access_policy, AccessPolicy.PROTECTED)
        self.assertEqual(owned_schema.access_policy, AccessPolicy.PROTECTED)
        self.assertEqual(other.model.access_policy, AccessPolicy.PUBLIC)
        self.assertEqual(aside.model.access_policy, AccessPolicy.PUBLIC)
        self.assertFalse(LibraryItem.objects.filter(pk=owned_schema.pk, location='/S/old').exists())


    @decl_endpoint('/api/agents/library/{item}/set-location', method='patch')
    def test_set_location_locks_the_row(self):
        ''' The owner check and the write share one transaction that locks the row. '''
        outer = len(connection.atomic_blocks)
        depths: list[int] = []
        real = LibraryItem.objects.select_for_update

        def tracked(*args, **kwargs):
            depths.append(len(connection.atomic_blocks))
            return real(*args, **kwargs)

        with patch.object(LibraryItem.objects, 'select_for_update', side_effect=tracked):
            self.executeOK({'location': '/S/locked'}, item=self.owned_id)
        self.assertGreaterEqual(len(depths), 1)
        self.assertTrue(all(depth > outer for depth in depths))
        self.owned.model.refresh_from_db()
        self.assertEqual(self.owned.model.location, '/S/locked')


    def test_attribute_routes_are_not_heavy(self):
        self.assertFalse(AgentSetLocationView.agent_heavy)
        self.assertFalse(AgentSetAccessPolicyView.agent_heavy)
        self.assertEqual(AgentSetLocationView.agent_action, 'library.set_location')
        self.assertEqual(AgentSetAccessPolicyView.agent_action, 'library.set_access_policy')
