''' Testing serializers '''
from django.test import TestCase
from apps.rsform.serializers import ExpressionSerializer


class TestExpressionSerializer(TestCase):
    def setUp(self):
        pass


    def test_validate(self):
        serializer = ExpressionSerializer(data={'expression': 'X1=X1'})
        self.assertTrue(serializer.is_valid(raise_exception=False))
        self.assertEqual(serializer.validated_data['expression'], 'X1=X1')


    def test_missing_data(self):
        serializer = ExpressionSerializer(data={})
        self.assertFalse(serializer.is_valid(raise_exception=False))
        serializer = ExpressionSerializer(data={'schema': 1})
        self.assertFalse(serializer.is_valid(raise_exception=False))
