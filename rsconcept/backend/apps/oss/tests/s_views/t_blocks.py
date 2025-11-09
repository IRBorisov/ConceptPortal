''' Testing API: Operation Schema - blocks manipulation. '''
from apps.oss.models import OperationSchema, OperationType
from shared.EndpointTester import EndpointTester, decl_endpoint


class TestOssBlocks(EndpointTester):
    ''' Testing OSS view - Blocks. '''


    def setUp(self):
        super().setUp()
        self.owned = OperationSchema.create(title='Test', alias='T1', owner=self.user)
        self.owned_id = self.owned.model.pk
        self.unowned = OperationSchema.create(title='Test2', alias='T2')
        self.unowned_id = self.unowned.model.pk
        self.invalid_id = self.unowned_id + 1337


    def populateData(self):
        self.unowned.create_block()
        self.unowned.create_block()
        self.unowned.create_block()
        self.unowned.create_block()

        self.block1 = self.owned.create_block(
            title='1',
        )
        self.block2 = self.owned.create_block(
            title='2',
            parent=self.block1
        )
        self.operation1 = self.owned.create_operation(
            alias='1',
            operation_type=OperationType.INPUT,
            parent=self.block1,
        )
        self.operation2 = self.owned.create_operation(
            alias='2',
            operation_type=OperationType.INPUT,
            parent=self.block2,
        )
        self.operation3 = self.unowned.create_operation(
            alias='3',
            operation_type=OperationType.INPUT
        )
        self.block3 = self.unowned.create_block(
            title='3',
            parent=self.block1
        )
        self.layout_data = [
            {'nodeID': 'o' + str(self.operation1.pk), 'x': 0, 'y': 0, 'width': 150, 'height': 40},
            {'nodeID': 'o' + str(self.operation2.pk), 'x': 0, 'y': 0, 'width': 150, 'height': 40},

            {'nodeID': 'b' + str(self.block1.pk), 'x': 0, 'y': 0, 'width': 0.5, 'height': 0.5},
            {'nodeID': 'b' + str(self.block2.pk), 'x': 0, 'y': 0, 'width': 0.5, 'height': 0.5},
        ]

        layout = OperationSchema.layoutQ(self.owned_id)
        layout.data = self.layout_data
        layout.save()


    @decl_endpoint('/api/oss/{item}/create-block', method='post')
    def test_create_block(self):
        self.populateData()
        self.executeBadData(item=self.owned_id)

        data = {
            'item_data': {
                'title': 'Test title',
                'description': 'Тест кириллицы',
            },
            'layout': self.layout_data,
            'position': {
                'x': 1337,
                'y': 1337,
                'width': 0.42,
                'height': 0.42
            },
            'children_operations': [],
            'children_blocks': []
        }
        self.executeNotFound(data, item=self.invalid_id)

        response = self.executeCreated(data, item=self.owned_id)
        self.assertEqual(len(response.data['oss']['blocks']), 3)
        new_block = response.data['new_block']
        layout = response.data['oss']['layout']
        block_node = [item for item in layout if item['nodeID'] == 'b' + str(new_block)][0]
        self.assertEqual(block_node['x'], data['position']['x'])
        self.assertEqual(block_node['y'], data['position']['y'])
        self.assertEqual(block_node['width'], data['position']['width'])
        self.assertEqual(block_node['height'], data['position']['height'])
        self.operation1.refresh_from_db()

        self.executeForbidden(data, item=self.unowned_id)
        self.toggle_admin(True)
        self.executeCreated(data, item=self.unowned_id)


    @decl_endpoint('/api/oss/{item}/create-block', method='post')
    def test_create_block_parent(self):
        self.populateData()
        data = {
            'item_data': {
                'title': 'Test title',
                'description': 'Тест кириллицы',
                'parent': self.invalid_id
            },
            'layout': self.layout_data,
            'position': {
                'x': 1337,
                'y': 1337,
                'width': 0.42,
                'height': 0.42
            },
            'children_operations': [],
            'children_blocks': []
        }
        self.executeBadData(data, item=self.owned_id)

        data['item_data']['parent'] = self.block3.pk
        self.executeBadData(data)

        data['item_data']['parent'] = self.block1.pk
        response = self.executeCreated(data)
        new_block = response.data['new_block']
        block_data = next((block for block in response.data['oss']['blocks'] if block['id'] == new_block), None)
        self.assertEqual(block_data['parent'], self.block1.pk)


    @decl_endpoint('/api/oss/{item}/create-block', method='post')
    def test_create_block_children(self):
        self.populateData()
        data = {
            'item_data': {
                'title': 'Test title',
                'description': 'Тест кириллицы',
            },
            'layout': self.layout_data,
            'position': {
                'x': 1337,
                'y': 1337,
                'width': 0.42,
                'height': 0.42
            },
            'children_operations': [self.invalid_id],
            'children_blocks': []
        }
        self.executeBadData(data, item=self.owned_id)

        data['children_operations'] = [self.operation3.pk]
        self.executeBadData(data)

        data['children_operations'] = [self.block1.pk]
        self.executeBadData(data)

        data['children_operations'] = [self.operation1.pk]
        data['children_blocks'] = [self.operation1.pk]
        self.executeBadData(data)

        data['children_blocks'] = [self.block1.pk]
        response = self.executeCreated(data)
        new_block = response.data['new_block']
        self.operation1.refresh_from_db()
        self.block1.refresh_from_db()
        self.assertEqual(self.operation1.parent.pk, new_block)
        self.assertEqual(self.block1.parent.pk, new_block)


    @decl_endpoint('/api/oss/{item}/create-block', method='post')
    def test_create_block_cyclic(self):
        self.populateData()
        data = {
            'item_data': {
                'title': 'Test title',
                'description': 'Тест кириллицы',
                'parent': self.block2.pk
            },
            'layout': self.layout_data,
            'position': {
                'x': 1337,
                'y': 1337,
                'width': 0.42,
                'height': 0.42
            },
            'children_operations': [],
            'children_blocks': [self.block1.pk]
        }
        self.executeBadData(data, item=self.owned_id)

        data['item_data']['parent'] = self.block1.pk
        self.executeBadData(data)

        data['children_blocks'] = [self.block2.pk]
        self.executeCreated(data)


    @decl_endpoint('/api/oss/{item}/delete-block', method='patch')
    def test_delete_block(self):
        self.populateData()
        self.executeNotFound(item=self.invalid_id)
        self.executeBadData(item=self.owned_id)

        data = {
            'layout': self.layout_data
        }
        self.executeBadData(data)

        data['target'] = self.operation1.pk
        self.executeBadData(data)

        data['target'] = self.block3.pk
        self.executeBadData(data)

        data['target'] = self.block2.pk
        self.logout()
        self.executeForbidden(data)

        self.login()
        response = self.executeOK(data)
        self.operation2.refresh_from_db()
        self.assertEqual(len(response.data['blocks']), 1)
        self.assertEqual(self.operation2.parent.pk, self.block1.pk)

        data['target'] = self.block1.pk
        response = self.executeOK(data)
        self.operation1.refresh_from_db()
        self.operation2.refresh_from_db()
        self.assertEqual(len(response.data['blocks']), 0)
        self.assertEqual(self.operation1.parent, None)
        self.assertEqual(self.operation2.parent, None)


    @decl_endpoint('/api/oss/{item}/update-block', method='patch')
    def test_update_block(self):
        self.populateData()
        self.executeBadData(item=self.owned_id)

        data = {
            'target': self.invalid_id,
            'item_data': {
                'title': 'Test title mod',
                'description': 'Comment mod',
                'parent': None
            },
        }
        self.executeBadData(data)

        data['target'] = self.block3.pk
        self.toggle_admin(True)
        self.executeBadData(data)

        data['target'] = self.block2.pk
        self.logout()
        self.executeForbidden(data)

        self.login()
        response = self.executeOK(data)
        self.block2.refresh_from_db()
        self.assertEqual(self.block2.title, data['item_data']['title'])
        self.assertEqual(self.block2.description, data['item_data']['description'])
        self.assertEqual(self.block2.parent, data['item_data']['parent'])

        data['layout'] = self.layout_data
        self.executeOK(data)


    @decl_endpoint('/api/oss/{item}/update-block', method='patch')
    def test_update_block_cyclic_parent(self):
        self.populateData()
        # block1 -> block2
        # Try to set block1's parent to block2 (should fail, direct cycle)
        data = {
            'target': self.block1.pk,
            'item_data': {
                'title': self.block1.title,
                'description': self.block1.description,
                'parent': self.block2.pk
            },
        }
        self.executeBadData(data, item=self.owned_id)

        # Create a deeper hierarchy: block1 -> block2 -> block3
        self.block3 = self.owned.create_block(title='3', parent=self.block2)
        # Try to set block1's parent to block3 (should fail, indirect cycle)
        data['item_data']['parent'] = self.block3.pk
        self.executeBadData(data, item=self.owned_id)

        # Setting block2's parent to block1 (valid, as block1 is not a descendant)
        data = {
            'target': self.block2.pk,
            'item_data': {
                'title': self.block2.title,
                'description': self.block2.description,
                'parent': self.block1.pk
            },
        }
        self.executeOK(data, item=self.owned_id)
