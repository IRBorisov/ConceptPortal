''' Testing models: Argument. '''
from django.db.utils import IntegrityError
from django.test import TestCase

from apps.oss.models import Argument, Operation, OperationSchema, OperationType


class TestArgument(TestCase):
    ''' Testing Argument model. '''

    def setUp(self):
        self.oss = OperationSchema.create(alias='T1')

        self.operation1 = Operation.objects.create(
            oss=self.oss.model,
            alias='KS1',
            operation_type=OperationType.INPUT
        )
        self.operation2 = Operation.objects.create(
            oss=self.oss.model,
            alias='KS2',
            operation_type=OperationType.SYNTHESIS
        )
        self.operation3 = Operation.objects.create(
            oss=self.oss.model,
            alias='KS3',
            operation_type=OperationType.INPUT
        )
        self.argument = Argument.objects.create(
            operation=self.operation2,
            argument=self.operation1
        )


    def test_str(self):
        testStr = f'{self.operation1} -> {self.operation2}'
        self.assertEqual(str(self.argument), testStr)


    def test_order_positive_integer(self):
        with self.assertRaises(IntegrityError):
            Argument.objects.create(
                operation=self.operation2,
                argument=self.operation3,
                order=-1
            )


    def test_cascade_delete_operation(self):
        self.assertEqual(Argument.objects.count(), 1)
        self.operation2.delete()
        self.assertEqual(Argument.objects.count(), 0)


    def test_cascade_delete_argument(self):
        self.assertEqual(Argument.objects.count(), 1)
        self.operation1.delete()
        self.assertEqual(Argument.objects.count(), 0)
