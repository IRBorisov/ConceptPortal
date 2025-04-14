''' Testing API: Operation Schema - operations manipulation. '''
from apps.library.models import AccessPolicy, Editor, LibraryItem, LibraryItemType
from apps.oss.models import Operation, OperationSchema, OperationType
from apps.rsform.models import Constituenta, RSForm
from shared.EndpointTester import EndpointTester, decl_endpoint


class TestOssOperations(EndpointTester):
    ''' Testing OSS view - Operations. '''


    def setUp(self):
        super().setUp()
        self.owned = OperationSchema.create(title='Test', alias='T1', owner=self.user)
        self.owned_id = self.owned.model.pk
        self.unowned = OperationSchema.create(title='Test2', alias='T2')
        self.unowned_id = self.unowned.model.pk
        self.invalid_id = self.unowned_id + 1337


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
        self.layout_data = {
            'operations': [
                {'id': self.operation1.pk, 'x': 0, 'y': 0},
                {'id': self.operation2.pk, 'x': 0, 'y': 0},
                {'id': self.operation3.pk, 'x': 0, 'y': 0},
            ],
            'blocks': []
        }
        layout = self.owned.layout()
        layout.data = self.layout_data
        layout.save()

        self.owned.set_arguments(self.operation3.pk, [self.operation1, self.operation2])
        self.owned.set_substitutions(self.operation3.pk, [{
            'original': self.ks1X1,
            'substitution': self.ks2X1
        }])


    @decl_endpoint('/api/oss/{item}/create-operation', method='post')
    def test_create_operation(self):
        self.populateData()
        self.executeBadData(item=self.owned_id)

        data = {
            'item_data': {
                'alias': 'Test3',
                'title': 'Test title',
                'description': 'Тест кириллицы',

            },
            'layout': self.layout_data,
            'position_x': 1,
            'position_y': 1

        }
        self.executeBadData(data=data)

        data['item_data']['operation_type'] = 'invalid'
        self.executeBadData(data=data)

        data['item_data']['operation_type'] = OperationType.INPUT
        self.executeNotFound(data=data, item=self.invalid_id)

        response = self.executeCreated(data=data, item=self.owned_id)
        self.assertEqual(len(response.data['oss']['operations']), 4)
        new_operation = response.data['new_operation']
        layout = response.data['oss']['layout']
        item = [item for item in layout['operations'] if item['id'] == new_operation['id']][0]
        self.assertEqual(new_operation['alias'], data['item_data']['alias'])
        self.assertEqual(new_operation['operation_type'], data['item_data']['operation_type'])
        self.assertEqual(new_operation['title'], data['item_data']['title'])
        self.assertEqual(new_operation['description'], data['item_data']['description'])
        self.assertEqual(new_operation['result'], None)
        self.assertEqual(new_operation['parent'], None)
        self.assertEqual(item['x'], data['position_x'])
        self.assertEqual(item['y'], data['position_y'])
        self.operation1.refresh_from_db()

        self.executeForbidden(data=data, item=self.unowned_id)
        self.toggle_admin(True)
        self.executeCreated(data=data, item=self.unowned_id)


    @decl_endpoint('/api/oss/{item}/create-operation', method='post')
    def test_create_operation_parent(self):
        self.populateData()
        data = {
            'item_data': {
                'parent': self.invalid_id,
                'alias': 'Test3',
                'title': 'Test title',
                'description': '',
                'operation_type': OperationType.INPUT

            },
            'layout': self.layout_data,
            'position_x': 1,
            'position_y': 1

        }
        self.executeBadData(data=data, item=self.owned_id)

        block_unowned = self.unowned.create_block(title='TestBlock1')
        data['item_data']['parent'] = block_unowned.id
        self.executeBadData(data=data, item=self.owned_id)

        block_owned = self.owned.create_block(title='TestBlock2')
        data['item_data']['parent'] = block_owned.id
        response = self.executeCreated(data=data, item=self.owned_id)
        self.assertEqual(len(response.data['oss']['operations']), 4)
        new_operation = response.data['new_operation']
        self.assertEqual(new_operation['parent'], block_owned.id)


    @decl_endpoint('/api/oss/{item}/create-operation', method='post')
    def test_create_operation_arguments(self):
        self.populateData()
        data = {
            'item_data': {
                'alias': 'Test4',
                'operation_type': OperationType.SYNTHESIS
            },
            'layout': self.layout_data,
            'position_x': 1,
            'position_y': 1,
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
            'layout': self.layout_data,
            'position_x': 1,
            'position_y': 1
        }
        response = self.executeCreated(data=data, item=self.owned_id)
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
            'layout': self.layout_data,
            'position_x': 1,
            'position_y': 1
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
            'layout': self.layout_data
        }
        self.executeBadData(data=data)

        data['target'] = self.operation1.pk
        self.toggle_admin(True)
        self.executeBadData(data=data, item=self.unowned_id)
        self.logout()
        self.executeForbidden(data=data, item=self.owned_id)

        self.login()
        response = self.executeOK(data=data)
        layout = response.data['layout']
        deleted_items = [item for item in layout['operations'] if item['id'] == data['target']]
        self.assertEqual(len(response.data['operations']), 2)
        self.assertEqual(len(deleted_items), 0)


    @decl_endpoint('/api/oss/{item}/create-input', method='patch')
    def test_create_input(self):
        self.populateData()
        self.executeBadData(item=self.owned_id)

        data = {
            'layout': self.layout_data
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
            'layout': self.layout_data
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
            'layout': self.layout_data,
            'target': self.operation1.pk,
            'input': self.ks2.model.pk
        }
        self.executeBadData(data=data, item=self.owned_id)

        self.ks2.model.visible = False
        self.ks2.model.save(update_fields=['visible'])
        data = {
            'layout': self.layout_data,
            'target': self.operation2.pk,
            'input': None
        }
        self.executeOK(data=data, item=self.owned_id)
        self.operation2.refresh_from_db()
        self.ks2.model.refresh_from_db()
        self.assertEqual(self.operation2.result, None)
        self.assertEqual(self.ks2.model.visible, True)

        data = {
            'layout': self.layout_data,
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
            'layout': self.layout_data,
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
            'layout': self.layout_data
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
            'layout': self.layout_data,
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
            'layout': self.layout_data,
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
