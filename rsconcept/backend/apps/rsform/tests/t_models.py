''' Testing models '''
import json
from django.test import TestCase
from django.db.utils import IntegrityError
from django.forms import ValidationError

from apps.rsform.models import (
    RSForm,
    Constituenta,
    CstType,
    User
)


class TestConstituenta(TestCase):
    def setUp(self):
        self.schema1 = RSForm.objects.create(title='Test1')
        self.schema2 = RSForm.objects.create(title='Test2')

    def test_str(self):
        testStr = 'X1'
        cst = Constituenta.objects.create(alias=testStr, schema=self.schema1, order=1, convention='Test')
        self.assertEqual(str(cst), testStr)

    def test_url(self):
        testStr = 'X1'
        cst = Constituenta.objects.create(alias=testStr, schema=self.schema1, order=1, convention='Test')
        self.assertEqual(cst.get_absolute_url(), f'/api/constituents/{cst.id}/')

    def test_order_not_null(self):
        with self.assertRaises(IntegrityError):
            Constituenta.objects.create(alias='X1', schema=self.schema1)

    def test_order_positive_integer(self):
        with self.assertRaises(IntegrityError):
            Constituenta.objects.create(alias='X1', schema=self.schema1, order=-1)

    def test_order_min_value(self):
        with self.assertRaises(ValidationError):
            cst = Constituenta.objects.create(alias='X1', schema=self.schema1, order=0)
            cst.full_clean()

    def test_schema_not_null(self):
        with self.assertRaises(IntegrityError):
            Constituenta.objects.create(alias='X1', order=1)

    def test_create_default(self):
        cst = Constituenta.objects.create(
            alias='X1',
            schema=self.schema1,
            order=1
        )
        self.assertEqual(cst.schema, self.schema1)
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


