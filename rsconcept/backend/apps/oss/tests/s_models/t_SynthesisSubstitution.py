''' Testing models: SynthesisSubstitution. '''
from unittest import result

from django.test import TestCase

from apps.oss.models import (
    Argument,
    Operation,
    OperationSchema,
    OperationType,
    SynthesisSubstitution
)
from apps.rsform.models import RSForm


class TestSynthesisSubstitution(TestCase):
    ''' Testing SynthesisSubstitution model. '''

    def setUp(self):
        self.oss = OperationSchema.objects.create(alias='T1')

        self.ks1 = RSForm.objects.create(alias='KS1', title='Test1')
        self.ks1x1 = self.ks1.insert_new('X1', term_resolved='X1_1')
        self.ks2 = RSForm.objects.create(alias='KS2', title='Test2')
        self.ks2x1 = self.ks2.insert_new('X2', term_resolved='X1_2')

        self.operation1 = Operation.objects.create(
            oss=self.oss,
            alias='KS1',
            operation_type=OperationType.INPUT,
            result=self.ks1)
        self.operation2 = Operation.objects.create(
            oss=self.oss,
            alias='KS2',
            operation_type=OperationType.INPUT,
            result=self.ks1)
        self.operation3 = Operation.objects.create(oss=self.oss, alias='KS3', operation_type=OperationType.SYNTHESIS)
        Argument.objects.create(
            operation=self.operation3,
            argument=self.operation1
        )
        Argument.objects.create(
            operation=self.operation3,
            argument=self.operation2
        )

        self.substitution = SynthesisSubstitution.objects.create(
            operation=self.operation3,
            original=self.ks1x1,
            substitution=self.ks2x1,
            transfer_term=False
        )


    def test_str(self):
        testStr = f'{self.ks1x1} -> {self.ks2x1}'
        self.assertEqual(str(self.substitution), testStr)


    def test_cascade_delete_operation(self):
        self.assertEqual(SynthesisSubstitution.objects.count(), 1)
        self.operation3.delete()
        self.assertEqual(SynthesisSubstitution.objects.count(), 0)


    def test_cascade_delete_original(self):
        self.assertEqual(SynthesisSubstitution.objects.count(), 1)
        self.ks1x1.delete()
        self.assertEqual(SynthesisSubstitution.objects.count(), 0)


    def test_cascade_delete_substitution(self):
        self.assertEqual(SynthesisSubstitution.objects.count(), 1)
        self.ks2x1.delete()
        self.assertEqual(SynthesisSubstitution.objects.count(), 0)
