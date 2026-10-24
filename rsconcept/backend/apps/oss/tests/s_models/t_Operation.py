''' Testing models: Operation. '''
from django.test import TestCase

from apps.oss.models import Operation, OperationSchema


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
