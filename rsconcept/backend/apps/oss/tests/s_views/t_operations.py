''' Testing API: Operation Schema - operations manipulation. '''
from apps.library.models import AccessPolicy, Editor, LibraryItem, LibraryItemType
from apps.oss.models import Argument, Operation, OperationSchema, OperationType, Replica
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
        self.ks1X1 = self.ks1.insert_last(
            'X1',
            term_raw='X1_1',
            term_resolved='X1_1'
        )
        self.ks2 = RSForm.create(
            alias='KS2',
            title='Test2',
            owner=self.user
        )
        self.ks2X1 = self.ks2.insert_last(
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
        self.unowned_operation = self.unowned.create_operation(
            alias='42',
            operation_type=OperationType.INPUT,
            result=None
        )
        self.layout_data = [
            {'nodeID': 'o' + str(self.operation1.pk), 'x': 0, 'y': 0, 'width': 150, 'height': 40},
            {'nodeID': 'o' + str(self.operation2.pk), 'x': 0, 'y': 0, 'width': 150, 'height': 40},
            {'nodeID': 'o' + str(self.operation3.pk), 'x': 0, 'y': 0, 'width': 150, 'height': 40},
        ]
        layout = OperationSchema.layoutQ(self.owned_id)
        layout.data = self.layout_data
        layout.save()

        self.owned.set_arguments(self.operation3.pk, [self.operation1, self.operation2])
        self.owned.set_substitutions(self.operation3.pk, [{
            'original': self.ks1X1,
            'substitution': self.ks2X1
        }])

    @decl_endpoint('/api/oss/{item}/create-schema', method='post')
    def test_create_schema(self):
        self.populateData()
        Editor.add(self.owned.model.pk, self.user2.pk)
        self.executeBadData(item=self.owned_id)

        data = {
            'item_data': {
                'alias': 'Test3',
                'title': 'Test title',
                'description': 'Тест кириллицы',
                'parent': None
            },
            'layout': self.layout_data,
            'position': {
                'x': 1,
                'y': 1,
                'width': 500,
                'height': 50
            }
        }
        self.executeNotFound(data=data, item=self.invalid_id)

        response = self.executeCreated(data=data, item=self.owned_id)
        self.assertEqual(len(response.data['oss']['operations']), 4)
        new_operation_id = response.data['new_operation']
        new_operation = next(op for op in response.data['oss']['operations'] if op['id'] == new_operation_id)
        layout = response.data['oss']['layout']
        operation_node = [item for item in layout if item['nodeID'] == 'o' + str(new_operation_id)][0]
        schema = LibraryItem.objects.get(pk=new_operation['result'])
        self.assertEqual(new_operation['alias'], data['item_data']['alias'])
        self.assertEqual(new_operation['operation_type'], OperationType.INPUT)
        self.assertEqual(new_operation['title'], data['item_data']['title'])
        self.assertEqual(new_operation['description'], data['item_data']['description'])
        self.assertEqual(new_operation['parent'], None)
        self.assertNotEqual(new_operation['result'], None)
        self.assertEqual(operation_node['x'], data['position']['x'])
        self.assertEqual(operation_node['y'], data['position']['y'])
        self.assertEqual(operation_node['width'], data['position']['width'])
        self.assertEqual(operation_node['height'], data['position']['height'])
        self.assertEqual(schema.alias, data['item_data']['alias'])
        self.assertEqual(schema.title, data['item_data']['title'])
        self.assertEqual(schema.description, data['item_data']['description'])
        self.assertEqual(schema.visible, False)
        self.assertEqual(schema.access_policy, self.owned.model.access_policy)
        self.assertEqual(schema.location, self.owned.model.location)
        self.assertIn(self.user2, schema.getQ_editors())

        self.executeForbidden(data=data, item=self.unowned_id)
        self.toggle_admin(True)
        self.executeCreated(data=data, item=self.unowned_id)


    @decl_endpoint('/api/oss/{item}/clone-schema', method='post')
    def test_clone_schema(self):
        self.populateData()

        data = {
            'source_operation': self.operation1.pk,
            'layout': self.layout_data,
            'position': {
                'x': 2,
                'y': 2,
                'width': 400,
                'height': 60
            }
        }
        self.executeNotFound(data=data, item=self.invalid_id)
        self.executeForbidden(data=data, item=self.unowned_id)

        response = self.executeCreated(data=data, item=self.owned_id)
        self.assertIn('new_operation', response.data)
        self.assertIn('oss', response.data)
        new_operation_id = response.data['new_operation']
        oss_data = response.data['oss']
        new_operation = next(op for op in oss_data['operations'] if op['id'] == new_operation_id)
        self.assertEqual(new_operation['operation_type'], OperationType.INPUT)
        self.assertTrue(new_operation['alias'].startswith('+'))
        self.assertTrue(new_operation['title'].startswith('+'))
        self.assertIsNotNone(new_operation['result'])
        self.assertEqual(new_operation['parent'], None)

        layout = oss_data['layout']
        operation_node = [item for item in layout if item['nodeID'] == 'o' + str(new_operation_id)][0]
        self.assertEqual(operation_node['x'], data['position']['x'])
        self.assertEqual(operation_node['y'], data['position']['y'])
        self.assertEqual(operation_node['width'], data['position']['width'])
        self.assertEqual(operation_node['height'], data['position']['height'])

        new_schema = LibraryItem.objects.get(pk=new_operation['result'])
        self.assertEqual(new_schema.alias, new_operation['alias'])
        self.assertEqual(new_schema.title, new_operation['title'])
        self.assertEqual(new_schema.description, new_operation['description'])
        self.assertEqual(self.ks1.constituentsQ().count(), RSForm(new_schema).constituentsQ().count())

        unrelated_data = dict(data)
        unrelated_data['source_operation'] = self.unowned_operation.pk
        self.executeBadData(data=unrelated_data, item=self.owned_id)


    @decl_endpoint('/api/oss/{item}/create-schema', method='post')
    def test_create_schema_parent(self):
        self.populateData()
        data = {
            'item_data': {
                'parent': self.invalid_id,
                'alias': 'Test3',
                'title': 'Test title',
                'description': '',

            },
            'layout': self.layout_data,
            'position': {
                'x': 1,
                'y': 1,
                'width': 500,
                'height': 50
            }

        }
        self.executeBadData(data=data, item=self.owned_id)

        block_unowned = self.unowned.create_block(title='TestBlock1')
        data['item_data']['parent'] = block_unowned.id
        self.executeBadData(data=data, item=self.owned_id)

        block_owned = self.owned.create_block(title='TestBlock2')
        data['item_data']['parent'] = block_owned.id
        response = self.executeCreated(data=data, item=self.owned_id)
        new_operation_id = response.data['new_operation']
        new_operation = next(op for op in response.data['oss']['operations'] if op['id'] == new_operation_id)
        self.assertEqual(len(response.data['oss']['operations']), 4)
        self.assertEqual(new_operation['parent'], block_owned.id)


    @decl_endpoint('/api/oss/{item}/create-replica', method='post')
    def test_create_replica(self):
        self.populateData()
        data = {
            'target': self.invalid_id,
            'layout': self.layout_data,
            'position': {
                'x': 10,
                'y': 20,
                'width': 100,
                'height': 40
            }
        }
        self.executeBadData(data=data, item=self.owned_id)

        data['target'] = self.unowned_operation.pk
        self.executeBadData(data=data, item=self.owned_id)

        data['target'] = self.operation1.pk
        response = self.executeCreated(data=data, item=self.owned_id)
        self.owned.model.refresh_from_db()
        new_operation_id = response.data['new_operation']
        new_operation = next(op for op in response.data['oss']['operations'] if op['id'] == new_operation_id)
        self.assertEqual(new_operation['operation_type'], OperationType.REPLICA)
        self.assertEqual(new_operation['parent'], self.operation1.parent_id)
        self.assertEqual(new_operation['result'], self.operation1.result_id)
        ref = Replica.objects.filter(replica_id=new_operation_id, original_id=self.operation1.pk).first()
        self.assertIsNotNone(ref)
        self.assertTrue(Operation.objects.filter(pk=new_operation_id, oss=self.owned.model).exists())


    @decl_endpoint('/api/oss/{item}/create-synthesis', method='post')
    def test_create_synthesis(self):
        self.populateData()
        data = {
            'item_data': {
                'alias': 'Test4',
                'title': 'Test title',
                'description': '',
                'parent': None
            },
            'layout': self.layout_data,
            'position': {
                'x': 1,
                'y': 1,
                'width': 500,
                'height': 50
            },
            'arguments': [self.operation1.pk, self.operation3.pk],
            'substitutions': []
        }
        response = self.executeCreated(data=data, item=self.owned_id)
        self.owned.model.refresh_from_db()
        new_operation_id = response.data['new_operation']
        new_operation = next(op for op in response.data['oss']['operations'] if op['id'] == new_operation_id)
        arguments = Argument.objects.filter(operation__oss=self.owned.model)
        self.assertTrue(arguments.filter(operation__id=new_operation_id, argument=self.operation1))
        self.assertTrue(arguments.filter(operation__id=new_operation_id, argument=self.operation3))
        self.assertNotEqual(new_operation['result'], None)


    @decl_endpoint('/api/oss/{item}/create-synthesis', method='post')
    def test_create_synthesis_replicas(self):
        self.populateData()
        operation4 = self.owned.create_replica(self.operation1)
        operation5 = self.owned.create_replica(self.operation1)
        data = {
            'item_data': {
                'alias': 'Test5',
                'title': 'Test title',
                'description': '',
                'parent': None
            },
            'layout': self.layout_data,
            'position': {
                'x': 1,
                'y': 1,
                'width': 500,
                'height': 50
            },
            'arguments': [self.operation1.pk, operation4.pk],
            'substitutions': []
        }
        self.executeBadData(data=data, item=self.owned_id)

        data['arguments'] = [operation4.pk, operation5.pk]
        self.executeBadData(data=data, item=self.owned_id)

        data['arguments'] = [operation4.pk, self.operation3.pk]
        self.executeCreated(data=data, item=self.owned_id)


    @decl_endpoint('/api/oss/{item}/delete-operation', method='patch')
    def test_delete_operation(self):
        self.populateData()
        self.executeNotFound(item=self.invalid_id)
        self.executeBadData(item=self.owned_id)

        data = {
            'layout': self.layout_data
        }
        self.executeBadData(data=data)

        data['target'] = self.unowned_operation.pk
        self.executeBadData(data=data, item=self.owned_id)

        data['target'] = self.operation1.pk
        self.toggle_admin(True)
        self.executeBadData(data=data, item=self.unowned_id)
        self.logout()
        self.executeForbidden(data=data, item=self.owned_id)

        self.login()
        response = self.executeOK(data=data)
        layout = response.data['layout']
        deleted_items = [item for item in layout if item['nodeID'] == 'o' + str(data['target'])]
        self.assertEqual(len(response.data['operations']), 2)
        self.assertEqual(len(deleted_items), 0)


    @decl_endpoint('/api/oss/{item}/delete-operation', method='patch')
    def test_delete_reference_operation_invalid(self):
        self.populateData()
        reference_operation = self.owned.create_replica(self.operation1)
        data = {
            'layout': self.layout_data,
            'target': reference_operation.pk
        }
        self.executeBadData(data=data, item=self.owned_id)


    @decl_endpoint('/api/oss/{item}/delete-replica', method='patch')
    def test_delete_replica_operation(self):
        self.populateData()
        data = {
            'layout': self.layout_data,
            'target': self.invalid_id
        }
        self.executeBadData(data=data, item=self.owned_id)

        reference_operation = self.owned.create_replica(self.operation1)
        self.assertEqual(len(self.operation1.getQ_replicas()), 1)
        data['target'] = reference_operation.pk
        self.executeForbidden(data=data, item=self.unowned_id)

        data['target'] = self.operation1.pk
        self.executeBadData(data=data, item=self.owned_id)

        data['target'] = reference_operation.pk
        self.executeOK(data=data, item=self.owned_id)
        self.assertEqual(len(self.operation1.getQ_replicas()), 0)


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

        data['target'] = self.unowned_operation.pk
        self.executeBadData(data=data, item=self.owned_id)


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
        self.ks1.model.save()
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
        ks3x1 = ks3.insert_last('X1', term_resolved='X1_1')

        data = {
            'target': self.operation3.pk,
            'item_data': {
                'alias': 'Test3 mod',
                'title': 'Test title mod',
                'description': 'Comment mod'
            },
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

        data['layout'] = self.layout_data
        self.executeOK(data=data)

        data_bad = dict(data)
        data_bad['target'] = self.unowned_operation.pk
        self.executeBadData(data=data_bad, item=self.owned_id)


    @decl_endpoint('/api/oss/{item}/update-operation', method='patch')
    def test_update_operation_sync(self):
        self.populateData()
        self.executeBadData(item=self.owned_id)

        data = {
            'target': self.unowned_operation.pk,
            'item_data': {
                'alias': 'Test3 mod',
                'title': 'Test title mod',
                'description': 'Comment mod'
            },
            'layout': self.layout_data
        }
        self.executeBadData(data=data, item=self.owned_id)

        data['target'] = self.operation1.pk
        response = self.executeOK(data=data)
        self.operation1.refresh_from_db()
        self.assertEqual(self.operation1.alias, data['item_data']['alias'])
        self.assertEqual(self.operation1.title, data['item_data']['title'])
        self.assertEqual(self.operation1.description, data['item_data']['description'])
        self.assertEqual(self.operation1.result.alias, data['item_data']['alias'])
        self.assertEqual(self.operation1.result.title, data['item_data']['title'])
        self.assertEqual(self.operation1.result.description, data['item_data']['description'])

        # Try to update an operation from an unrelated OSS (should fail)
        data_bad = dict(data)
        data_bad['target'] = self.unowned_operation.pk
        self.executeBadData(data=data_bad, item=self.owned_id)


    @decl_endpoint('/api/oss/{item}/update-operation', method='patch')
    def test_update_operation_invalid_substitution(self):
        self.populateData()

        self.ks1X2 = self.ks1.insert_last('X2')

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

        data['target'] = self.unowned_operation.pk
        self.executeBadData(data=data, item=self.owned_id)

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
        items = list(RSForm(schema).constituentsQ())
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0].alias, 'X1')
        self.assertEqual(items[0].term_resolved, self.ks2X1.term_resolved)

    @decl_endpoint('/api/oss/{item}/import-schema', method='post')
    def test_import_schema(self):
        self.populateData()
        target_ks = RSForm.create(
            alias='KS_Target',
            title='Target',
            owner=self.user
        )
        data = {
            'item_data': {
                'alias': 'ImportedAlias',
                'title': 'Imported Title',
                'description': 'Imported Description',
                'parent': None
            },
            'layout': self.layout_data,
            'position': {
                'x': 10,
                'y': 20,
                'width': 300,
                'height': 60
            },
            'source': target_ks.model.pk,
            'clone_source': False
        }
        response = self.executeCreated(data=data, item=self.owned_id)
        new_operation_id = response.data['new_operation']
        new_operation = next(op for op in response.data['oss']['operations'] if op['id'] == new_operation_id)
        layout = response.data['oss']['layout']
        operation_node = [item for item in layout if item['nodeID'] == 'o' + str(new_operation_id)][0]
        schema = LibraryItem.objects.get(pk=new_operation['result'])
        self.assertEqual(new_operation['alias'], data['item_data']['alias'])
        self.assertEqual(new_operation['title'], data['item_data']['title'])
        self.assertEqual(new_operation['description'], data['item_data']['description'])
        self.assertEqual(new_operation['operation_type'], OperationType.INPUT)
        self.assertEqual(schema.pk, target_ks.model.pk)  # Not a clone
        self.assertEqual(operation_node['x'], data['position']['x'])
        self.assertEqual(operation_node['y'], data['position']['y'])
        self.assertEqual(operation_node['width'], data['position']['width'])
        self.assertEqual(operation_node['height'], data['position']['height'])
        self.assertEqual(schema.visible, target_ks.model.visible)
        self.assertEqual(schema.access_policy, target_ks.model.access_policy)
        self.assertEqual(schema.location, target_ks.model.location)

    @decl_endpoint('/api/oss/{item}/import-schema', method='post')
    def test_import_schema_clone(self):
        self.populateData()
        # Use ks2 as the source RSForm
        data = {
            'item_data': {
                'alias': 'ClonedAlias',
                'title': 'Cloned Title',
                'description': 'Cloned Description',
                'parent': None
            },
            'layout': self.layout_data,
            'position': {
                'x': 42,
                'y': 1337,
                'width': 400,
                'height': 80
            },
            'source': self.ks2.model.pk,
            'clone_source': True
        }
        response = self.executeCreated(data=data, item=self.owned_id)
        new_operation_id = response.data['new_operation']
        new_operation = next(op for op in response.data['oss']['operations'] if op['id'] == new_operation_id)
        layout = response.data['oss']['layout']
        operation_node = [item for item in layout if item['nodeID'] == 'o' + str(new_operation_id)][0]
        schema = LibraryItem.objects.get(pk=new_operation['result'])
        self.assertEqual(new_operation['alias'], data['item_data']['alias'])
        self.assertEqual(new_operation['title'], data['item_data']['title'])
        self.assertEqual(new_operation['description'], data['item_data']['description'])
        self.assertEqual(new_operation['operation_type'], OperationType.INPUT)
        self.assertNotEqual(schema.pk, self.ks2.model.pk)  # Should be a clone
        self.assertEqual(schema.alias, data['item_data']['alias'])
        self.assertEqual(schema.title, data['item_data']['title'])
        self.assertEqual(schema.description, data['item_data']['description'])
        self.assertEqual(operation_node['x'], data['position']['x'])
        self.assertEqual(operation_node['y'], data['position']['y'])
        self.assertEqual(operation_node['width'], data['position']['width'])
        self.assertEqual(operation_node['height'], data['position']['height'])
        self.assertEqual(schema.visible, False)
        self.assertEqual(schema.access_policy, self.owned.model.access_policy)
        self.assertEqual(schema.location, self.owned.model.location)


    @decl_endpoint('/api/oss/{item}/import-schema', method='post')
    def test_import_schema_bad_data(self):
        self.populateData()
        # Missing source
        data = {
            'item_data': {
                'alias': 'Bad',
                'title': 'Bad',
                'description': 'Bad',
                'parent': None
            },
            'layout': self.layout_data,
            'position': {
                'x': 0, 'y': 0, 'width': 1, 'height': 1
            },
            # 'source' missing
            'clone_source': False
        }
        self.executeBadData(data=data, item=self.owned_id)
        # Invalid source
        data['source'] = self.invalid_id
        self.executeBadData(data=data, item=self.owned_id)
        # Invalid OSS
        data['source'] = self.ks1.model.pk
        self.executeNotFound(data=data, item=self.invalid_id)

    @decl_endpoint('/api/oss/{item}/import-schema', method='post')
    def test_import_schema_permissions(self):
        self.populateData()
        data = {
            'item_data': {
                'alias': 'PermTest',
                'title': 'PermTest',
                'description': 'PermTest',
                'parent': None
            },
            'layout': self.layout_data,
            'position': {
                'x': 5, 'y': 5, 'width': 10, 'height': 10
            },
            'source': self.ks1.model.pk,
            'clone_source': False
        }
        # Not an editor
        self.logout()
        self.executeForbidden(data=data, item=self.owned_id)
        # As admin
        self.login()
        self.toggle_admin(True)
        self.executeCreated(data=data, item=self.owned_id)
