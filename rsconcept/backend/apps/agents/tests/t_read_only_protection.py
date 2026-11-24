''' Testing API: ``read_only`` blocks every agent (MCP) content change, for staff keys too. '''
from django.core.cache import cache
from rest_framework.test import APIClient

from apps.agents.models import ApiKey
from apps.library.models import AccessPolicy, Editor, LibraryItem, Version
from apps.oss.models import Block, Operation, OperationSchema, OperationType
from apps.rsform.models import Constituenta, CstType, RSForm
from apps.rsmodel.models import ConstituentData, RSModel
from apps.users.models import User
from shared.EndpointTester import EndpointTester
from shared.portal_json import PORTAL_JSON_CONTRACT_VERSION


class TestAgentReadOnlyProtection(EndpointTester):
    ''' Owner, editor and staff keys cannot write a locked item; unlocking is a separate Portal change. '''

    def setUp(self):
        super().setUp()
        cache.clear()
        self.staff = User.objects.create(username='StaffAgent', email='staff-agent@test.com', password='password',
                                         is_staff=True)
        self.schema = RSForm.create(title='Locked', alias='LCK', owner=self.user,
                                    access_policy=AccessPolicy.PROTECTED)
        self.x1 = self.schema.insert_last('X1')
        self.x2 = self.schema.insert_last('X2', cst_type=CstType.BASE)
        self.model = RSModel.create(self.schema.model, title='Locked model', alias='LCKM', owner=self.user,
                                    access_policy=AccessPolicy.PROTECTED)
        ConstituentData.objects.create(model=self.model.model, constituent=self.x1, type='basic', data={'1': 'a'})
        self.oss = OperationSchema.create(title='Locked OSS', alias='LCKO', owner=self.user,
                                          access_policy=AccessPolicy.PROTECTED)
        self.operation = self.oss.create_operation(alias='1', operation_type=OperationType.INPUT)
        self.oss.create_block(title='B1')
        self.items = [self.schema.model, self.model.model, self.oss.model]
        for item in self.items:
            Editor.add(item.pk, self.user2.pk)
            item.read_only = True
            item.save(update_fields=['read_only'])

    def _client(self, user: User) -> APIClient:
        _, secret = ApiKey.create_for_user(user, f'Agent {user.username}')
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f'Bearer {secret}')
        return client

    def _snapshot(self) -> dict:
        return {
            'items': list(LibraryItem.objects.order_by('pk').values(
                'pk', 'title', 'alias', 'description', 'location', 'time_update', 'read_only',
            )),
            'constituents': list(Constituenta.objects.order_by('pk').values_list('pk', 'alias', 'order')),
            'values': list(ConstituentData.objects.order_by('pk').values_list('pk', 'data')),
            'operations': list(Operation.objects.order_by('pk').values_list('pk', 'alias', 'title')),
            'blocks': list(Block.objects.order_by('pk').values_list('pk', 'title')),
            'versions': list(Version.objects.order_by('pk').values_list('pk', 'version')),
        }

    def _writes(self) -> list[tuple[str, str, object]]:
        self.schema.model.refresh_from_db()
        schema_id = self.schema.model.pk
        model_id = self.model.model.pk
        oss_id = self.oss.model.pk
        routes: list[tuple[str, str, object]] = [
            ('patch', f'/api/agents/rsforms/{schema_id}/replace', {
                'contract_version': PORTAL_JSON_CONTRACT_VERSION, 'title': 'T', 'alias': 'T',
                'description': '', 'items': [],
            }),
            ('post', f'/api/agents/rsforms/{schema_id}/description', {
                'expected_time_update': self.schema.model.time_update.isoformat(), 'description': 'Changed',
            }),
            ('post', f'/api/agents/rsforms/{schema_id}/publish', {
                'expected_time_update': self.schema.model.time_update.isoformat(),
                'schema': {'contract_version': PORTAL_JSON_CONTRACT_VERSION, 'title': 'T', 'alias': 'LCK',
                           'description': '', 'items': []},
            }),
            ('post', f'/api/agents/rsforms/{schema_id}/constituents', {'alias': 'X9', 'cst_type': CstType.BASE}),
            ('patch', f'/api/agents/rsforms/{schema_id}/constituents/{self.x1.pk}', {'convention': 'changed'}),
            ('post', f'/api/agents/rsforms/{schema_id}/constituents/delete', {'items': [self.x2.pk]}),
            ('post', f'/api/agents/rsforms/{schema_id}/substitute', {
                'substitutions': [{'original': self.x2.pk, 'substitution': self.x1.pk}],
            }),
            ('patch', f'/api/agents/rsforms/{schema_id}/move-cst', {'items': [self.x2.pk], 'move_to': 0}),
            ('post', f'/api/agents/models/{model_id}/set-value',
             [{'target': self.x1.pk, 'type': 'basic', 'data': {'1': 'b'}}]),
            ('post', f'/api/agents/models/{model_id}/clear-values', {'items': [self.x1.pk]}),
            ('post', f'/api/agents/models/{model_id}/reset-all', None),
        ]
        oss_actions = [
            ('patch', 'update-layout'), ('post', 'create-block'), ('patch', 'update-block'),
            ('patch', 'delete-block'), ('patch', 'move-items'), ('post', 'create-schema'),
            ('post', 'import-schema'), ('post', 'clone-schema'), ('post', 'create-replica'),
            ('post', 'create-synthesis'), ('patch', 'update-operation'), ('patch', 'delete-operation'),
            ('patch', 'delete-replica'), ('patch', 'create-input'), ('patch', 'set-input'),
            ('post', 'execute-operation'), ('post', 'relocate-constituents'),
        ]
        routes += [
            (method, f'/api/agents/oss/{oss_id}/{action}', {'target': self.operation.pk})
            for method, action in oss_actions
        ]
        return routes

    @staticmethod
    def _call(client: APIClient, method: str, url: str, data: object):
        if data is None:
            return getattr(client, method)(url)
        return getattr(client, method)(url, data=data, format='json')

    def _assert_all_writes_forbidden(self, client: APIClient, label: str) -> None:
        before = self._snapshot()
        for method, url, data in self._writes():
            with self.subTest(actor=label, method=method, url=url):
                response = self._call(client, method, url, data)
                self.assertEqual(response.status_code, 403, response.data)
        self.assertEqual(self._snapshot(), before)

    def test_owner_key_cannot_change_locked_content(self):
        self._assert_all_writes_forbidden(self._client(self.user), 'owner')

    def test_editor_key_cannot_change_locked_content(self):
        self._assert_all_writes_forbidden(self._client(self.user2), 'editor')

    def test_staff_key_cannot_change_locked_content(self):
        self._assert_all_writes_forbidden(self._client(self.staff), 'staff')

    def test_staff_owner_key_cannot_change_locked_content(self):
        self.toggle_admin(True)
        self._assert_all_writes_forbidden(self._client(self.user), 'staff owner')

    def test_staff_key_still_reads_locked_items(self):
        client = self._client(self.staff)
        for url in (
            f'/api/agents/rsforms/{self.schema.model.pk}/details',
            f'/api/agents/models/{self.model.model.pk}/details',
            f'/api/agents/oss/{self.oss.model.pk}/details',
        ):
            with self.subTest(url=url):
                self.assertEqual(client.get(url).status_code, 200)

    def test_staff_key_writes_after_flag_is_removed_separately(self):
        client = self._client(self.staff)
        create_url = f'/api/agents/rsforms/{self.schema.model.pk}/constituents'
        data = {'alias': 'X9', 'cst_type': CstType.BASE}
        self.assertEqual(client.post(create_url, data=data, format='json').status_code, 403)

        portal = APIClient()
        portal.force_authenticate(user=self.staff)
        unlock = portal.patch(f'/api/library/{self.schema.model.pk}/set-read-only',
                              data={'read_only': False}, format='json')
        self.assertEqual(unlock.status_code, 200)

        self.assertEqual(client.post(create_url, data=data, format='json').status_code, 201)
        self.assertTrue(Constituenta.objects.filter(schema=self.schema.model, alias='X9').exists())

    def test_agent_metadata_changes_do_not_unlock_item(self):
        client = self._client(self.staff)
        response = client.patch(
            f'/api/agents/library/{self.schema.model.pk}/set-access-policy',
            data={'access_policy': AccessPolicy.PUBLIC}, format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.schema.model.refresh_from_db()
        self.assertTrue(self.schema.model.read_only)
        create_url = f'/api/agents/rsforms/{self.schema.model.pk}/constituents'
        data = {'alias': 'X9', 'cst_type': CstType.BASE}
        self.assertEqual(client.post(create_url, data=data, format='json').status_code, 403)
