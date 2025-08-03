''' Testing API: Operation Schema. '''
from apps.library.models import AccessPolicy, LibraryItemType
from apps.oss.models import OperationSchema, OperationType
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
        self.invalid_id = self.private_id + 1337


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
        self.layout_data = [
            {'nodeID': 'o' + str(self.operation1.pk), 'x': 0, 'y': 0, 'width': 150, 'height': 40},
            {'nodeID': 'o' + str(self.operation2.pk), 'x': 0, 'y': 0, 'width': 150, 'height': 40},
            {'nodeID': 'o' + str(self.operation3.pk), 'x': 0, 'y': 0, 'width': 150, 'height': 40}
        ]
        layout = OperationSchema.layoutQ(self.owned_id)
        layout.data = self.layout_data
        layout.save()

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

        self.assertEqual(len(response.data['operations']), 3)
        self.assertEqual(response.data['operations'][0]['id'], self.operation1.pk)
        self.assertEqual(response.data['operations'][0]['operation_type'], self.operation1.operation_type)

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

        layout = response.data['layout']
        self.assertEqual(layout[0], self.layout_data[0])
        self.assertEqual(layout[1], self.layout_data[1])
        self.assertEqual(layout[2], self.layout_data[2])

        self.executeOK(item=self.unowned_id)
        self.executeForbidden(item=self.private_id)

        self.logout()
        self.executeOK(item=self.owned_id)
        self.executeOK(item=self.unowned_id)
        self.executeForbidden(item=self.private_id)


    @decl_endpoint('/api/oss/{item}/update-layout', method='patch')
    def test_update_layout(self):
        self.populateData()
        self.executeBadData(item=self.owned_id)

        data = {'data': []}
        self.executeOK(data=data)

        data = {'data': [
            {'nodeID': 'o' + str(self.operation1.pk), 'x': 42.1, 'y': 1337, 'width': 150, 'height': 40},
            {'nodeID': 'o' + str(self.operation2.pk), 'x': 36.1, 'y': 1437, 'width': 150, 'height': 40},
            {'nodeID': 'o' + str(self.operation3.pk), 'x': 36.1, 'y': 1435, 'width': 150, 'height': 40}
        ]}
        self.toggle_admin(True)
        self.executeOK(data=data, item=self.unowned_id)

        self.toggle_admin(False)
        self.executeOK(data=data, item=self.owned_id)
        self.owned.model.refresh_from_db()
        self.assertEqual(OperationSchema.layoutQ(self.owned_id).data, data['data'])

        self.executeForbidden(data=data, item=self.unowned_id)
        self.executeForbidden(data=data, item=self.private_id)


    @decl_endpoint('/api/oss/get-predecessor', method='post')
    def test_get_predecessor(self):
        self.populateData()
        self.ks1X2 = self.ks1.insert_last('X2')

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


    @decl_endpoint('/api/oss/{item}/move-items', method='patch')
    def test_move_items(self):
        self.populateData()
        self.executeBadData(item=self.owned_id)

        block1 = self.owned.create_block(title='1')
        block2 = self.owned.create_block(title='2')

        data = {
            'layout': self.layout_data,
            'blocks': [block2.pk],
            'operations': [self.operation1.pk, self.operation2.pk],
            'destination': block2.pk
        }
        self.executeBadData(data=data)

        data['destination'] = block1.pk
        self.executeOK(data=data)
        self.operation1.refresh_from_db()
        self.operation2.refresh_from_db()
        block2.refresh_from_db()

        self.assertEqual(self.operation1.parent.pk, block1.pk)
        self.assertEqual(self.operation2.parent.pk, block1.pk)
        self.assertEqual(block2.parent.pk, block1.pk)

        data['destination'] = None
        self.executeOK(data=data)
        self.operation1.refresh_from_db()
        self.operation2.refresh_from_db()
        block2.refresh_from_db()
        self.assertEqual(block2.parent, None)
        self.assertEqual(self.operation1.parent, None)
        self.assertEqual(self.operation2.parent, None)


    @decl_endpoint('/api/oss/{item}/move-items', method='patch')
    def test_move_items_cyclic(self):
        self.populateData()
        self.executeBadData(item=self.owned_id)

        block1 = self.owned.create_block(title='1')
        block2 = self.owned.create_block(title='2', parent=block1)
        block3 = self.owned.create_block(title='3', parent=block2)

        data = {
            'layout': self.layout_data,
            'blocks': [block1.pk],
            'operations': [],
            'destination': block3.pk
        }
        self.executeBadData(data=data)


    @decl_endpoint('/api/oss/relocate-constituents', method='post')
    def test_relocate_constituents(self):
        self.populateData()
        self.ks1X2 = self.ks1.insert_last('X2', convention='test')

        self.owned.execute_operation(self.operation3)
        self.operation3.refresh_from_db()
        self.ks3 = RSForm(self.operation3.result)
        self.ks3X2 = Constituenta.objects.get(as_child__parent_id=self.ks1X2.pk)
        self.ks3X10 = self.ks3.insert_last('X10', convention='test2')

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
