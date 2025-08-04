''' Testing models: Reference. '''
from django.test import TestCase

from apps.oss.models import Operation, OperationSchema, OperationType, Reference
from apps.rsform.models import RSForm


class TestReference(TestCase):
    ''' Testing Reference model. '''


    def setUp(self):
        self.oss = OperationSchema.create(alias='T1')

        self.operation1 = Operation.objects.create(
            oss=self.oss.model,
            alias='KS1',
            operation_type=OperationType.INPUT,
        )
        self.operation2 = Operation.objects.create(
            oss=self.oss.model,
            operation_type=OperationType.REFERENCE,
        )
        self.reference = Reference.objects.create(
            reference=self.operation2,
            target=self.operation1
        )


    def test_str(self):
        testStr = f'{self.operation2} -> {self.operation1}'
        self.assertEqual(str(self.reference), testStr)


    def test_cascade_delete_operation(self):
        self.assertEqual(Reference.objects.count(), 1)
        self.operation2.delete()
        self.assertEqual(Reference.objects.count(), 0)


    def test_cascade_delete_target(self):
        self.assertEqual(Reference.objects.count(), 1)
        self.operation1.delete()
        self.assertEqual(Reference.objects.count(), 0)
