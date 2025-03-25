''' Testing models: Operation. '''
from django.test import TestCase

from apps.library.models import LibraryItem, LibraryItemType
from apps.oss.models import Operation, OperationSchema, OperationType
from apps.rsform.models import RSForm


class TestOperation(TestCase):
    ''' Testing Operation model. '''

    def setUp(self):
        self.oss = OperationSchema.create(alias='T1')
        self.operation = Operation.objects.create(
            oss=self.oss.model,
            alias='KS1'
        )


    def test_str(self):
        testStr = 'Операция KS1'
        self.assertEqual(str(self.operation), testStr)


    def test_create_default(self):
        self.assertEqual(self.operation.oss, self.oss.model)
        self.assertEqual(self.operation.operation_type, OperationType.INPUT)
        self.assertEqual(self.operation.result, None)
        self.assertEqual(self.operation.alias, 'KS1')
        self.assertEqual(self.operation.title, '')
        self.assertEqual(self.operation.description, '')
        self.assertEqual(self.operation.position_x, 0)
        self.assertEqual(self.operation.position_y, 0)
