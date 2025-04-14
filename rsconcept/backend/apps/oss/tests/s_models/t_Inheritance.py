''' Testing models: Inheritance. '''
from django.test import TestCase

from apps.oss.models import Inheritance, Operation, OperationSchema, OperationType
from apps.rsform.models import Constituenta, RSForm


class TestInheritance(TestCase):
    ''' Testing Inheritance model. '''


    def setUp(self):
        self.oss = OperationSchema.create(alias='T1')

        self.ks1 = RSForm.create(title='Test1', alias='KS1')
        self.ks2 = RSForm.create(title='Test2', alias='KS2')
        self.operation = Operation.objects.create(
            oss=self.oss.model,
            alias='KS1',
            operation_type=OperationType.INPUT,
            result=self.ks1.model
        )
        self.ks1_x1 = self.ks1.insert_new('X1')
        self.ks2_x1 = self.ks2.insert_new('X1')
        self.inheritance = Inheritance.objects.create(
            operation=self.operation,
            parent=self.ks1_x1,
            child=self.ks2_x1
        )


    def test_str(self):
        testStr = f'{self.ks1_x1} -> {self.ks2_x1}'
        self.assertEqual(str(self.inheritance), testStr)


    def test_cascade_delete_operation(self):
        self.assertEqual(Inheritance.objects.count(), 1)
        self.operation.delete()
        self.assertEqual(Inheritance.objects.count(), 0)


    def test_cascade_delete_parent(self):
        self.assertEqual(Inheritance.objects.count(), 1)
        self.ks1_x1.delete()
        self.assertEqual(Inheritance.objects.count(), 0)


    def test_cascade_delete_child(self):
        self.assertEqual(Inheritance.objects.count(), 1)
        self.ks2_x1.delete()
        self.assertEqual(Inheritance.objects.count(), 0)
