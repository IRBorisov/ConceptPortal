''' Testing API: Propagate changes through references in OSS. '''

from apps.oss.models import OperationSchema, OperationType
from apps.rsform.models import Constituenta, CstType, RSForm
from shared.EndpointTester import EndpointTester, decl_endpoint


class ReferencePropagationTestCase(EndpointTester):
    ''' Test propagation through references in OSS. '''

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
        self.ks1X1 = self.ks1.insert_last('X1', convention='KS1X1')
        self.ks1X2 = self.ks1.insert_last('X2', convention='KS1X2')
        self.ks1D1 = self.ks1.insert_last('D1', definition_formal='X1 X2', convention='KS1D1')

        self.ks2 = RSForm.create(
            alias='KS2',
            title='Test2',
            owner=self.user
        )
        self.ks2X1 = self.ks2.insert_last('X1', convention='KS2X1')
        self.ks2X2 = self.ks2.insert_last('X2', convention='KS2X2')
        self.ks2S1 = self.ks2.insert_last(
            alias='S1',
            definition_formal=r'ℬ(X1)',
            convention='KS2S1'
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
        self.operation3 = self.owned.create_reference(self.operation1)

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
        self.ks4D2 = self.ks4.insert_last(
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
            'substitution': self.ks1X2
        }])
        self.owned.execute_operation(self.operation5)
        self.operation5.refresh_from_db()
        self.ks5 = RSForm(self.operation5.result)
        self.ks5D4 = self.ks5.insert_last(
            alias='D4',
            definition_formal=r'X1 X2 X3 X4 S1 D1 D2 D3',
            convention='KS5D4'
        )

        self.operation6 = self.owned.create_operation(
            alias='6',
            operation_type=OperationType.SYNTHESIS
        )
        self.owned.set_arguments(self.operation6.pk, [self.operation2, self.operation3])
        self.owned.set_substitutions(self.operation6.pk, [{
            'original': self.ks2X1,
            'substitution': self.ks1X1
        }])
        self.owned.execute_operation(self.operation6)
        self.operation6.refresh_from_db()
        self.ks6 = RSForm(self.operation6.result)
        self.ks6D2 = self.ks6.insert_last(
            alias='D2',
            definition_formal=r'X1 X2 X3 S1 D1',
            convention='KS6D2'
        )

        self.layout_data = [
            {'nodeID': 'o' + str(self.operation1.pk), 'x': 0, 'y': 0, 'width': 150, 'height': 40},
            {'nodeID': 'o' + str(self.operation2.pk), 'x': 0, 'y': 0, 'width': 150, 'height': 40},
            {'nodeID': 'o' + str(self.operation3.pk), 'x': 0, 'y': 0, 'width': 150, 'height': 40},
            {'nodeID': 'o' + str(self.operation4.pk), 'x': 0, 'y': 0, 'width': 150, 'height': 40},
            {'nodeID': 'o' + str(self.operation5.pk), 'x': 0, 'y': 0, 'width': 150, 'height': 40},
            {'nodeID': 'o' + str(self.operation6.pk), 'x': 0, 'y': 0, 'width': 150, 'height': 40},
        ]
        layout = OperationSchema.layoutQ(self.owned_id)
        layout.data = self.layout_data
        layout.save()


    def test_reference_creation(self):
        ''' Test reference creation. '''
        self.assertEqual(self.operation1.result, self.operation3.result)
        self.assertEqual(self.ks1.constituentsQ().count(), 3)
        self.assertEqual(self.ks2.constituentsQ().count(), 3)
        self.assertEqual(self.ks4.constituentsQ().count(), 6)
        self.assertEqual(self.ks5.constituentsQ().count(), 9)
        self.assertEqual(self.ks6.constituentsQ().count(), 6)


    @decl_endpoint('/api/oss/{item}/delete-operation', method='patch')
    def test_delete_target_propagation(self):
        ''' Test propagation when deleting a target operation. '''
        data = {
            'layout': self.layout_data,
            'target': self.operation1.pk
        }
        self.executeOK(data=data, item=self.owned_id)
        self.assertEqual(self.ks6.constituentsQ().count(), 4)
       # self.assertEqual(self.ks5.constituentsQ().count(), 5)

# TODO: add more tests
