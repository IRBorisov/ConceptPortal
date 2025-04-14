''' Testing API: Operation Schema - blocks manipulation. '''
from apps.library.models import AccessPolicy, Editor, LibraryItem, LibraryItemType
from apps.oss.models import Operation, OperationSchema, OperationType
from apps.rsform.models import Constituenta, RSForm
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
        self.operation1 = self.owned.create_operation(
            alias='1',
            operation_type=OperationType.INPUT,
            parent=self.block1,
        )
        self.operation2 = self.owned.create_operation(
            alias='2',
            operation_type=OperationType.INPUT,
        )
        self.operation3 = self.unowned.create_operation(
            alias='3',
            operation_type=OperationType.INPUT
        )
        self.block2 = self.owned.create_block(
            title='2',
            parent=self.block1
        )
        self.block3 = self.unowned.create_block(
            title='3',
            parent=self.block1
        )
        self.layout_data = {
            'operations': [
                {'id': self.operation1.pk, 'x': 0, 'y': 0},
                {'id': self.operation2.pk, 'x': 0, 'y': 0},
            ],
            'blocks': [
                {'id': self.block1.pk, 'x': 0, 'y': 0, 'width': 0.5, 'height': 0.5},
                {'id': self.block2.pk, 'x': 0, 'y': 0, 'width': 0.5, 'height': 0.5},
            ]
        }
        layout = self.owned.layout()
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
            'position_x': 1337,
            'position_y': 1337,
            'width': 0.42,
            'height': 0.42,
            'children_operations': [],
            'children_blocks': []
        }
        self.executeNotFound(data=data, item=self.invalid_id)

        response = self.executeCreated(data=data, item=self.owned_id)
        self.assertEqual(len(response.data['oss']['blocks']), 3)
        new_block = response.data['new_block']
        layout = response.data['oss']['layout']
        item = [item for item in layout['blocks'] if item['id'] == new_block['id']][0]
        self.assertEqual(new_block['title'], data['item_data']['title'])
        self.assertEqual(new_block['description'], data['item_data']['description'])
        self.assertEqual(new_block['parent'], None)
        self.assertEqual(item['x'], data['position_x'])
        self.assertEqual(item['y'], data['position_y'])
        self.assertEqual(item['width'], data['width'])
        self.assertEqual(item['height'], data['height'])
        self.operation1.refresh_from_db()

        self.executeForbidden(data=data, item=self.unowned_id)
        self.toggle_admin(True)
        self.executeCreated(data=data, item=self.unowned_id)


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
            'position_x': 1337,
            'position_y': 1337,
            'width': 0.42,
            'height': 0.42,
            'children_operations': [],
            'children_blocks': []
        }
        self.executeBadData(data=data, item=self.owned_id)

        data['item_data']['parent'] = self.block3.pk
        self.executeBadData(data=data)

        data['item_data']['parent'] = self.block1.pk
        response = self.executeCreated(data=data)
        new_block = response.data['new_block']
        self.assertEqual(new_block['parent'], self.block1.pk)


    @decl_endpoint('/api/oss/{item}/create-block', method='post')
    def test_create_block_children(self):
        self.populateData()
        data = {
            'item_data': {
                'title': 'Test title',
                'description': 'Тест кириллицы',
            },
            'layout': self.layout_data,
            'position_x': 1337,
            'position_y': 1337,
            'width': 0.42,
            'height': 0.42,
            'children_operations': [self.invalid_id],
            'children_blocks': []
        }
        self.executeBadData(data=data, item=self.owned_id)

        data['children_operations'] = [self.operation3.pk]
        self.executeBadData(data=data)

        data['children_operations'] = [self.block1.pk]
        self.executeBadData(data=data)

        data['children_operations'] = [self.operation1.pk]
        data['children_blocks'] = [self.operation1.pk]
        self.executeBadData(data=data)

        data['children_blocks'] = [self.block1.pk]
        response = self.executeCreated(data=data)
        new_block = response.data['new_block']
        self.operation1.refresh_from_db()
        self.block1.refresh_from_db()
        self.assertEqual(self.operation1.parent.pk, new_block['id'])
        self.assertEqual(self.block1.parent.pk, new_block['id'])
