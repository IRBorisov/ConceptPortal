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
        self.assertNotEqual(self.user1, self.user2)
        self.schema = RSForm.create(title='Test')


    def test_constituents(self):
        schema1 = RSForm.create(title='Test1')
        schema2 = RSForm.create(title='Test2')
        self.assertFalse(schema1.constituentsQ().exists())
        self.assertFalse(schema2.constituentsQ().exists())

        Constituenta.objects.create(alias='X1', schema=schema1.model, order=0)
        Constituenta.objects.create(alias='X2', schema=schema1.model, order=1)
        self.assertTrue(schema1.constituentsQ().exists())
        self.assertFalse(schema2.constituentsQ().exists())
        self.assertEqual(schema1.constituentsQ().count(), 2)

    def test_insert_at_invalid_alias(self):
        self.schema.insert_last('X1')
        with self.assertRaises(ValidationError):
            self.schema.insert_last('X1')


    def test_insert_last(self):
        x1 = self.schema.insert_last('X1')
        self.assertEqual(x1.order, 0)
        self.assertEqual(x1.schema, self.schema.model)

        x2 = self.schema.insert_last('X2')
        self.assertEqual(x2.order, 1)
        self.assertEqual(x2.schema, self.schema.model)
        self.assertEqual(x1.order, 0)

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

    def test_move_cst(self):
        x1 = self.schema.insert_last('X1')
        x2 = self.schema.insert_last('X2')
        d1 = self.schema.insert_last('D1')
        d2 = self.schema.insert_last('D2')
        self.schema.move_cst([x2, d2], 0)
        x1.refresh_from_db()
        x2.refresh_from_db()
        d1.refresh_from_db()
        d2.refresh_from_db()
        self.assertEqual(x1.order, 2)
        self.assertEqual(x2.order, 0)
        self.assertEqual(d1.order, 3)
        self.assertEqual(d2.order, 1)


    def test_move_cst_down(self):
        x1 = self.schema.insert_last('X1')
        x2 = self.schema.insert_last('X2')
        self.schema.move_cst([x1], 1)
        x1.refresh_from_db()
        x2.refresh_from_db()
        self.assertEqual(x1.order, 1)
        self.assertEqual(x2.order, 0)

    def test_delete_cst(self):
        x1 = self.schema.insert_last('X1')
        x2 = self.schema.insert_last('X2')
        d1 = self.schema.insert_last(
            alias='D1',
            definition_formal='X1 = X2',
            definition_raw='@{X1|sing}',
            term_raw='@{X2|plur}'
        )

        self.schema.delete_cst([x1])
        x2.refresh_from_db()
        d1.refresh_from_db()
        self.assertEqual(self.schema.constituentsQ().count(), 2)
        self.assertEqual(x2.order, 0)
        self.assertEqual(d1.order, 1)
        self.assertEqual(d1.definition_formal, 'DEL = X2')
        self.assertEqual(d1.definition_raw, '@{DEL|sing}')
        self.assertEqual(d1.term_raw, '@{X2|plur}')
