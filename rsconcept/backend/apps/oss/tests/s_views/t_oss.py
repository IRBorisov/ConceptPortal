''' Testing API: Operation Schema. '''
from apps.library.models import AccessPolicy, Editor, LibraryItem, LibraryItemType
from apps.oss.models import Operation, OperationSchema, OperationType
from apps.rsform.models import Constituenta, RSForm
from shared.EndpointTester import EndpointTester, decl_endpoint


class TestOssViewset(EndpointTester):
    ''' Testing OSS view. '''

    def setUp(self):
        super().setUp()
        self.owned = OperationSchema.create(title='Test', alias='T1', owner=self.user)
        self.owned_id = self.owned.model.pk
        self.unowned = OperationSchema.create(title='Test2', alias='T2')
        self.unowned_id = self.unowned.model.pk
        self.private = OperationSchema.create(title='Test2', alias='T2', access_policy=AccessPolicy.PRIVATE)
        self.private_id = self.private.model.pk
        self.invalid_id = self.private.model.pk + 1337

    def populateData(self):
        self.ks1 = RSForm.create(
            alias='KS1',
            title='Test1',
            owner=self.user
        )
        self.ks1X1 = self.ks1.insert_new(
            'X1',
            term_raw='X1_1',
            term_resolved='X1_1'
        )
        self.ks2 = RSForm.create(
            alias='KS2',
            title='Test2',
            owner=self.user
        )
        self.ks2X1 = self.ks2.insert_new(
            'X2',
            term_raw='X1_2',
            term_resolved='X1_2'
        )

        self.operation1 = self.owned.create_operation(
            alias='1',
            operation_type=OperationType.INPUT,
            result=self.ks1.model
        )
        self.operation2 = self.owned.create_operation(
            alias='2',
            operation_type=OperationType.INPUT,
            result=self.ks2.model
        )
        self.operation3 = self.owned.create_operation(
            alias='3',
            operation_type=OperationType.SYNTHESIS
        )
        self.owned.set_arguments(self.operation3.pk, [self.operation1, self.operation2])
        self.owned.set_substitutions(self.operation3.pk, [{
            'original': self.ks1X1,
            'substitution': self.ks2X1
        }])

    @decl_endpoint('/api/oss/{item}/details', method='get')
    def test_details(self):
        self.populateData()

        response = self.executeOK(item=self.owned_id)
        self.assertEqual(response.data['owner'], self.owned.model.owner.pk)
        self.assertEqual(response.data['title'], self.owned.model.title)
        self.assertEqual(response.data['alias'], self.owned.model.alias)
        self.assertEqual(response.data['location'], self.owned.model.location)
        self.assertEqual(response.data['access_policy'], self.owned.model.access_policy)
        self.assertEqual(response.data['visible'], self.owned.model.visible)

        self.assertEqual(response.data['item_type'], LibraryItemType.OPERATION_SCHEMA)

        self.assertEqual(len(response.data['items']), 3)
        self.assertEqual(response.data['items'][0]['id'], self.operation1.pk)
        self.assertEqual(response.data['items'][0]['operation_type'], self.operation1.operation_type)

        self.assertEqual(len(response.data['substitutions']), 1)
        sub = response.data['substitutions'][0]
        self.assertEqual(sub['operation'], self.operation3.pk)
        self.assertEqual(sub['original'], self.ks1X1.pk)
        self.assertEqual(sub['substitution'], self.ks2X1.pk)
        self.assertEqual(sub['original_alias'], self.ks1X1.alias)
        self.assertEqual(sub['original_term'], self.ks1X1.term_resolved)
        self.assertEqual(sub['substitution_alias'], self.ks2X1.alias)
        self.assertEqual(sub['substitution_term'], self.ks2X1.term_resolved)

        arguments = response.data['arguments']
        self.assertEqual(len(arguments), 2)
        self.assertEqual(arguments[0]['operation'], self.operation3.pk)
        self.assertEqual(arguments[0]['argument'], self.operation1.pk)
        self.assertEqual(arguments[1]['operation'], self.operation3.pk)
        self.assertEqual(arguments[1]['argument'], self.operation2.pk)

        self.executeOK(item=self.unowned_id)
        self.executeForbidden(item=self.private_id)

        self.logout()
        self.executeOK(item=self.owned_id)
        self.executeOK(item=self.unowned_id)
        self.executeForbidden(item=self.private_id)

    @decl_endpoint('/api/oss/{item}/update-positions', method='patch')
    def test_update_positions(self):
        self.populateData()
        self.executeBadData(item=self.owned_id)

        data = {'positions': []}
        self.executeOK(data=data)

        data = {'positions': [
            {'id': self.operation1.pk, 'position_x': 42.1, 'position_y': 1337},
            {'id': self.operation2.pk, 'position_x': 36.1, 'position_y': 1437},
            {'id': self.invalid_id, 'position_x': 31, 'position_y': 12},
        ]}
        self.toggle_admin(True)
        self.executeOK(data=data, item=self.unowned_id)
        self.operation1.refresh_from_db()
        self.assertNotEqual(self.operation1.position_x, data['positions'][0]['position_x'])
        self.assertNotEqual(self.operation1.position_y, data['positions'][0]['position_y'])

        self.toggle_admin(False)
        self.executeOK(data=data, item=self.owned_id)
        self.operation1.refresh_from_db()
        self.operation2.refresh_from_db()
        self.assertEqual(self.operation1.position_x, data['positions'][0]['position_x'])
        self.assertEqual(self.operation1.position_y, data['positions'][0]['position_y'])
        self.assertEqual(self.operation2.position_x, data['positions'][1]['position_x'])
        self.assertEqual(self.operation2.position_y, data['positions'][1]['position_y'])

        self.executeForbidden(data=data, item=self.unowned_id)
        self.executeForbidden(data=data, item=self.private_id)

    @decl_endpoint('/api/oss/{item}/create-operation', method='post')
    def test_create_operation(self):
        self.populateData()
        self.executeBadData(item=self.owned_id)

        data = {
            'item_data': {
                'alias': 'Test3',
                'title': 'Test title',
                'description': 'Тест кириллицы',
                'position_x': 1,
                'position_y': 1,
            },
            'positions': [
                {'id': self.operation1.pk, 'position_x': 42.1, 'position_y': 1337}
            ]
        }
        self.executeBadData(data=data)

        data['item_data']['operation_type'] = 'invalid'
        self.executeBadData(data=data)

        data['item_data']['operation_type'] = OperationType.INPUT
        self.executeNotFound(data=data, item=self.invalid_id)

        response = self.executeCreated(data=data, item=self.owned_id)
        self.assertEqual(len(response.data['oss']['items']), 4)
        new_operation = response.data['new_operation']
        self.assertEqual(new_operation['alias'], data['item_data']['alias'])
        self.assertEqual(new_operation['operation_type'], data['item_data']['operation_type'])
        self.assertEqual(new_operation['title'], data['item_data']['title'])
        self.assertEqual(new_operation['description'], data['item_data']['description'])
        self.assertEqual(new_operation['position_x'], data['item_data']['position_x'])
        self.assertEqual(new_operation['position_y'], data['item_data']['position_y'])
        self.assertEqual(new_operation['result'], None)
        self.operation1.refresh_from_db()
        self.assertEqual(self.operation1.position_x, data['positions'][0]['position_x'])
        self.assertEqual(self.operation1.position_y, data['positions'][0]['position_y'])

        self.executeForbidden(data=data, item=self.unowned_id)
        self.toggle_admin(True)
        self.executeCreated(data=data, item=self.unowned_id)

    @decl_endpoint('/api/oss/{item}/create-operation', method='post')
    def test_create_operation_arguments(self):
        self.populateData()
        data = {
            'item_data': {
                'alias': 'Test4',
                'operation_type': OperationType.SYNTHESIS
            },
            'positions': [],
            'arguments': [self.operation1.pk, self.operation3.pk]
        }
        response = self.executeCreated(data=data, item=self.owned_id)
        self.owned.refresh_from_db()
        new_operation = response.data['new_operation']
        arguments = self.owned.arguments()
        self.assertTrue(arguments.filter(operation__id=new_operation['id'], argument=self.operation1))
        self.assertTrue(arguments.filter(operation__id=new_operation['id'], argument=self.operation3))

    @decl_endpoint('/api/oss/{item}/create-operation', method='post')
    def test_create_operation_result(self):
        self.populateData()

        self.operation1.result = None
        self.operation1.save()

        data = {
            'item_data': {
                'alias': 'Test4',
                'operation_type': OperationType.INPUT,
                'result': self.ks1.model.pk
            },
            'positions': [],
        }
        response = self.executeCreated(data=data, item=self.owned_id)
        self.owned.refresh_from_db()
        new_operation = response.data['new_operation']
        self.assertEqual(new_operation['result'], self.ks1.model.pk)

    @decl_endpoint('/api/oss/{item}/create-operation', method='post')
    def test_create_operation_schema(self):
        self.populateData()
        Editor.add(self.owned.model.pk, self.user2.pk)
        data = {
            'item_data': {
                'alias': 'Test4',
                'title': 'Test title',
                'description': 'Comment',
                'operation_type': OperationType.INPUT,
                'result': self.ks1.model.pk
            },
            'create_schema': True,
            'positions': [],
        }
        self.executeBadData(data=data, item=self.owned_id)
        data['item_data']['result'] = None
        response = self.executeCreated(data=data, item=self.owned_id)
        self.owned.refresh_from_db()
        new_operation = response.data['new_operation']
        schema = LibraryItem.objects.get(pk=new_operation['result'])
        self.assertEqual(schema.alias, data['item_data']['alias'])
        self.assertEqual(schema.title, data['item_data']['title'])
        self.assertEqual(schema.description, data['item_data']['description'])
        self.assertEqual(schema.visible, False)
        self.assertEqual(schema.access_policy, self.owned.model.access_policy)
        self.assertEqual(schema.location, self.owned.model.location)
        self.assertIn(self.user2, schema.getQ_editors())

    @decl_endpoint('/api/oss/{item}/delete-operation', method='patch')
    def test_delete_operation(self):
        self.executeNotFound(item=self.invalid_id)

        self.populateData()
        self.executeBadData(item=self.owned_id)

        data = {
            'positions': []
        }
        self.executeBadData(data=data)

        data['target'] = self.operation1.pk
        self.toggle_admin(True)
        self.executeBadData(data=data, item=self.unowned_id)
        self.logout()
        self.executeForbidden(data=data, item=self.owned_id)

        self.login()
        response = self.executeOK(data=data)
        self.assertEqual(len(response.data['items']), 2)

    @decl_endpoint('/api/oss/{item}/create-input', method='patch')
    def test_create_input(self):
        self.populateData()
        self.executeBadData(item=self.owned_id)

        data = {
            'positions': []
        }
        self.executeBadData(data=data)

        data['target'] = self.operation1.pk
        self.toggle_admin(True)
        self.executeBadData(data=data, item=self.unowned_id)
        self.logout()
        self.executeForbidden(data=data, item=self.owned_id)

        self.login()
        self.executeBadData(data=data, item=self.owned_id)

        self.operation1.result = None
        self.operation1.description = 'TestComment'
        self.operation1.title = 'TestTitle'
        self.operation1.save()
        response = self.executeOK(data=data)
        self.operation1.refresh_from_db()

        new_schema = response.data['new_schema']
        self.assertEqual(new_schema['id'], self.operation1.result.pk)
        self.assertEqual(new_schema['alias'], self.operation1.alias)
        self.assertEqual(new_schema['title'], self.operation1.title)
        self.assertEqual(new_schema['description'], self.operation1.description)

        data['target'] = self.operation3.pk
        self.executeBadData(data=data)

    @decl_endpoint('/api/oss/{item}/set-input', method='patch')
    def test_set_input_null(self):
        self.populateData()
        self.executeBadData(item=self.owned_id)

        data = {
            'positions': []
        }
        self.executeBadData(data=data)

        data['target'] = self.operation1.pk
        data['input'] = None
        self.toggle_admin(True)
        self.executeBadData(data=data, item=self.unowned_id)
        self.logout()
        self.executeForbidden(data=data, item=self.owned_id)

        self.login()
        response = self.executeOK(data=data)
        self.operation1.refresh_from_db()
        self.assertEqual(self.operation1.result, None)

        data['input'] = self.ks1.model.pk
        self.ks1.model.alias = 'Test42'
        self.ks1.model.title = 'Test421'
        self.ks1.model.description = 'TestComment42'
        self.ks1.save()
        response = self.executeOK(data=data)
        self.operation1.refresh_from_db()
        self.assertEqual(self.operation1.result, self.ks1.model)
        self.assertEqual(self.operation1.alias, self.ks1.model.alias)
        self.assertEqual(self.operation1.title, self.ks1.model.title)
        self.assertEqual(self.operation1.description, self.ks1.model.description)

    @decl_endpoint('/api/oss/{item}/set-input', method='patch')
    def test_set_input_change_schema(self):
        self.populateData()
        self.operation2.result = None

        data = {
            'positions': [],
            'target': self.operation1.pk,
            'input': self.ks2.model.pk
        }
        self.executeBadData(data=data, item=self.owned_id)

        self.ks2.model.visible = False
        self.ks2.model.save(update_fields=['visible'])
        data = {
            'positions': [],
            'target': self.operation2.pk,
            'input': None
        }
        self.executeOK(data=data, item=self.owned_id)
        self.operation2.refresh_from_db()
        self.ks2.model.refresh_from_db()
        self.assertEqual(self.operation2.result, None)
        self.assertEqual(self.ks2.model.visible, True)

        data = {
            'positions': [],
            'target': self.operation1.pk,
            'input': self.ks2.model.pk
        }
        self.executeOK(data=data, item=self.owned_id)
        self.operation1.refresh_from_db()
        self.assertEqual(self.operation1.result, self.ks2.model)

    @decl_endpoint('/api/oss/{item}/update-operation', method='patch')
    def test_update_operation(self):
        self.populateData()
        self.executeBadData(item=self.owned_id)

        ks3 = RSForm.create(alias='KS3', title='Test3', owner=self.user)
        ks3x1 = ks3.insert_new('X1', term_resolved='X1_1')

        data = {
            'target': self.operation3.pk,
            'item_data': {
                'alias': 'Test3 mod',
                'title': 'Test title mod',
                'description': 'Comment mod'
            },
            'positions': [],
            'arguments': [self.operation2.pk, self.operation1.pk],
            'substitutions': [
                {
                    'original': self.ks1X1.pk,
                    'substitution': ks3x1.pk
                }
            ]
        }
        self.executeBadData(data=data)

        data['substitutions'][0]['substitution'] = self.ks2X1.pk
        self.toggle_admin(True)
        self.executeBadData(data=data, item=self.unowned_id)
        self.logout()
        self.executeForbidden(data=data, item=self.owned_id)

        self.login()
        response = self.executeOK(data=data)
        self.operation3.refresh_from_db()
        self.assertEqual(self.operation3.alias, data['item_data']['alias'])
        self.assertEqual(self.operation3.title, data['item_data']['title'])
        self.assertEqual(self.operation3.description, data['item_data']['description'])
        args = self.operation3.getQ_arguments().order_by('order')
        self.assertEqual(args[0].argument.pk, data['arguments'][0])
        self.assertEqual(args[0].order, 0)
        self.assertEqual(args[1].argument.pk, data['arguments'][1])
        self.assertEqual(args[1].order, 1)
        sub = self.operation3.getQ_substitutions()[0]
        self.assertEqual(sub.original.pk, data['substitutions'][0]['original'])
        self.assertEqual(sub.substitution.pk, data['substitutions'][0]['substitution'])

    @decl_endpoint('/api/oss/{item}/update-operation', method='patch')
    def test_update_operation_sync(self):
        self.populateData()
        self.executeBadData(item=self.owned_id)

        data = {
            'target': self.operation1.pk,
            'item_data': {
                'alias': 'Test3 mod',
                'title': 'Test title mod',
                'description': 'Comment mod'
            },
            'positions': [],
        }

        response = self.executeOK(data=data)
        self.operation1.refresh_from_db()
        self.assertEqual(self.operation1.alias, data['item_data']['alias'])
        self.assertEqual(self.operation1.title, data['item_data']['title'])
        self.assertEqual(self.operation1.description, data['item_data']['description'])
        self.assertEqual(self.operation1.result.alias, data['item_data']['alias'])
        self.assertEqual(self.operation1.result.title, data['item_data']['title'])
        self.assertEqual(self.operation1.result.description, data['item_data']['description'])

    @decl_endpoint('/api/oss/{item}/update-operation', method='patch')
    def test_update_operation_invalid_substitution(self):
        self.populateData()

        self.ks1X2 = self.ks1.insert_new('X2')

        data = {
            'target': self.operation3.pk,
            'item_data': {
                'alias': 'Test3 mod',
                'title': 'Test title mod',
                'description': 'Comment mod'
            },
            'positions': [],
            'arguments': [self.operation1.pk, self.operation2.pk],
            'substitutions': [
                {
                    'original': self.ks1X1.pk,
                    'substitution': self.ks2X1.pk
                },
                {
                    'original': self.ks2X1.pk,
                    'substitution': self.ks1X2.pk
                }
            ]
        }
        self.executeBadData(data=data, item=self.owned_id)

    @decl_endpoint('/api/oss/{item}/execute-operation', method='post')
    def test_execute_operation(self):
        self.populateData()
        self.executeBadData(item=self.owned_id)

        data = {
            'positions': [],
            'target': self.operation1.pk
        }
        self.executeBadData(data=data)

        data['target'] = self.operation3.pk
        self.toggle_admin(True)
        self.executeBadData(data=data, item=self.unowned_id)
        self.logout()
        self.executeForbidden(data=data, item=self.owned_id)

        self.login()
        self.executeOK(data=data)
        self.operation3.refresh_from_db()
        schema = self.operation3.result
        self.assertEqual(schema.alias, self.operation3.alias)
        self.assertEqual(schema.description, self.operation3.description)
        self.assertEqual(schema.title, self.operation3.title)
        self.assertEqual(schema.visible, False)
        items = list(RSForm(schema).constituents())
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0].alias, 'X1')
        self.assertEqual(items[0].term_resolved, self.ks2X1.term_resolved)

    @decl_endpoint('/api/oss/get-predecessor', method='post')
    def test_get_predecessor(self):
        self.populateData()
        self.ks1X2 = self.ks1.insert_new('X2')

        self.owned.execute_operation(self.operation3)
        self.operation3.refresh_from_db()
        self.ks3 = RSForm(self.operation3.result)
        self.ks3X2 = Constituenta.objects.get(as_child__parent_id=self.ks1X2.pk)

        self.executeBadData(data={'target': self.invalid_id})

        response = self.executeOK(data={'target': self.ks1X1.pk})
        self.assertEqual(response.data['id'], self.ks1X1.pk)
        self.assertEqual(response.data['schema'], self.ks1.model.pk)

        response = self.executeOK(data={'target': self.ks3X2.pk})
        self.assertEqual(response.data['id'], self.ks1X2.pk)
        self.assertEqual(response.data['schema'], self.ks1.model.pk)

    @decl_endpoint('/api/oss/relocate-constituents', method='post')
    def test_relocate_constituents(self):
        self.populateData()
        self.ks1X2 = self.ks1.insert_new('X2', convention='test')

        self.owned.execute_operation(self.operation3)
        self.operation3.refresh_from_db()
        self.ks3 = RSForm(self.operation3.result)
        self.ks3X2 = Constituenta.objects.get(as_child__parent_id=self.ks1X2.pk)
        self.ks3X10 = self.ks3.insert_new('X10', convention='test2')

        # invalid destination
        data = {
            'destination': self.invalid_id,
            'items': []
        }
        self.executeBadData(data=data)

        # empty items
        data = {
            'destination': self.ks1.model.pk,
            'items': []
        }
        self.executeBadData(data=data)

        # source == destination
        data = {
            'destination': self.ks1.model.pk,
            'items': [self.ks1X1.pk]
        }
        self.executeBadData(data=data)

        # moving inherited
        data = {
            'destination': self.ks1.model.pk,
            'items': [self.ks3X2.pk]
        }
        self.executeBadData(data=data)

        # source and destination are not connected
        data = {
            'destination': self.ks2.model.pk,
            'items': [self.ks1X1.pk]
        }
        self.executeBadData(data=data)

        data = {
            'destination': self.ks3.model.pk,
            'items': [self.ks1X2.pk]
        }
        self.ks3X2.refresh_from_db()
        self.assertEqual(self.ks3X2.convention, 'test')
        self.executeOK(data=data)
        self.assertFalse(Constituenta.objects.filter(as_child__parent_id=self.ks1X2.pk).exists())

        data = {
            'destination': self.ks1.model.pk,
            'items': [self.ks3X10.pk]
        }
        self.executeOK(data=data)
        self.assertTrue(Constituenta.objects.filter(as_parent__child_id=self.ks3X10.pk).exists())
        self.ks1X3 = Constituenta.objects.get(as_parent__child_id=self.ks3X10.pk)
        self.assertEqual(self.ks1X3.convention, 'test2')
