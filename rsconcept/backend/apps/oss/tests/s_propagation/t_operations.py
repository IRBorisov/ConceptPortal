''' Testing API: Change substitutions in OSS. '''

from apps.oss.models import OperationSchema, OperationType
from apps.rsform.models import Constituenta, CstType, RSForm
from shared.EndpointTester import EndpointTester, decl_endpoint


class TestChangeOperations(EndpointTester):
    ''' Testing Operations change propagation in OSS. '''

    def setUp(self):
        super().setUp()
        self.owned = OperationSchema.create(
            title='Test',
            alias='T1',
            owner=self.user
        )
        self.owned_id = self.owned.model.pk

        self.ks1 = RSForm.create(
            alias='KS1',
            title='Test1',
            owner=self.user
        )
        self.ks1X1 = self.ks1.insert_new('X1', convention='KS1X1')
        self.ks1X2 = self.ks1.insert_new('X2', convention='KS1X2')
        self.ks1D1 = self.ks1.insert_new('D1', definition_formal='X1 X2', convention='KS1D1')

        self.ks2 = RSForm.create(
            alias='KS2',
            title='Test2',
            owner=self.user
        )
        self.ks2X1 = self.ks2.insert_new('X1', convention='KS2X1')
        self.ks2X2 = self.ks2.insert_new('X2', convention='KS2X2')
        self.ks2S1 = self.ks2.insert_new(
            alias='S1',
            definition_formal=r'X1',
            convention='KS2S1'
        )

        self.ks3 = RSForm.create(
            alias='KS3',
            title='Test3',
            owner=self.user
        )
        self.ks3X1 = self.ks3.insert_new('X1', convention='KS3X1')
        self.ks3D1 = self.ks3.insert_new(
            alias='D1',
            definition_formal='X1 X1',
            convention='KS3D1'
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
            operation_type=OperationType.INPUT,
            result=self.ks3.model
        )

        self.operation4 = self.owned.create_operation(
            alias='4',
            operation_type=OperationType.SYNTHESIS
        )
        self.owned.set_arguments(self.operation4.pk, [self.operation1, self.operation2])
        self.owned.set_substitutions(self.operation4.pk, [{
            'original': self.ks1X1,
            'substitution': self.ks2S1
        }])
        self.owned.execute_operation(self.operation4)
        self.operation4.refresh_from_db()
        self.ks4 = RSForm(self.operation4.result)
        self.ks4X1 = Constituenta.objects.get(as_child__parent_id=self.ks1X2.pk)
        self.ks4S1 = Constituenta.objects.get(as_child__parent_id=self.ks2S1.pk)
        self.ks4D1 = Constituenta.objects.get(as_child__parent_id=self.ks1D1.pk)
        self.ks4D2 = self.ks4.insert_new(
            alias='D2',
            definition_formal=r'X1 X2 X3 S1 D1',
            convention='KS4D2'
        )

        self.operation5 = self.owned.create_operation(
            alias='5',
            operation_type=OperationType.SYNTHESIS
        )
        self.owned.set_arguments(self.operation5.pk, [self.operation4, self.operation3])
        self.owned.set_substitutions(self.operation5.pk, [{
            'original': self.ks4X1,
            'substitution': self.ks3X1
        }])
        self.owned.execute_operation(self.operation5)
        self.operation5.refresh_from_db()
        self.ks5 = RSForm(self.operation5.result)
        self.ks5D4 = self.ks5.insert_new(
            alias='D4',
            definition_formal=r'X1 X2 X3 S1 D1 D2 D3',
            convention='KS5D4'
        )

    def test_oss_setup(self):
        self.assertEqual(self.ks1.constituents().count(), 3)
        self.assertEqual(self.ks2.constituents().count(), 3)
        self.assertEqual(self.ks3.constituents().count(), 2)
        self.assertEqual(self.ks4.constituents().count(), 6)
        self.assertEqual(self.ks5.constituents().count(), 8)
        self.assertEqual(self.ks4D1.definition_formal, 'S1 X1')

    @decl_endpoint('/api/oss/{item}/delete-operation', method='patch')
    def test_delete_input_operation(self):
        data = {
            'positions': [],
            'target': self.operation2.pk
        }
        self.executeOK(data=data, item=self.owned_id)
        self.ks4D1.refresh_from_db()
        self.ks4D2.refresh_from_db()
        self.ks5D4.refresh_from_db()
        subs1_2 = self.operation4.getQ_substitutions()
        self.assertEqual(subs1_2.count(), 0)
        subs3_4 = self.operation5.getQ_substitutions()
        self.assertEqual(subs3_4.count(), 1)
        self.assertEqual(self.ks4.constituents().count(), 4)
        self.assertEqual(self.ks5.constituents().count(), 6)
        self.assertEqual(self.ks4D1.definition_formal, r'X4 X1')
        self.assertEqual(self.ks4D2.definition_formal, r'X1 DEL DEL DEL D1')
        self.assertEqual(self.ks5D4.definition_formal, r'DEL DEL X3 DEL D1 D2 D3')

    @decl_endpoint('/api/oss/{item}/set-input', method='patch')
    def test_set_input_null(self):
        data = {
            'positions': [],
            'target': self.operation2.pk,
            'input': None
        }
        self.executeOK(data=data, item=self.owned_id)
        self.ks4D1.refresh_from_db()
        self.ks4D2.refresh_from_db()
        self.ks5D4.refresh_from_db()
        self.operation2.refresh_from_db()
        self.assertEqual(self.operation2.result, None)
        subs1_2 = self.operation4.getQ_substitutions()
        self.assertEqual(subs1_2.count(), 0)
        subs3_4 = self.operation5.getQ_substitutions()
        self.assertEqual(subs3_4.count(), 1)
        self.assertEqual(self.ks4.constituents().count(), 4)
        self.assertEqual(self.ks5.constituents().count(), 6)
        self.assertEqual(self.ks4D1.definition_formal, r'X4 X1')
        self.assertEqual(self.ks4D2.definition_formal, r'X1 DEL DEL DEL D1')
        self.assertEqual(self.ks5D4.definition_formal, r'DEL DEL X3 DEL D1 D2 D3')

    @decl_endpoint('/api/oss/{item}/set-input', method='patch')
    def test_set_input_change_schema(self):
        ks6 = RSForm.create(
            alias='KS6',
            title='Test6',
            owner=self.user
        )
        ks6X1 = ks6.insert_new('X1', convention='KS6X1')
        ks6X2 = ks6.insert_new('X2', convention='KS6X2')
        ks6D1 = ks6.insert_new('D1', definition_formal='X1 X2', convention='KS6D1')

        data = {
            'positions': [],
            'target': self.operation2.pk,
            'input': ks6.model.pk
        }
        self.executeOK(data=data, item=self.owned_id)
        ks4Dks6 = Constituenta.objects.get(as_child__parent_id=ks6D1.pk)
        self.ks4D1.refresh_from_db()
        self.ks4D2.refresh_from_db()
        self.ks5D4.refresh_from_db()
        self.operation2.refresh_from_db()
        self.assertEqual(self.operation2.result, ks6.model)
        self.assertEqual(self.operation2.alias, ks6.model.alias)
        subs1_2 = self.operation4.getQ_substitutions()
        self.assertEqual(subs1_2.count(), 0)
        subs3_4 = self.operation5.getQ_substitutions()
        self.assertEqual(subs3_4.count(), 1)
        self.assertEqual(self.ks4.constituents().count(), 7)
        self.assertEqual(self.ks5.constituents().count(), 9)
        self.assertEqual(ks4Dks6.definition_formal, r'X5 X6')
        self.assertEqual(self.ks4D1.definition_formal, r'X4 X1')
        self.assertEqual(self.ks4D2.definition_formal, r'X1 DEL DEL DEL D1')
        self.assertEqual(self.ks5D4.definition_formal, r'DEL DEL X3 DEL D1 D2 D3')

    @decl_endpoint('/api/library/{item}', method='delete')
    def test_delete_schema(self):
        self.executeNoContent(item=self.ks1.model.pk)
        self.ks4D2.refresh_from_db()
        self.ks5D4.refresh_from_db()
        self.operation1.refresh_from_db()
        self.assertEqual(self.operation1.result, None)
        subs1_2 = self.operation4.getQ_substitutions()
        self.assertEqual(subs1_2.count(), 0)
        subs3_4 = self.operation5.getQ_substitutions()
        self.assertEqual(subs3_4.count(), 0)
        self.assertEqual(self.ks4.constituents().count(), 4)
        self.assertEqual(self.ks5.constituents().count(), 7)
        self.assertEqual(self.ks4D2.definition_formal, r'DEL X2 X3 S1 DEL')
        self.assertEqual(self.ks5D4.definition_formal, r'X1 X2 X3 S1 DEL D2 D3')

    @decl_endpoint('/api/oss/{item}/delete-operation', method='patch')
    def test_delete_operation_and_constituents(self):
        data = {
            'positions': [],
            'target': self.operation1.pk,
            'keep_constituents': False,
            'delete_schema': True
        }

        self.executeOK(data=data, item=self.owned_id)
        self.ks4D2.refresh_from_db()
        self.ks5D4.refresh_from_db()
        subs1_2 = self.operation4.getQ_substitutions()
        self.assertEqual(subs1_2.count(), 0)
        subs3_4 = self.operation5.getQ_substitutions()
        self.assertEqual(subs3_4.count(), 0)
        self.assertEqual(self.ks4.constituents().count(), 4)
        self.assertEqual(self.ks5.constituents().count(), 7)
        self.assertEqual(self.ks4D2.definition_formal, r'DEL X2 X3 S1 DEL')
        self.assertEqual(self.ks5D4.definition_formal, r'X1 X2 X3 S1 DEL D2 D3')

    @decl_endpoint('/api/oss/{item}/delete-operation', method='patch')
    def test_delete_operation_keep_constituents(self):
        data = {
            'positions': [],
            'target': self.operation1.pk,
            'keep_constituents': True,
            'delete_schema': True
        }

        self.executeOK(data=data, item=self.owned_id)
        self.ks4D2.refresh_from_db()
        self.ks5D4.refresh_from_db()
        subs1_2 = self.operation4.getQ_substitutions()
        self.assertEqual(subs1_2.count(), 0)
        subs3_4 = self.operation5.getQ_substitutions()
        self.assertEqual(subs3_4.count(), 1)
        self.assertEqual(self.ks4.constituents().count(), 6)
        self.assertEqual(self.ks5.constituents().count(), 8)
        self.assertEqual(self.ks4D2.definition_formal, r'X1 X2 X3 S1 D1')
        self.assertEqual(self.ks5D4.definition_formal, r'X1 X2 X3 S1 D1 D2 D3')

    @decl_endpoint('/api/oss/{item}/update-operation', method='patch')
    def test_change_substitutions(self):
        data = {
            'target': self.operation4.pk,
            'item_data': {
                'alias': 'Test4 mod',
                'title': 'Test title mod',
                'comment': 'Comment mod'
            },
            'positions': [],
            'substitutions': [
                {
                    'original': self.ks1X1.pk,
                    'substitution': self.ks2X2.pk
                },
                {
                    'original': self.ks2X1.pk,
                    'substitution': self.ks1D1.pk
                }
            ]
        }

        self.executeOK(data=data, item=self.owned_id)
        self.ks4D2.refresh_from_db()
        self.ks5D4.refresh_from_db()
        subs1_2 = self.operation4.getQ_substitutions()
        self.assertEqual(subs1_2.count(), 2)
        subs3_4 = self.operation5.getQ_substitutions()
        self.assertEqual(subs3_4.count(), 1)
        self.assertEqual(self.ks4.constituents().count(), 5)
        self.assertEqual(self.ks5.constituents().count(), 7)
        self.assertEqual(self.ks4D2.definition_formal, r'X1 D1 X3 S1 D1')
        self.assertEqual(self.ks5D4.definition_formal, r'D1 X2 X3 S1 D1 D2 D3')

    @decl_endpoint('/api/oss/{item}/update-operation', method='patch')
    def test_change_arguments(self):
        data = {
            'target': self.operation4.pk,
            'item_data': {
                'alias': 'Test4 mod',
                'title': 'Test title mod',
                'comment': 'Comment mod'
            },
            'positions': [],
            'arguments': [self.operation1.pk],
        }

        self.executeOK(data=data, item=self.owned_id)
        self.ks4D2.refresh_from_db()
        self.ks5D4.refresh_from_db()
        subs1_2 = self.operation4.getQ_substitutions()
        self.assertEqual(subs1_2.count(), 0)
        subs3_4 = self.operation5.getQ_substitutions()
        self.assertEqual(subs3_4.count(), 1)
        self.assertEqual(self.ks4.constituents().count(), 4)
        self.assertEqual(self.ks5.constituents().count(), 6)
        self.assertEqual(self.ks4D2.definition_formal, r'X1 DEL DEL DEL D1')
        self.assertEqual(self.ks5D4.definition_formal, r'DEL DEL X3 DEL D1 D2 D3')

        data['arguments'] = [self.operation1.pk, self.operation2.pk]
        self.executeOK(data=data, item=self.owned_id)
        self.ks4D2.refresh_from_db()
        self.ks5D4.refresh_from_db()
        subs1_2 = self.operation4.getQ_substitutions()
        self.assertEqual(subs1_2.count(), 0)
        subs3_4 = self.operation5.getQ_substitutions()
        self.assertEqual(subs3_4.count(), 1)
        self.assertEqual(self.ks4.constituents().count(), 7)
        self.assertEqual(self.ks5.constituents().count(), 9)
        self.assertEqual(self.ks4D2.definition_formal, r'X1 DEL DEL DEL D1')
        self.assertEqual(self.ks5D4.definition_formal, r'DEL DEL X3 DEL D1 D2 D3')

    @decl_endpoint('/api/oss/{item}/execute-operation', method='post')
    def test_execute_middle_operation(self):
        self.client.delete(f'/api/library/{self.ks4.model.pk}')
        self.operation4.refresh_from_db()
        self.ks5.refresh_from_db()
        self.assertEqual(self.operation4.result, None)
        self.assertEqual(self.ks5.constituents().count(), 3)

        data = {
            'target': self.operation4.pk,
            'positions': []
        }
        self.executeOK(data=data, item=self.owned_id)
        self.operation4.refresh_from_db()
        self.ks5.refresh_from_db()
        self.assertNotEqual(self.operation4.result, None)
        self.assertEqual(self.ks5.constituents().count(), 8)

    @decl_endpoint('/api/oss/relocate-constituents', method='post')
    def test_relocate_constituents_up(self):
        ks1_old_count = self.ks1.constituents().count()
        ks4_old_count = self.ks4.constituents().count()
        operation6 = self.owned.create_operation(
            alias='6',
            operation_type=OperationType.SYNTHESIS
        )
        self.owned.set_arguments(operation6.pk, [self.operation1, self.operation2])
        self.owned.execute_operation(operation6)
        operation6.refresh_from_db()
        ks6 = RSForm(operation6.result)
        ks6A1 = ks6.insert_new('A1')
        ks6_old_count = ks6.constituents().count()

        data = {
            'destination': self.ks1.model.pk,
            'items': [ks6A1.pk]
        }

        self.executeOK(data=data)
        ks6.refresh_from_db()
        self.ks1.refresh_from_db()
        self.ks4.refresh_from_db()

        self.assertEqual(ks6.constituents().count(), ks6_old_count)
        self.assertEqual(self.ks1.constituents().count(), ks1_old_count + 1)
        self.assertEqual(self.ks4.constituents().count(), ks4_old_count + 1)

    @decl_endpoint('/api/oss/relocate-constituents', method='post')
    def test_relocate_constituents_down(self):
        ks1_old_count = self.ks1.constituents().count()
        ks4_old_count = self.ks4.constituents().count()

        operation6 = self.owned.create_operation(
            alias='6',
            operation_type=OperationType.SYNTHESIS
        )
        self.owned.set_arguments(operation6.pk, [self.operation1, self.operation2])
        self.owned.execute_operation(operation6)
        operation6.refresh_from_db()
        ks6 = RSForm(operation6.result)
        ks6_old_count = ks6.constituents().count()

        data = {
            'destination': ks6.model.pk,
            'items': [self.ks1X2.pk]
        }

        self.executeOK(data=data)
        ks6.refresh_from_db()
        self.ks1.refresh_from_db()
        self.ks4.refresh_from_db()
        self.ks4D2.refresh_from_db()
        self.ks5D4.refresh_from_db()

        self.assertEqual(ks6.constituents().count(), ks6_old_count)
        self.assertEqual(self.ks1.constituents().count(), ks1_old_count - 1)
        self.assertEqual(self.ks4.constituents().count(), ks4_old_count - 1)
        self.assertEqual(self.ks4D2.definition_formal, r'DEL X2 X3 S1 D1')
        self.assertEqual(self.ks5D4.definition_formal, r'X1 X2 X3 S1 D1 D2 D3')
