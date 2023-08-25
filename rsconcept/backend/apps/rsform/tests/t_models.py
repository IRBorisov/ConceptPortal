''' Testing models '''
import json
from django.test import TestCase
from django.db.utils import IntegrityError
from django.forms import ValidationError

from apps.rsform.models import (
    RSForm,
    Constituenta,
    CstType,
    User,
    LibraryItem,
    LibraryItemType
)


class TestConstituenta(TestCase):
    ''' Testing Constituenta model. '''
    def setUp(self):
        self.schema1 = LibraryItem.objects.create(item_type=LibraryItemType.RSFORM, title='Test1')
        self.schema2 = LibraryItem.objects.create(item_type=LibraryItemType.RSFORM, title='Test2')

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


class TestLibraryItem(TestCase):
    ''' Testing LibraryItem model. '''
    def setUp(self):
        self.user1 = User.objects.create(username='User1')
        self.user2 = User.objects.create(username='User2')
        self.assertNotEqual(self.user1, self.user2)

    def test_str(self):
        testStr = 'Test123'
        item = LibraryItem.objects.create(item_type=LibraryItemType.RSFORM,
                                    title=testStr, owner=self.user1, alias='КС1')
        self.assertEqual(str(item), testStr)

    def test_url(self):
        testStr = 'Test123'
        item = LibraryItem.objects.create(item_type=LibraryItemType.RSFORM,
                                  title=testStr, owner=self.user1, alias='КС1')
        self.assertEqual(item.get_absolute_url(), f'/api/library/{item.id}/')

    def test_create_default(self):
        item = LibraryItem.objects.create(item_type=LibraryItemType.RSFORM, title='Test')
        self.assertIsNone(item.owner)
        self.assertEqual(item.title, 'Test')
        self.assertEqual(item.alias, '')
        self.assertEqual(item.comment, '')
        self.assertEqual(item.is_common, False)
        self.assertEqual(item.is_canonical, False)

    def test_create(self):
        item = LibraryItem.objects.create(
            item_type=LibraryItemType.RSFORM,
            title='Test',
            owner=self.user1,
            alias='KS1',
            comment='Test comment',
            is_common=True,
            is_canonical=True
        )
        self.assertEqual(item.owner, self.user1)
        self.assertEqual(item.title, 'Test')
        self.assertEqual(item.alias, 'KS1')
        self.assertEqual(item.comment, 'Test comment')
        self.assertEqual(item.is_common, True)
        self.assertEqual(item.is_canonical, True)


