''' Testing models: api_RSForm. '''
from django.forms import ValidationError

from apps.rsform.models import Constituenta, CstType, RSForm
from apps.users.models import User
from shared.DBTester import DBTester


class TestRSForm(DBTester):
    ''' Testing RSForm wrapper. '''

    def setUp(self):
        super().setUp()
        self.user1 = User.objects.create(username='User1')
        self.user2 = User.objects.create(username='User2')
        self.schema = RSForm.create(title='Test')
        self.assertNotEqual(self.user1, self.user2)


    def test_constituents(self):
        schema1 = RSForm.create(title='Test1')
        schema2 = RSForm.create(title='Test2')
        self.assertFalse(schema1.constituents().exists())
        self.assertFalse(schema2.constituents().exists())

        Constituenta.objects.create(alias='X1', schema=schema1.model, order=1)
        Constituenta.objects.create(alias='X2', schema=schema1.model, order=2)
        self.assertTrue(schema1.constituents().exists())
        self.assertFalse(schema2.constituents().exists())
        self.assertEqual(schema1.constituents().count(), 2)


    def test_get_max_index(self):
        schema1 = RSForm.create(title='Test1')
        Constituenta.objects.create(alias='X1', schema=schema1.model, order=1)
        Constituenta.objects.create(alias='D2', cst_type=CstType.TERM, schema=schema1.model, order=2)
        self.assertEqual(schema1.get_max_index(CstType.BASE), 1)
        self.assertEqual(schema1.get_max_index(CstType.TERM), 2)
        self.assertEqual(schema1.get_max_index(CstType.AXIOM), 0)


    def test_insert_at(self):
        schema = RSForm.create(title='Test')
        x1 = schema.insert_new('X1')
        self.assertEqual(x1.order, 1)
        self.assertEqual(x1.schema, schema.model)

        x2 = schema.insert_new('X2', position=1)
        x1.refresh_from_db()
        self.assertEqual(x2.order, 1)
        self.assertEqual(x2.schema, schema.model)
        self.assertEqual(x1.order, 2)

        x3 = schema.insert_new('X3', position=4)
        x2.refresh_from_db()
        x1.refresh_from_db()
        self.assertEqual(x3.order, 3)
        self.assertEqual(x3.schema, schema.model)
        self.assertEqual(x2.order, 1)
        self.assertEqual(x1.order, 2)

        x4 = schema.insert_new('X4', position=3)
        x3.refresh_from_db()
        x2.refresh_from_db()
        x1.refresh_from_db()
        self.assertEqual(x4.order, 3)
        self.assertEqual(x4.schema, schema.model)
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
        d2 = self.schema.insert_new('D2', position=1)
        d1.refresh_from_db()
        self.assertEqual(d1.order, 3)
        self.assertEqual(d2.order, 1)

        x2 = self.schema.insert_new('X2', position=4)
        self.assertEqual(x2.order, 4)


    def test_insert_last(self):
        x1 = self.schema.insert_new('X1')
        self.assertEqual(x1.order, 1)
        self.assertEqual(x1.schema, self.schema.model)

        x2 = self.schema.insert_new('X2')
        self.assertEqual(x2.order, 2)
        self.assertEqual(x2.schema, self.schema.model)
        self.assertEqual(x1.order, 1)

    def test_create_cst(self):
        data = {
            'alias': 'X3',
            'cst_type': CstType.BASE,
            'term_raw': 'слон',
            'definition_raw': 'test',
            'convention': 'convention'
        }

        x1 = self.schema.insert_new('X1')
        x2 = self.schema.insert_new('X2')
        x3 = self.schema.create_cst(data=data, insert_after=x1)
        x2.refresh_from_db()

        self.assertEqual(x3.alias, data['alias'])
        self.assertEqual(x3.term_raw, data['term_raw'])
        self.assertEqual(x3.definition_raw, data['definition_raw'])
        self.assertEqual(x2.order, 3)
        self.assertEqual(x3.order, 2)


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


    def test_delete_cst(self):
        x1 = self.schema.insert_new('X1')
        x2 = self.schema.insert_new('X2')
        d1 = self.schema.insert_new(
            alias='D1',
            definition_formal='X1 = X2',
            definition_raw='@{X1|sing}',
            term_raw='@{X2|plur}'
        )

        self.schema.delete_cst([x1])
        x2.refresh_from_db()
        d1.refresh_from_db()
        self.assertEqual(self.schema.constituents().count(), 2)
        self.assertEqual(x2.order, 1)
        self.assertEqual(d1.order, 2)
        self.assertEqual(d1.definition_formal, 'DEL = X2')
        self.assertEqual(d1.definition_raw, '@{DEL|sing}')
        self.assertEqual(d1.term_raw, '@{X2|plur}')

    def test_apply_mapping(self):
        x1 = self.schema.insert_new('X1')
        x2 = self.schema.insert_new('X11')
        d1 = self.schema.insert_new(
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

        self.schema.substitute([(x1, x2)])
        x2.refresh_from_db()
        d1.refresh_from_db()
        self.assertEqual(self.schema.constituents().count(), 2)
        self.assertEqual(x2.term_raw, 'Test2')
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


    def test_restore_order(self):
        d2 = self.schema.insert_new(
            alias='D2',
            definition_formal=r'D{ξ∈S1 | 1=1}',
        )
        d1 = self.schema.insert_new(
            alias='D1',
            definition_formal=r'Pr1(S1)\X1',
        )
        x1 = self.schema.insert_new('X1')
        x2 = self.schema.insert_new('X2')
        s1 = self.schema.insert_new(
            alias='S1',
            definition_formal='ℬ(X1×X1)'
        )
        c1 = self.schema.insert_new('C1')
        s2 = self.schema.insert_new(
            alias='S2',
            definition_formal='ℬ(X2×D1)'
        )
        a1 = self.schema.insert_new(
            alias='A1',
            definition_formal=r'D3=∅',
        )
        d3 = self.schema.insert_new(
            alias='D3',
            definition_formal=r'Pr2(S2)',
        )
        f1 = self.schema.insert_new(
            alias='F1',
            definition_formal=r'[α∈ℬ(X1)] D{σ∈S1 | α⊆pr1(σ)}',
        )
        d4 = self.schema.insert_new(
            alias='D4',
            definition_formal=r'Pr2(D3)',
        )
        f2 = self.schema.insert_new(
            alias='F2',
            definition_formal=r'[α∈ℬ(X1)] X1\α',
        )

        self.schema.restore_order()
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

        self.assertEqual(x1.order, 1)
        self.assertEqual(x2.order, 2)
        self.assertEqual(c1.order, 3)
        self.assertEqual(s1.order, 4)
        self.assertEqual(d1.order, 5)
        self.assertEqual(s2.order, 6)
        self.assertEqual(d3.order, 7)
        self.assertEqual(a1.order, 8)
        self.assertEqual(d4.order, 9)
        self.assertEqual(d2.order, 10)
        self.assertEqual(f1.order, 11)
        self.assertEqual(f2.order, 12)


    def test_reset_aliases(self):
        x1 = self.schema.insert_new(
            alias='X11',
            term_raw='человек',
            term_resolved='человек'
        )
        x2 = self.schema.insert_new('X21')
        d1 = self.schema.insert_new(
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

        x1.term_raw = 'слон'
        x1.term_resolved = 'слон'
        x1.save()

        self.schema.after_term_change([x1.pk])
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
