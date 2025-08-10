''' Testing models: api_RSForm. '''
from django.forms import ValidationError

from apps.rsform.models import Constituenta, CstType, OrderManager, RSFormCached
from apps.users.models import User
from shared.DBTester import DBTester


class TestRSFormCached(DBTester):
    ''' Testing RSForm Cached wrapper. '''


    def setUp(self):
        super().setUp()
        self.user1 = User.objects.create(username='User1')
        self.user2 = User.objects.create(username='User2')
        self.assertNotEqual(self.user1, self.user2)
        self.schema = RSFormCached.create(title='Test')


    def test_constituents(self):
        schema1 = RSFormCached.create(title='Test1')
        schema2 = RSFormCached.create(title='Test2')
        self.assertFalse(schema1.constituentsQ().exists())
        self.assertFalse(schema2.constituentsQ().exists())

        Constituenta.objects.create(alias='X1', schema=schema1.model, order=0)
        Constituenta.objects.create(alias='X2', schema=schema1.model, order=1)
        self.assertTrue(schema1.constituentsQ().exists())
        self.assertFalse(schema2.constituentsQ().exists())
        self.assertEqual(schema1.constituentsQ().count(), 2)


    def test_insert_last(self):
        x1 = self.schema.insert_last('X1')
        self.assertEqual(x1.order, 0)
        self.assertEqual(x1.schema, self.schema.model)


    def test_create_cst(self):
        data = {
            'alias': 'X3',
            'cst_type': CstType.BASE,
            'term_raw': 'слон',
            'definition_raw': 'test',
            'convention': 'convention'
        }

        x1 = self.schema.insert_last('X1')
        x2 = self.schema.insert_last('X2')
        x3 = self.schema.create_cst(data, insert_after=x1)
        x2.refresh_from_db()

        self.assertEqual(x3.alias, data['alias'])
        self.assertEqual(x3.term_raw, data['term_raw'])
        self.assertEqual(x3.definition_raw, data['definition_raw'])
        self.assertEqual(x2.order, 2)
        self.assertEqual(x3.order, 1)


    def test_create_cst_resolve(self):
        x1 = self.schema.insert_last(
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
        x1 = self.schema.insert_last(
            alias='X10',
            convention='Test'
        )
        s1 = self.schema.insert_last(
            alias='S11',
            definition_formal=x1.alias,
            definition_raw='@{X10|plur}'
        )

        result = self.schema.insert_copy([s1, x1], 1)
        self.assertEqual(len(result), 2)

        s1.refresh_from_db()
        self.assertEqual(s1.order, 3)

        x2 = result[1]
        self.assertEqual(x2.order, 2)
        self.assertEqual(x2.alias, 'X11')
        self.assertEqual(x2.cst_type, CstType.BASE)
        self.assertEqual(x2.convention, x1.convention)

        s2 = result[0]
        self.assertEqual(s2.order, 1)
        self.assertEqual(s2.alias, 'S12')
        self.assertEqual(s2.cst_type, CstType.STRUCTURED)
        self.assertEqual(s2.definition_formal, x2.alias)
        self.assertEqual(s2.definition_raw, '@{X11|plur}')


    def test_delete_cst(self):
        x1 = self.schema.insert_last('X1')
        x2 = self.schema.insert_last('X2')
        d1 = self.schema.insert_last(
            alias='D1',
            definition_formal='X1 = X2',
            definition_raw='@{X1|sing}',
            term_raw='@{X2|plur}'
        )

        self.schema.delete_cst([x1.pk])
        x2.refresh_from_db()
        d1.refresh_from_db()
        self.assertEqual(self.schema.constituentsQ().count(), 2)
        self.assertEqual(x2.order, 0)
        self.assertEqual(d1.order, 1)
        self.assertEqual(d1.definition_formal, 'DEL = X2')
        self.assertEqual(d1.definition_raw, '@{DEL|sing}')
        self.assertEqual(d1.term_raw, '@{X2|plur}')


    def test_apply_mapping(self):
        x1 = self.schema.insert_last('X1')
        x2 = self.schema.insert_last('X11')
        d1 = self.schema.insert_last(
            alias='D1',
            definition_formal='X1 = X11 = X2',
            definition_raw='@{X11|sing}',
            term_raw='@{X1|plur}'
        )

        self.schema.apply_mapping({x1.alias: 'X3', x2.alias: 'X4'})
        d1.refresh_from_db()
        self.assertEqual(d1.definition_formal, 'X3 = X4 = X2', msg='Map IDs in expression')
        self.assertEqual(d1.definition_raw, '@{X4|sing}', msg='Map IDs in definition')
        self.assertEqual(d1.term_raw, '@{X3|plur}', msg='Map IDs in term')
        self.assertEqual(d1.term_resolved, '', msg='Do not run resolve on mapping')
        self.assertEqual(d1.definition_resolved, '', msg='Do not run resolve on mapping')


    def test_substitute(self):
        x1 = self.schema.insert_last(
            alias='X1',
            term_raw='Test'
        )
        x2 = self.schema.insert_last(
            alias='X2',
            term_raw='Test2'
        )
        d1 = self.schema.insert_last(
            alias='D1',
            definition_formal=x1.alias
        )

        self.schema.substitute([(x1, x2)])
        x2.refresh_from_db()
        d1.refresh_from_db()
        self.assertEqual(self.schema.constituentsQ().count(), 2)
        self.assertEqual(x2.term_raw, 'Test2')
        self.assertEqual(d1.definition_formal, x2.alias)


    def test_restore_order(self):
        d2 = self.schema.insert_last(
            alias='D2',
            definition_formal=r'D{ξ∈S1 | 1=1}',
        )
        d1 = self.schema.insert_last(
            alias='D1',
            definition_formal=r'Pr1(S1)\X1',
        )
        x1 = self.schema.insert_last('X1')
        x2 = self.schema.insert_last('X2')
        s1 = self.schema.insert_last(
            alias='S1',
            definition_formal='ℬ(X1×X1)'
        )
        c1 = self.schema.insert_last('C1')
        s2 = self.schema.insert_last(
            alias='S2',
            definition_formal='ℬ(X2×D1)'
        )
        a1 = self.schema.insert_last(
            alias='A1',
            definition_formal=r'D3=∅',
        )
        d3 = self.schema.insert_last(
            alias='D3',
            definition_formal=r'Pr2(S2)',
        )
        f1 = self.schema.insert_last(
            alias='F1',
            definition_formal=r'[α∈ℬ(X1)] D{σ∈S1 | α⊆pr1(σ)}',
        )
        d4 = self.schema.insert_last(
            alias='D4',
            definition_formal=r'Pr2(D3)',
        )
        f2 = self.schema.insert_last(
            alias='F2',
            definition_formal=r'[α∈ℬ(X1)] X1\α',
        )

        OrderManager(self.schema).restore_order()
        x1.refresh_from_db()
        x2.refresh_from_db()
        c1.refresh_from_db()
        s1.refresh_from_db()
        s2.refresh_from_db()
        d1.refresh_from_db()
        d2.refresh_from_db()
        d3.refresh_from_db()
        d4.refresh_from_db()
        f1.refresh_from_db()
        f2.refresh_from_db()
        a1.refresh_from_db()

        self.assertEqual(x1.order, 0)
        self.assertEqual(x2.order, 1)
        self.assertEqual(c1.order, 2)
        self.assertEqual(s1.order, 3)
        self.assertEqual(d1.order, 4)
        self.assertEqual(s2.order, 5)
        self.assertEqual(d3.order, 6)
        self.assertEqual(a1.order, 7)
        self.assertEqual(d4.order, 8)
        self.assertEqual(d2.order, 9)
        self.assertEqual(f1.order, 10)
        self.assertEqual(f2.order, 11)


    def test_reset_aliases(self):
        x1 = self.schema.insert_last(
            alias='X11',
            term_raw='человек',
            term_resolved='человек'
        )
        x2 = self.schema.insert_last('X21')
        d1 = self.schema.insert_last(
            alias='D11',
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
        self.assertEqual(d1.term_raw, '@{X2|sing}')
        self.assertEqual(d1.definition_raw, '@{X1|datv}')
        self.assertEqual(d1.definition_resolved, 'test')