class TestRSForm(TestCase):
    ''' Testing RSForm wrapper. '''
    def setUp(self):
        self.user1 = User.objects.create(username='User1')
        self.user2 = User.objects.create(username='User2')
        self.assertNotEqual(self.user1, self.user2)

    def test_constituents(self):
        schema1 = RSForm.create(title='Test1')
        schema2 = RSForm.create(title='Test2')
        self.assertFalse(schema1.constituents().exists())
        self.assertFalse(schema2.constituents().exists())

        Constituenta.objects.create(alias='X1', schema=schema1.item, order=1)
        Constituenta.objects.create(alias='X2', schema=schema1.item, order=2)
        self.assertTrue(schema1.constituents().exists())
        self.assertFalse(schema2.constituents().exists())
        self.assertEqual(schema1.constituents().count(), 2)

    def test_insert_at(self):
        schema = RSForm.create(title='Test')
        cst1 = schema.insert_at(1, 'X1', CstType.BASE)
        self.assertEqual(cst1.order, 1)
        self.assertEqual(cst1.schema, schema.item)

        cst2 = schema.insert_at(1, 'X2', CstType.BASE)
        cst1.refresh_from_db()
        self.assertEqual(cst2.order, 1)
        self.assertEqual(cst2.schema, schema.item)
        self.assertEqual(cst1.order, 2)

        cst3 = schema.insert_at(4, 'X3', CstType.BASE)
        cst2.refresh_from_db()
        cst1.refresh_from_db()
        self.assertEqual(cst3.order, 3)
        self.assertEqual(cst3.schema, schema.item)
        self.assertEqual(cst2.order, 1)
        self.assertEqual(cst1.order, 2)

        cst4 = schema.insert_at(3, 'X4', CstType.BASE)
        cst3.refresh_from_db()
        cst2.refresh_from_db()
        cst1.refresh_from_db()
        self.assertEqual(cst4.order, 3)
        self.assertEqual(cst4.schema, schema.item)
        self.assertEqual(cst3.order, 4)
        self.assertEqual(cst2.order, 1)
        self.assertEqual(cst1.order, 2)

        with self.assertRaises(ValidationError):
            schema.insert_at(0, 'X5', CstType.BASE)

    def test_insert_at_reorder(self):
        schema = RSForm.create(title='Test')
        schema.insert_at(1, 'X1', CstType.BASE)
        d1 = schema.insert_at(2, 'D1', CstType.TERM)
        d2 = schema.insert_at(1, 'D2', CstType.TERM)
        d1.refresh_from_db()
        self.assertEqual(d1.order, 3)
        self.assertEqual(d2.order, 2)

        x2 = schema.insert_at(4, 'X2', CstType.BASE)
        self.assertEqual(x2.order, 2)

    def test_insert_last(self):
        schema = RSForm.create(title='Test')
        cst1 = schema.insert_last('X1', CstType.BASE)
        self.assertEqual(cst1.order, 1)
        self.assertEqual(cst1.schema, schema.item)

        cst2 = schema.insert_last('X2', CstType.BASE)
        self.assertEqual(cst2.order, 2)
        self.assertEqual(cst2.schema, schema.item)
        self.assertEqual(cst1.order, 1)

    def test_create_cst_resolve(self):
        schema = RSForm.create(title='Test')
        cst1 = schema.insert_last('X1', CstType.BASE)
        cst1.term_raw = '@{X2|datv}'
        cst1.definition_raw = '@{X1|datv} @{X2|datv}'
        cst1.save()
        cst2 = schema.create_cst({
            'alias': 'X2', 
            'cst_type': CstType.BASE,
            'term_raw': 'слон',
            'definition_raw': '@{X1|plur} @{X2|plur}'
        })
        cst1.refresh_from_db()
        self.assertEqual(cst1.term_resolved, 'слону')
        self.assertEqual(cst1.definition_resolved, 'слону слону')
        self.assertEqual(cst2.term_resolved, 'слон')
        self.assertEqual(cst2.definition_resolved, 'слонам слоны')

    def test_delete_cst(self):
        schema = RSForm.create(title='Test')
        x1 = schema.insert_last('X1', CstType.BASE)
        x2 = schema.insert_last('X2', CstType.BASE)
        d1 = schema.insert_last('D1', CstType.TERM)
        d2 = schema.insert_last('D2', CstType.TERM)
        schema.delete_cst([x2, d1])
        x1.refresh_from_db()
        d2.refresh_from_db()
        schema.item.refresh_from_db()
        self.assertEqual(schema.constituents().count(), 2)
        self.assertEqual(x1.order, 1)
        self.assertEqual(d2.order, 2)

    def test_move_cst(self):
        schema = RSForm.create(title='Test')
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
        schema = RSForm.create(title='Test')
        x1 = schema.insert_last('X1', CstType.BASE)
        x2 = schema.insert_last('X2', CstType.BASE)
        schema.move_cst([x1], 2)
        x1.refresh_from_db()
        x2.refresh_from_db()
        self.assertEqual(x1.order, 2)
        self.assertEqual(x2.order, 1)

    def test_reset_aliases(self):
        schema = RSForm.create(title='Test')
        x1 = schema.insert_last('X11', CstType.BASE)
        x2 = schema.insert_last('X21', CstType.BASE)
        d1 = schema.insert_last('D11', CstType.TERM)
        x1.term_raw = 'человек'
        x1.term_resolved = 'человек'
        d1.convention = 'D11 - cool'
        d1.definition_formal = 'X21=X21'
        d1.term_raw = '@{X21|sing}'
        d1.definition_raw = '@{X11|datv}'
        d1.definition_resolved = 'test'
        d1.save()
        x1.save()

        schema.reset_aliases()
        x1.refresh_from_db()
        x2.refresh_from_db()
        d1.refresh_from_db()

        self.assertEqual(x1.alias, 'X1')
        self.assertEqual(x2.alias, 'X2')
        self.assertEqual(d1.alias, 'D1')
        self.assertEqual(d1.convention, 'D1 - cool')
        self.assertEqual(d1.term_raw, '@{X2|sing}')
        self.assertEqual(d1.definition_raw, '@{X1|datv}')
        self.assertEqual(d1.definition_resolved, 'test')
