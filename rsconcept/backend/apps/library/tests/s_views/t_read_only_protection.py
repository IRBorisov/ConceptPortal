''' Regression: ``read_only`` blocks every content change of the Portal API, for admins too. '''
from apps.library.models import AccessPolicy, Editor, LibraryItem, Version
from apps.oss.models import Block, Operation, OperationSchema, OperationType
from apps.rsform.models import Constituenta, CstType, RSForm
from apps.rsform.serializers import RSFormSerializer
from apps.rsmodel.models import ConstituentData, RSModel
from apps.users.models import User
from shared.EndpointTester import EndpointTester


class TestReadOnlyProtection(EndpointTester):
    ''' Locked items reject owner, editor and staff writes until the flag is removed separately. '''

    def setUp(self):
        super().setUp()
        self.staff = User.objects.create(username='StaffTest', email='staff@test.com', password='password',
                                         is_staff=True)
        self.schema = RSForm.create(
            title='Locked', alias='LCK', owner=self.user, access_policy=AccessPolicy.PROTECTED,
        )
        self.x1 = self.schema.insert_last('X1')
        self.x2 = self.schema.insert_last('X2', cst_type=CstType.BASE)
        self.model = RSModel.create(
            self.schema.model, title='Locked model', alias='LCKM',
            owner=self.user, access_policy=AccessPolicy.PROTECTED,
        )
        ConstituentData.objects.create(model=self.model.model, constituent=self.x1, type='basic', data={'1': 'a'})
        self.oss = OperationSchema.create(
            title='Locked OSS', alias='LCKO', owner=self.user, access_policy=AccessPolicy.PROTECTED,
        )
        self.operation = self.oss.create_operation(alias='1', operation_type=OperationType.INPUT)
        self.block = self.oss.create_block(title='B1')
        data = RSFormSerializer(self.schema.model).to_versioned_data()
        self.version = self.schema.create_version(version='1.0', description='', data=data)

        self.items = [self.schema.model, self.model.model, self.oss.model]
        for item in self.items:
            Editor.add(item.pk, self.user2.pk)
            item.read_only = True
            item.save(update_fields=['read_only'])

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
        schema_id = self.schema.model.pk
        model_id = self.model.model.pk
        oss_id = self.oss.model.pk
        cst = {'target': self.x1.pk, 'item_data': {'convention': 'changed'}}
        rsform_routes: list[tuple[str, str, object]] = [
            ('patch', f'/api/library/{schema_id}', {'title': 'Changed'}),
            ('patch', f'/api/library/{model_id}', {'title': 'Changed'}),
            ('patch', f'/api/library/{oss_id}', {'title': 'Changed'}),
            ('patch', f'/api/rsforms/{schema_id}/load-json', {}),
            ('patch', f'/api/rsforms/{schema_id}/load-trs', {}),
            ('post', f'/api/rsforms/{schema_id}/create-cst', {'alias': 'X9', 'cst_type': CstType.BASE}),
            ('post', f'/api/rsforms/{schema_id}/create-multiple-cst', {}),
            ('patch', f'/api/rsforms/{schema_id}/update-cst', cst),
            ('patch', f'/api/rsforms/{schema_id}/update-crucial', cst),
            ('patch', f'/api/rsforms/{schema_id}/move-cst', {'items': [self.x2.pk], 'move_to': 0}),
            ('patch', f'/api/rsforms/{schema_id}/delete-multiple-cst', {'items': [self.x2.pk]}),
            ('patch', f'/api/rsforms/{schema_id}/substitute', {'substitutions': []}),
            ('patch', f'/api/rsforms/{schema_id}/restore-order', {}),
            ('patch', f'/api/rsforms/{schema_id}/reset-aliases', {}),
            ('post', f'/api/rsforms/{schema_id}/create-attribution', {}),
            ('patch', f'/api/rsforms/{schema_id}/delete-attribution', {}),
            ('patch', f'/api/rsforms/{schema_id}/clear-attributions', {}),
            ('patch', f'/api/versions/{self.version.pk}', {'version': '2.0'}),
            ('delete', f'/api/versions/{self.version.pk}', None),
            ('patch', f'/api/versions/{self.version.pk}/restore', None),
        ]
        model_routes: list[tuple[str, str, object]] = [
            ('patch', f'/api/models/{model_id}/load-json', {}),
            ('post', f'/api/models/{model_id}/set-value', [{'target': self.x1.pk, 'type': 'basic', 'data': {'1': 'b'}}]),
            ('post', f'/api/models/{model_id}/clear-values', {'items': [self.x1.pk]}),
            ('post', f'/api/models/{model_id}/reset-all', None),
        ]
        oss_actions = [
            ('patch', 'update-layout'), ('post', 'create-block'), ('patch', 'update-block'),
            ('patch', 'delete-block'), ('patch', 'move-items'), ('post', 'create-schema'),
            ('post', 'clone-schema'), ('post', 'import-schema'), ('post', 'create-replica'),
            ('post', 'create-synthesis'), ('patch', 'update-operation'), ('patch', 'delete-operation'),
            ('patch', 'delete-replica'), ('patch', 'create-input'), ('patch', 'set-input'),
            ('post', 'execute-operation'), ('post', 'relocate-constituents'),
        ]
        oss_routes: list[tuple[str, str, object]] = [
            (method, f'/api/oss/{oss_id}/{action}', {'target': self.operation.pk})
            for method, action in oss_actions
        ]
        inline = ('patch', '/api/rsforms/inline-synthesis', {
            'receiver': schema_id, 'source': schema_id, 'items': [], 'substitutions': [],
        })
        return rsform_routes + model_routes + oss_routes + [inline]

    def _call(self, method: str, url: str, data: object):
        if data is None:
            return getattr(self.client, method)(url)
        return getattr(self.client, method)(url, data=data, format='json')

    def _assert_all_writes_forbidden(self, label: str) -> None:
        before = self._snapshot()
        for method, url, data in self._writes():
            with self.subTest(actor=label, method=method, url=url):
                response = self._call(method, url, data)
                self.assertEqual(response.status_code, 403, response.data)
        self.assertEqual(self._snapshot(), before)

    def test_owner_cannot_change_locked_content(self):
        self._assert_all_writes_forbidden('owner')

    def test_editor_cannot_change_locked_content(self):
        self.login2()
        self._assert_all_writes_forbidden('editor')

    def test_admin_cannot_change_locked_content(self):
        self.client.force_authenticate(user=self.staff)
        self._assert_all_writes_forbidden('admin')

    def test_admin_owner_cannot_change_locked_content(self):
        self.toggle_admin(True)
        self._assert_all_writes_forbidden('admin owner')

    def test_admin_still_reads_locked_items(self):
        self.client.force_authenticate(user=self.staff)
        for url in (
            f'/api/library/{self.schema.model.pk}',
            f'/api/rsforms/{self.schema.model.pk}/details',
            f'/api/models/{self.model.model.pk}/details',
            f'/api/oss/{self.oss.model.pk}/details',
        ):
            with self.subTest(url=url):
                self.assertEqual(self.client.get(url).status_code, 200)

    def test_flag_is_removed_by_separate_change_before_content_change(self):
        self.client.force_authenticate(user=self.staff)
        item_url = f'/api/library/{self.schema.model.pk}'
        create_url = f'/api/rsforms/{self.schema.model.pk}/create-cst'
        create_data = {'alias': 'X9', 'cst_type': CstType.BASE}

        self.assertEqual(self.client.patch(item_url, data={'title': 'Changed'}, format='json').status_code, 403)
        self.assertEqual(self.client.post(create_url, data=create_data, format='json').status_code, 403)
        self.assertEqual(self.client.patch(item_url, data={'title': 'Changed', 'read_only': False},
                                           format='json').status_code, 403)
        self.schema.model.refresh_from_db()
        self.assertTrue(self.schema.model.read_only)
        self.assertEqual(self.schema.model.title, 'Locked')

        unlock = self.client.patch(f'{item_url}/set-read-only', data={'read_only': False}, format='json')
        self.assertEqual(unlock.status_code, 200)
        self.schema.model.refresh_from_db()
        self.assertFalse(self.schema.model.read_only)
        self.assertEqual(self.schema.model.title, 'Locked')

        self.assertEqual(self.client.patch(item_url, data={'title': 'Changed'}, format='json').status_code, 200)
        self.assertEqual(self.client.post(create_url, data=create_data, format='json').status_code, 201)

    def test_unlocked_editor_and_owner_can_write_again(self):
        for item in self.items:
            LibraryItem.objects.filter(pk=item.pk).update(read_only=False)
        schema_id = self.schema.model.pk
        model_id = self.model.model.pk
        oss_id = self.oss.model.pk
        set_value = ('post', f'/api/models/{model_id}/set-value',
                     [{'target': self.x1.pk, 'type': 'basic', 'data': {'1': 'b'}}])
        create_block = ('post', f'/api/oss/{oss_id}/create-block', {
            'item_data': {'title': 'New', 'description': ''},
            'layout': [],
            'position': {'x': 0, 'y': 0, 'width': 0.4, 'height': 0.4},
            'children_operations': [],
            'children_blocks': [],
        })
        rename = ('patch', f'/api/library/{schema_id}', {'title': 'Changed'})
        for index, actor in enumerate((self.user, self.user2, self.staff)):
            self.client.force_authenticate(user=actor)
            create_cst = ('post', f'/api/rsforms/{schema_id}/create-cst',
                          {'alias': f'X{index + 10}', 'cst_type': CstType.BASE})
            for method, url, data in (create_cst, set_value, create_block, rename):
                with self.subTest(actor=actor.username, url=url):
                    response = self._call(method, url, data)
                    self.assertIn(response.status_code, (200, 201), response.data)

    def test_staff_metadata_changes_do_not_require_unlock(self):
        self.client.force_authenticate(user=self.staff)
        item_id = self.schema.model.pk
        response = self.client.patch(
            f'/api/library/{item_id}/set-access-policy',
            data={'access_policy': AccessPolicy.PUBLIC}, format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.schema.model.refresh_from_db()
        self.assertEqual(self.schema.model.access_policy, AccessPolicy.PUBLIC)
        self.assertTrue(self.schema.model.read_only)
