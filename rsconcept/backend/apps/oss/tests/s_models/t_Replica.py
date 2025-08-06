''' Testing models: Replica. '''
from django.test import TestCase

from apps.oss.models import Operation, OperationSchema, OperationType, Replica
from apps.rsform.models import RSForm


class TestReplica(TestCase):
    ''' Testing Replica model. '''


    def setUp(self):
        self.oss = OperationSchema.create(alias='T1')

        self.operation1 = Operation.objects.create(
            oss=self.oss.model,
            alias='KS1',
            operation_type=OperationType.INPUT,
        )
        self.operation2 = Operation.objects.create(
            oss=self.oss.model,
            operation_type=OperationType.REPLICA,
        )
        self.replicas = Replica.objects.create(
            replica=self.operation2,
            original=self.operation1
        )


    def test_str(self):
        testStr = f'{self.operation2} -> {self.operation1}'
        self.assertEqual(str(self.replicas), testStr)


    def test_cascade_delete_operation(self):
        self.assertEqual(Replica.objects.count(), 1)
        self.operation2.delete()
        self.assertEqual(Replica.objects.count(), 0)


    def test_cascade_delete_target(self):
        self.assertEqual(Replica.objects.count(), 1)
        self.operation1.delete()
        self.assertEqual(Replica.objects.count(), 0)
