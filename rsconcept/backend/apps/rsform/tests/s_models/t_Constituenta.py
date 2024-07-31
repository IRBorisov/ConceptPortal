''' Testing models: Constituenta. '''
from django.db.utils import IntegrityError
from django.forms import ValidationError
from django.test import TestCase

from apps.rsform.models import Constituenta, CstType, RSForm


class TestConstituenta(TestCase):
    ''' Testing Constituenta model. '''

    def setUp(self):
        self.schema1 = RSForm.create(title='Test1')
        self.schema2 = RSForm.create(title='Test2')


    def test_str(self):
        testStr = 'X1'
        cst = Constituenta.objects.create(alias=testStr, schema=self.schema1.model, order=1, convention='Test')
        self.assertEqual(str(cst), testStr)


    def test_order_not_null(self):
        with self.assertRaises(IntegrityError):
            Constituenta.objects.create(alias='X1', schema=self.schema1.model)


    def test_order_positive_integer(self):
        with self.assertRaises(IntegrityError):
            Constituenta.objects.create(alias='X1', schema=self.schema1.model, order=-1)


    def test_order_min_value(self):
        with self.assertRaises(ValidationError):
            cst = Constituenta.objects.create(alias='X1', schema=self.schema1.model, order=0)
            cst.full_clean()


    def test_schema_not_null(self):
        with self.assertRaises(IntegrityError):
            Constituenta.objects.create(alias='X1', order=1)


    def test_create_default(self):
        cst = Constituenta.objects.create(
            alias='X1',
            schema=self.schema1.model,
            order=1
        )
        self.assertEqual(cst.schema, self.schema1.model)
        self.assertEqual(cst.order, 1)
        self.assertEqual(cst.alias, 'X1')
        self.assertEqual(cst.cst_type, CstType.BASE)
        self.assertEqual(cst.convention, '')
        self.assertEqual(cst.definition_formal, '')
        self.assertEqual(cst.term_raw, '')
        self.assertEqual(cst.term_resolved, '')
        self.assertEqual(cst.term_forms, [])
        self.assertEqual(cst.definition_resolved, '')
        self.assertEqual(cst.definition_raw, '')