class TestRSForm(TestCase):
    def setUp(self):
        self.user1 = User.objects.create(username='User1')
        self.user2 = User.objects.create(username='User2')
        self.assertNotEqual(self.user1, self.user2)

    def test_str(self):
        testStr = 'Test123'
        schema = RSForm.objects.create(title=testStr, owner=self.user1, alias='КС1')
        self.assertEqual(str(schema), testStr)

    def test_url(self):
        testStr = 'Test123'
        schema = RSForm.objects.create(title=testStr, owner=self.user1, alias='КС1')
        self.assertEqual(schema.get_absolute_url(), f'/api/rsforms/{schema.id}/')

    def test_create_default(self):
        schema = RSForm.objects.create(title='Test')
        self.assertIsNone(schema.owner)
        self.assertEqual(schema.title, 'Test')
        self.assertEqual(schema.alias, '')
        self.assertEqual(schema.comment, '')
        self.assertEqual(schema.is_common, False)

    def test_create(self):
        schema = RSForm.objects.create(
            title='Test',
            owner=self.user1,
            alias='KS1',
            comment='Test comment',
            is_common=True
        )
        self.assertEqual(schema.owner, self.user1)
        self.assertEqual(schema.title, 'Test')
        self.assertEqual(schema.alias, 'KS1')
        self.assertEqual(schema.comment, 'Test comment')
        self.assertEqual(schema.is_common, True)

    def test_constituents(self):
        schema1 = RSForm.objects.create(title='Test1')
        schema2 = RSForm.objects.create(title='Test2')
        self.assertFalse(schema1.constituents().exists())
        self.assertFalse(schema2.constituents().exists())

        Constituenta.objects.create(alias='X1', schema=schema1, order=1)
        Constituenta.objects.create(alias='X2', schema=schema1, order=2)
        self.assertTrue(schema1.constituents().exists())
        self.assertFalse(schema2.constituents().exists())
        self.assertEqual(schema1.constituents().count(), 2)

    def test_insert_at(self):
        schema = RSForm.objects.create(title='Test')
        cst1 = schema.insert_at(1, 'X1', CstType.BASE)
        self.assertEqual(cst1.order, 1)
        self.assertEqual(cst1.schema, schema)

        cst2 = schema.insert_at(1, 'X2', CstType.BASE)
        cst1.refresh_from_db()
        self.assertEqual(cst2.order, 1)
        self.assertEqual(cst2.schema, schema)
        self.assertEqual(cst1.order, 2)

        cst3 = schema.insert_at(4, 'X3', CstType.BASE)
        cst2.refresh_from_db()
        cst1.refresh_from_db()
        self.assertEqual(cst3.order, 3)
        self.assertEqual(cst3.schema, schema)
        self.assertEqual(cst2.order, 1)
        self.assertEqual(cst1.order, 2)

        cst4 = schema.insert_at(3, 'X4', CstType.BASE)
        cst3.refresh_from_db()
        cst2.refresh_from_db()
        cst1.refresh_from_db()
        self.assertEqual(cst4.order, 3)
        self.assertEqual(cst4.schema, schema)
        self.assertEqual(cst3.order, 4)
        self.assertEqual(cst2.order, 1)
        self.assertEqual(cst1.order, 2)

        with self.assertRaises(ValidationError):
            schema.insert_at(0, 'X5', CstType.BASE)

    def test_insert_at_reorder(self):
        schema = RSForm.objects.create(title='Test')
        schema.insert_at(1, 'X1', CstType.BASE)
        d1 = schema.insert_at(2, 'D1', CstType.TERM)
        d2 = schema.insert_at(1, 'D2', CstType.TERM)
        d1.refresh_from_db()
        self.assertEqual(d1.order, 3)
        self.assertEqual(d2.order, 2)

        x2 = schema.insert_at(4, 'X2', CstType.BASE)
        self.assertEqual(x2.order, 2)

    def test_insert_last(self):
        schema = RSForm.objects.create(title='Test')
        cst1 = schema.insert_last('X1', CstType.BASE)
        self.assertEqual(cst1.order, 1)
        self.assertEqual(cst1.schema, schema)

        cst2 = schema.insert_last('X2', CstType.BASE)
        self.assertEqual(cst2.order, 2)
        self.assertEqual(cst2.schema, schema)
        self.assertEqual(cst1.order, 1)

    def test_delete_cst(self):
        schema = RSForm.objects.create(title='Test')
        x1 = schema.insert_last('X1', CstType.BASE)
        x2 = schema.insert_last('X2', CstType.BASE)
        d1 = schema.insert_last('D1', CstType.TERM)
        d2 = schema.insert_last('D2', CstType.TERM)
        schema.delete_cst([x2, d1])
        x1.refresh_from_db()
        d2.refresh_from_db()
        schema.refresh_from_db()
        self.assertEqual(schema.constituents().count(), 2)
        self.assertEqual(x1.order, 1)
        self.assertEqual(d2.order, 2)

    def test_move_cst(self):
        schema = RSForm.objects.create(title='Test')
        x1 = schema.insert_last('X1', CstType.BASE)
        x2 = schema.insert_last('X2', CstType.BASE)
        d1 = schema.insert_last('D1', CstType.TERM)
        d2 = schema.insert_last('D2', CstType.TERM)
        schema.move_cst([x2, d2], 1)
        x1.refresh_from_db()
        x2.refresh_from_db()
        d1.refresh_from_db()
        d2.refresh_from_db()
        self.assertEqual(x1.order, 2)
        self.assertEqual(x2.order, 1)
        self.assertEqual(d1.order, 4)
        self.assertEqual(d2.order, 3)

    def test_move_cst_down(self):
        schema = RSForm.objects.create(title='Test')
        x1 = schema.insert_last('X1', CstType.BASE)
        x2 = schema.insert_last('X2', CstType.BASE)
        schema.move_cst([x1], 2)
        x1.refresh_from_db()
        x2.refresh_from_db()
        self.assertEqual(x1.order, 2)
        self.assertEqual(x2.order, 1)

    def test_to_json(self):
        schema = RSForm.objects.create(title='Test', alias='KS1', comment='Test')
        x1 = schema.insert_at(4, 'X1', CstType.BASE)
        x2 = schema.insert_at(1, 'X2', CstType.BASE)
        expected = json.loads(
            f'{{"type": "rsform", "title": "Test", "alias": "KS1", '
            f'"comment": "Test", "items": '
            f'[{{"entityUID": {x2.id}, "type": "constituenta", "cstType": "basic", "alias": "X2", "convention": "", '
            f'"term": {{"raw": "", "resolved": "", "forms": []}}, '
            f'"definition": {{"formal": "", "text": {{"raw": "", "resolved": ""}}}}}}, '
            f'{{"entityUID": {x1.id}, "type": "constituenta", "cstType": "basic", "alias": "X1", "convention": "", '
            f'"term": {{"raw": "", "resolved": "", "forms": []}}, '
            f'"definition": {{"formal": "", "text": {{"raw": "", "resolved": ""}}}}}}]}}'
        )
        self.assertEqual(schema.to_json(), expected)

    def test_import_json(self):
        input = json.loads(
            '{"type": "rsform", "title": "Test", "alias": "KS1", '
            '"comment": "Test", "items": '
            '[{"entityUID": 1337, "type": "constituenta", "cstType": "basic", "alias": "X1", "convention": "", '
            '"term": {"raw": "", "resolved": ""}, '
            '"definition": {"formal": "123", "text": {"raw": "", "resolved": ""}}}, '
            '{"entityUID": 55, "type": "constituenta", "cstType": "basic", "alias": "X2", "convention": "", '
            '"term": {"raw": "", "resolved": ""}, '
            '"definition": {"formal": "", "text": {"raw": "", "resolved": ""}}}]}'
        )
        schema = RSForm.import_json(self.user1, input, False)
        self.assertEqual(schema.owner, self.user1)
        self.assertEqual(schema.title, 'Test')
        self.assertEqual(schema.alias, 'KS1')
        self.assertEqual(schema.is_common, False)
        constituents = schema.constituents().order_by('order')
        self.assertEqual(constituents.count(), 2)
        self.assertEqual(constituents[0].alias, 'X1')
        self.assertEqual(constituents[0].definition_formal, '123')
