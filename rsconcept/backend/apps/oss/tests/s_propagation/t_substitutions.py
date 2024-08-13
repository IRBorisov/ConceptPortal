''' Testing API: Change substitutions in OSS. '''

from apps.oss.models import OperationSchema, OperationType
from apps.rsform.models import Constituenta, CstType, RSForm
from shared.EndpointTester import EndpointTester, decl_endpoint


class TestChangeSubstitutions(EndpointTester):
    ''' Testing Substitutions change propagation in OSS. '''

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
        self.owned.set_arguments(self.operation4, [self.operation1, self.operation2])
        self.owned.set_substitutions(self.operation4, [{
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
        self.owned.set_arguments(self.operation5, [self.operation4, self.operation3])
        self.owned.set_substitutions(self.operation5, [{
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

    @decl_endpoint('/api/rsforms/{schema}/substitute', method='patch')
    def test_substitute_original(self):
        data = {'substitutions': [{
            'original': self.ks1X1.pk,
            'substitution': self.ks1X2.pk
        }]}
        self.executeOK(data=data, schema=self.ks1.model.pk)
        self.ks4D1.refresh_from_db()
        self.ks4D2.refresh_from_db()
        self.ks5D4.refresh_from_db()
        subs1_2 = self.operation4.getSubstitutions()
        self.assertEqual(subs1_2.count(), 1)
        self.assertEqual(subs1_2.first().original, self.ks1X2)
        self.assertEqual(subs1_2.first().substitution, self.ks2S1)
        subs3_4 = self.operation5.getSubstitutions()
        self.assertEqual(subs3_4.count(), 1)
        self.assertEqual(subs3_4.first().original, self.ks4S1)
        self.assertEqual(subs3_4.first().substitution, self.ks3X1)
        self.assertEqual(self.ks4D1.definition_formal, r'S1 S1')
        self.assertEqual(self.ks4D2.definition_formal, r'S1 X2 X3 S1 D1')
        self.assertEqual(self.ks5D4.definition_formal, r'X1 X2 X3 X1 D1 D2 D3')

    @decl_endpoint('/api/rsforms/{schema}/substitute', method='patch')
    def test_substitute_substitution(self):
        data = {'substitutions': [{
            'original': self.ks2S1.pk,
            'substitution': self.ks2X1.pk
        }]}
        self.executeOK(data=data, schema=self.ks2.model.pk)
        self.ks4D1.refresh_from_db()
        self.ks4D2.refresh_from_db()
        self.ks5D4.refresh_from_db()
        subs1_2 = self.operation4.getSubstitutions()
        self.assertEqual(subs1_2.count(), 1)
        self.assertEqual(subs1_2.first().original, self.ks1X1)
        self.assertEqual(subs1_2.first().substitution, self.ks2X1)
        subs3_4 = self.operation5.getSubstitutions()
        self.assertEqual(subs3_4.count(), 1)
        self.assertEqual(subs3_4.first().original, self.ks4X1)
        self.assertEqual(subs3_4.first().substitution, self.ks3X1)
        self.assertEqual(self.ks4D1.definition_formal, r'X2 X1')
        self.assertEqual(self.ks4D2.definition_formal, r'X1 X2 X3 X2 D1')
        self.assertEqual(self.ks5D4.definition_formal, r'X1 X2 X3 X2 D1 D2 D3')

    @decl_endpoint('/api/rsforms/{schema}/delete-multiple-cst', method='patch')
    def test_delete_original(self):
        data = {'items': [self.ks1X1.pk, self.ks1D1.pk]}
        self.executeOK(data=data, schema=self.ks1.model.pk)
        self.ks4D2.refresh_from_db()
        self.ks5D4.refresh_from_db()
        subs1_2 = self.operation4.getSubstitutions()
        self.assertEqual(subs1_2.count(), 0)
        subs3_4 = self.operation5.getSubstitutions()
        self.assertEqual(subs3_4.count(), 1)
        self.assertEqual(self.ks5.constituents().count(), 7)
        self.assertEqual(self.ks4D2.definition_formal, r'X1 X2 X3 S1 DEL')
        self.assertEqual(self.ks5D4.definition_formal, r'X1 X2 X3 S1 D1 DEL D3')

    @decl_endpoint('/api/rsforms/{schema}/delete-multiple-cst', method='patch')
    def test_delete_substitution(self):
        data = {'items': [self.ks2S1.pk, self.ks2X2.pk]}
        self.executeOK(data=data, schema=self.ks2.model.pk)
        self.ks4D1.refresh_from_db()
        self.ks4D2.refresh_from_db()
        self.ks5D4.refresh_from_db()
        subs1_2 = self.operation4.getSubstitutions()
        self.assertEqual(subs1_2.count(), 0)
        subs3_4 = self.operation5.getSubstitutions()
        self.assertEqual(subs3_4.count(), 1)
        self.assertEqual(self.ks5.constituents().count(), 7)
        self.assertEqual(self.ks4D1.definition_formal, r'X4 X1')
        self.assertEqual(self.ks4D2.definition_formal, r'X1 X2 DEL DEL D1')
        self.assertEqual(self.ks5D4.definition_formal, r'X1 X2 DEL DEL D1 D2 D3')
