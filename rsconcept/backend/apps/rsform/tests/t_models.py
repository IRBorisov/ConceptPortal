''' Testing models '''
import json
from django.test import TestCase
from django.db.utils import IntegrityError
from django.forms import ValidationError

from apps.rsform.models import (
    RSForm, Constituenta, CstType,
    User,
    LibraryItem, LibraryItemType, Subscription
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
        self.assertEqual(cst.get_absolute_url(), f'/api/constituents/{cst.id}')


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
        item = LibraryItem.objects.create(
            item_type=LibraryItemType.RSFORM,
            title=testStr,
            owner=self.user1,
            alias='КС1'
        )
        self.assertEqual(str(item), testStr)


    def test_url(self):
        testStr = 'Test123'
        item = LibraryItem.objects.create(
            item_type=LibraryItemType.RSFORM,
            title=testStr,
            owner=self.user1,
            alias='КС1'
        )
        self.assertEqual(item.get_absolute_url(), f'/api/library/{item.id}')


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
        self.assertTrue(Subscription.objects.filter(user=item.owner, item=item).exists())


    def test_subscribe(self):
        item = LibraryItem.objects.create(item_type=LibraryItemType.RSFORM, title='Test')
        self.assertEqual(len(item.subscribers()), 0)

        self.assertTrue(Subscription.subscribe(self.user1, item))
        self.assertEqual(len(item.subscribers()), 1)
        self.assertTrue(self.user1 in item.subscribers())

        self.assertFalse(Subscription.subscribe(self.user1, item))
        self.assertEqual(len(item.subscribers()), 1)

        self.assertTrue(Subscription.subscribe(self.user2, item))
        self.assertEqual(len(item.subscribers()), 2)
        self.assertTrue(self.user1 in item.subscribers())
        self.assertTrue(self.user2 in item.subscribers())

        self.user1.delete()
        self.assertEqual(len(item.subscribers()), 1)


    def test_unsubscribe(self):
        item = LibraryItem.objects.create(item_type=LibraryItemType.RSFORM, title='Test')
        self.assertFalse(Subscription.unsubscribe(self.user1, item))
        Subscription.subscribe(self.user1, item)
        Subscription.subscribe(self.user2, item)
        self.assertEqual(len(item.subscribers()), 2)

        self.assertTrue(Subscription.unsubscribe(self.user1, item))
        self.assertEqual(len(item.subscribers()), 1)
        self.assertTrue(self.user2 in item.subscribers())

        self.assertFalse(Subscription.unsubscribe(self.user1, item))


class TestRSForm(TestCase):
    ''' Testing RSForm wrapper. '''
    def setUp(self):
        self.user1 = User.objects.create(username='User1')
        self.user2 = User.objects.create(username='User2')
        self.schema = RSForm.create(title='Test')
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


    def test_get_max_index(self):
        schema1 = RSForm.create(title='Test1')
        Constituenta.objects.create(alias='X1', schema=schema1.item, order=1)
        Constituenta.objects.create(alias='D2', cst_type=CstType.TERM, schema=schema1.item, order=2)
        self.assertEqual(schema1.get_max_index(CstType.BASE), 1)
        self.assertEqual(schema1.get_max_index(CstType.TERM), 2)
        self.assertEqual(schema1.get_max_index(CstType.AXIOM), 0)


    def test_insert_at(self):
        schema = RSForm.create(title='Test')
        x1 = schema.insert_new('X1')
        self.assertEqual(x1.order, 1)
        self.assertEqual(x1.schema, schema.item)

        x2 = schema.insert_new('X2', position=1)
        x1.refresh_from_db()
        self.assertEqual(x2.order, 1)
        self.assertEqual(x2.schema, schema.item)
        self.assertEqual(x1.order, 2)

        x3 = schema.insert_new('X3', position=4)
        x2.refresh_from_db()
        x1.refresh_from_db()
        self.assertEqual(x3.order, 3)
        self.assertEqual(x3.schema, schema.item)
        self.assertEqual(x2.order, 1)
        self.assertEqual(x1.order, 2)

        x4 = schema.insert_new('X4', position=3)
        x3.refresh_from_db()
        x2.refresh_from_db()
        x1.refresh_from_db()
        self.assertEqual(x4.order, 3)
        self.assertEqual(x4.schema, schema.item)
        self.assertEqual(x3.order, 4)
        self.assertEqual(x2.order, 1)
        self.assertEqual(x1.order, 2)


    def test_insert_at_invalid_position(self):
        with self.assertRaises(ValidationError):
            self.schema.insert_new('X5', position=0)


    def test_insert_at_invalid_alias(self):
        self.schema.insert_new('X1')
        with self.assertRaises(ValidationError):
            self.schema.insert_new('X1')


    def test_insert_at_reorder(self):
        self.schema.insert_new('X1')
        d1 = self.schema.insert_new('D1')
        d2 = self.schema.insert_new('D2',position=1)
        d1.refresh_from_db()
        self.assertEqual(d1.order, 3)
        self.assertEqual(d2.order, 1)

        x2 = self.schema.insert_new('X2', position=4)
        self.assertEqual(x2.order, 4)


    def test_insert_last(self):
        x1 = self.schema.insert_new('X1')
        self.assertEqual(x1.order, 1)
        self.assertEqual(x1.schema, self.schema.item)

        x2 = self.schema.insert_new('X2')
        self.assertEqual(x2.order, 2)
        self.assertEqual(x2.schema, self.schema.item)
        self.assertEqual(x1.order, 1)


    def test_create_cst_resolve(self):
        x1 = self.schema.insert_new(
            alias='X1',
            term_raw='@{X2|datv}',
            definition_raw='@{X1|datv} @{X2|datv}'
        )
        x2 = self.schema.create_cst({
            'alias': 'X2', 
            'cst_type': CstType.BASE,
            'term_raw': 'слон',
            'definition_raw': '@{X1|plur} @{X2|plur}'
        })
        x1.refresh_from_db()
        self.assertEqual(x1.term_resolved, 'слону')
        self.assertEqual(x1.definition_resolved, 'слону слону')
        self.assertEqual(x2.term_resolved, 'слон')
        self.assertEqual(x2.definition_resolved, 'слонам слоны')


    def test_insert_copy(self):
        x1 = self.schema.insert_new(
            alias='X10',
            convention='Test'
        )
        s1 = self.schema.insert_new(
            alias='S11',
            definition_formal=x1.alias,
            definition_raw='@{X10|plur}'
        )

        result = self.schema.insert_copy([s1, x1], 2)
        self.assertEqual(len(result), 2)

        s1.refresh_from_db()
        self.assertEqual(s1.order, 4)

        x2 = result[1]
        self.assertEqual(x2.order, 3)
        self.assertEqual(x2.alias, 'X11')
        self.assertEqual(x2.cst_type, CstType.BASE)
        self.assertEqual(x2.convention, x1.convention)

        s2 = result[0]
        self.assertEqual(s2.order, 2)
        self.assertEqual(s2.alias, 'S12')
        self.assertEqual(s2.cst_type, CstType.STRUCTURED)
        self.assertEqual(s2.definition_formal, x2.alias)
        self.assertEqual(s2.definition_raw, '@{X11|plur}')


    def test_apply_mapping(self):
        x1 = self.schema.insert_new('X1')
        x2 = self.schema.insert_new('X11')
        d1 = self.schema.insert_new(
            alias='D1',
            definition_formal='X1 = X11 = X2',
            definition_raw='@{X11|sing}',
            convention='X1',
            term_raw='@{X1|plur}'
        )
    
        self.schema.apply_mapping({x1.alias: 'X3', x2.alias: 'X4'})
        d1.refresh_from_db()
        self.assertEqual(d1.definition_formal, 'X3 = X4 = X2', msg='Map IDs in expression')
        self.assertEqual(d1.definition_raw, '@{X4|sing}', msg='Map IDs in definition')
        self.assertEqual(d1.convention, 'X3', msg='Map IDs in convention')
        self.assertEqual(d1.term_raw, '@{X3|plur}', msg='Map IDs in term')
        self.assertEqual(d1.term_resolved, '', msg='Do not run resolve on mapping')
        self.assertEqual(d1.definition_resolved, '', msg='Do not run resolve on mapping')


    def test_substitute(self):
        x1 = self.schema.insert_new(
            alias='X1',
            term_raw='Test'
        )
        x2 = self.schema.insert_new(
            alias='X2',
            term_raw='Test2'
        )
        d1 = self.schema.insert_new(
            alias='D1',
            definition_formal=x1.alias
        )

        self.schema.substitute(x1, x2, True)
        x2.refresh_from_db()
        d1.refresh_from_db()
        self.assertEqual(self.schema.constituents().count(), 2)
        self.assertEqual(x2.term_raw, 'Test')
        self.assertEqual(d1.definition_formal, x2.alias)


    def test_move_cst(self):
        x1 = self.schema.insert_new('X1')
        x2 = self.schema.insert_new('X2')
        d1 = self.schema.insert_new('D1')
        d2 = self.schema.insert_new('D2')
        self.schema.move_cst([x2, d2], 1)
        x1.refresh_from_db()
        x2.refresh_from_db()
        d1.refresh_from_db()
        d2.refresh_from_db()
        self.assertEqual(x1.order, 3)
        self.assertEqual(x2.order, 1)
        self.assertEqual(d1.order, 4)
        self.assertEqual(d2.order, 2)


    def test_move_cst_down(self):
        x1 = self.schema.insert_new('X1')
        x2 = self.schema.insert_new('X2')
        self.schema.move_cst([x1], 2)
        x1.refresh_from_db()
        x2.refresh_from_db()
        self.assertEqual(x1.order, 2)
        self.assertEqual(x2.order, 1)


    def test_reset_aliases(self):
        x1 = self.schema.insert_new(
            alias='X11',
            term_raw='человек',
            term_resolved='человек'
        )
        x2 = self.schema.insert_new('X21')
        d1 = self.schema.insert_new(
            alias='D11',
            convention='D11 - cool',
            definition_formal='X21=X21',
            term_raw='@{X21|sing}',
            definition_raw='@{X11|datv}',
            definition_resolved='test'
        )

        self.schema.reset_aliases()
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


    def test_on_term_change(self):
        x1 = self.schema.insert_new(
            alias='X1',
            term_raw='человек',
            term_resolved='человек',
            definition_raw='одному @{X1|datv}',
            definition_resolved='одному человеку',
        )
        x2 = self.schema.insert_new(
            alias='X2',
            term_raw='сильный @{X1|sing}',
            term_resolved='сильный человек',
            definition_raw=x1.definition_raw,
            definition_resolved=x1.definition_resolved
        )
        x3 = self.schema.insert_new(
            alias='X3',
            definition_raw=x1.definition_raw,
            definition_resolved=x1.definition_resolved
        )
        d1 = self.schema.insert_new(
            alias='D1',
            definition_raw='очень @{X2|sing}',
            definition_resolved='очень сильный человек'
        )

        x1.term_raw='слон'
        x1.term_resolved='слон'
        x1.save()

        self.schema.on_term_change([x1.alias])
        x1.refresh_from_db()
        x2.refresh_from_db()
        x3.refresh_from_db()
        d1.refresh_from_db()

        self.assertEqual(x1.term_raw, 'слон')
        self.assertEqual(x1.term_resolved, 'слон')
        self.assertEqual(x1.definition_resolved, 'одному слону')
        self.assertEqual(x2.definition_resolved, x1.definition_resolved)
        self.assertEqual(x3.definition_resolved, x1.definition_resolved)
        self.assertEqual(d1.definition_resolved, 'очень сильный слон')
