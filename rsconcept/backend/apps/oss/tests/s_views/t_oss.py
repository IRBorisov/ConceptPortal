''' Testing API: Operation Schema. '''

from rest_framework import status

from apps.library.models import AccessPolicy, LibraryItem, LibraryItemType, LocationHead
from apps.oss.models import Operation, OperationSchema, OperationType
from apps.rsform.models import RSForm
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
        self.ks1 = RSForm.create(alias='KS1', title='Test1', owner=self.user)
        self.ks1x1 = self.ks1.insert_new('X1', term_resolved='X1_1')
        self.ks2 = RSForm.create(alias='KS2', title='Test2', owner=self.user)
        self.ks2x1 = self.ks2.insert_new('X2', term_resolved='X1_2')
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
        self.owned.add_argument(self.operation3, self.operation1)
        self.owned.add_argument(self.operation3, self.operation2)
        self.owned.set_substitutions(self.operation3, [{
            'original': self.ks1x1,
            'substitution': self.ks2x1,
            'transfer_term': False
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
        self.assertEqual(sub['original'], self.ks1x1.pk)
        self.assertEqual(sub['substitution'], self.ks2x1.pk)
        self.assertEqual(sub['transfer_term'], False)
        self.assertEqual(sub['original_alias'], self.ks1x1.alias)
        self.assertEqual(sub['original_term'], self.ks1x1.term_resolved)
        self.assertEqual(sub['substitution_alias'], self.ks2x1.alias)
        self.assertEqual(sub['substitution_term'], self.ks2x1.term_resolved)

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
                'comment': 'Тест кириллицы',
                'sync_text': False,
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
        self.assertEqual(new_operation['comment'], data['item_data']['comment'])
        self.assertEqual(new_operation['position_x'], data['item_data']['position_x'])
        self.assertEqual(new_operation['position_y'], data['item_data']['position_y'])
        self.assertEqual(new_operation['sync_text'], data['item_data']['sync_text'])
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
        data = {
            'item_data': {
                'alias': 'Test4',
                'title': 'Test title',
                'comment': 'Comment',
                'operation_type': OperationType.INPUT
            },
            'create_schema': True,
            'positions': [],
        }
        response = self.executeCreated(data=data, item=self.owned_id)
        self.owned.refresh_from_db()
        new_operation = response.data['new_operation']
        schema = LibraryItem.objects.get(pk=new_operation['result'])
        self.assertEqual(schema.alias, data['item_data']['alias'])
        self.assertEqual(schema.title, data['item_data']['title'])
        self.assertEqual(schema.comment, data['item_data']['comment'])
        self.assertEqual(schema.visible, False)
        self.assertEqual(schema.access_policy, self.owned.model.access_policy)
        self.assertEqual(schema.location, self.owned.model.location)

    @decl_endpoint('/api/oss/{item}/create-operation', method='post')
    def test_create_operation_result(self):
        self.populateData()

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
