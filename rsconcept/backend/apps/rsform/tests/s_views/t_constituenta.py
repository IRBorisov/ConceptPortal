''' Testing API: Constituenta editing. '''
from apps.rsform.models import Constituenta, CstType, RSForm
from shared.EndpointTester import EndpointTester, decl_endpoint


class TestConstituentaAPI(EndpointTester):
    ''' Testing Constituenta view. '''

    def setUp(self):
        super().setUp()
        self.owned = RSForm.create(title='Test', alias='T1', owner=self.user)
        self.owned_id = self.owned.model.pk
        self.unowned = RSForm.create(title='Test2', alias='T2')
        self.unowned_id = self.unowned.model.pk
        self.cst1 = Constituenta.objects.create(
            alias='X1',
            cst_type=CstType.BASE,
            schema=self.owned.model,
            order=0,
            convention='Test',
            term_raw='Test1',
            term_resolved='Test1R',
            term_forms=[{'text': 'form1', 'tags': 'sing,datv'}])
        self.cst2 = Constituenta.objects.create(
            alias='X2',
            cst_type=CstType.BASE,
            schema=self.unowned.model,
            order=0,
            convention='Test1',
            term_raw='Test2',
            term_resolved='Test2R'
        )
        self.cst3 = Constituenta.objects.create(
            alias='X3',
            schema=self.owned.model,
            order=1,
            term_raw='Test3',
            term_resolved='Test3',
            definition_raw='Test1',
            definition_resolved='Test2'
        )
        self.invalid_cst = self.cst3.pk + 1337

    @decl_endpoint('/api/rsforms/{schema}/update-cst', method='patch')
    def test_partial_update(self):
        data = {'target': self.cst1.pk, 'item_data': {'convention': 'tt'}}
        self.executeForbidden(data, schema=self.unowned_id)

        self.logout()
        self.executeForbidden(data, schema=self.owned_id)

        self.login()
        self.executeOK(data)
        self.cst1.refresh_from_db()
        self.assertEqual(self.cst1.convention, 'tt')

        self.executeOK(data)


    @decl_endpoint('/api/rsforms/{schema}/update-cst', method='patch')
    def test_partial_update_rename(self):
        data = {'target': self.cst1.pk, 'item_data': {'alias': self.cst3.alias}}
        self.executeBadData(data, schema=self.owned_id)

        d1 = self.owned.insert_last(
            alias='D1',
            term_raw='@{X1|plur}',
            definition_formal='X1'
        )
        self.assertEqual(self.cst1.order, 0)
        self.assertEqual(self.cst1.alias, 'X1')
        self.assertEqual(self.cst1.cst_type, CstType.BASE)

        data = {'target': self.cst1.pk, 'item_data': {'alias': 'D2', 'cst_type': CstType.TERM}}
        self.executeOK(data, schema=self.owned_id)
        d1.refresh_from_db()
        self.cst1.refresh_from_db()
        self.assertEqual(d1.term_resolved, '')
        self.assertEqual(d1.term_raw, '@{D2|plur}')
        self.assertEqual(self.cst1.order, 0)
        self.assertEqual(self.cst1.alias, 'D2')
        self.assertEqual(self.cst1.cst_type, CstType.TERM)


    @decl_endpoint('/api/rsforms/{schema}/update-cst', method='patch')
    def test_update_resolved_no_refs(self):
        data = {
            'target': self.cst3.pk,
            'item_data': {
                'term_raw': 'New term',
                'definition_raw': 'New def'
            }
        }
        self.executeOK(data, schema=self.owned_id)
        self.cst3.refresh_from_db()
        self.assertEqual(self.cst3.term_resolved, 'New term')
        self.assertEqual(self.cst3.definition_resolved, 'New def')


    @decl_endpoint('/api/rsforms/{schema}/update-cst', method='patch')
    def test_update_resolved_refs(self):
        data = {
            'target': self.cst3.pk,
            'item_data': {
                'term_raw': '@{X1|nomn,sing}',
                'definition_raw': '@{X1|nomn,sing} @{X1|sing,datv}'
            }
        }
        self.executeOK(data, schema=self.owned_id)
        self.cst3.refresh_from_db()
        self.assertEqual(self.cst3.term_resolved, self.cst1.term_resolved)
        self.assertEqual(self.cst3.definition_resolved, f'{self.cst1.term_resolved} form1')

    @decl_endpoint('/api/rsforms/{schema}/update-cst', method='patch')
    def test_update_term_forms(self):
        data = {
            'target': self.cst3.pk,
            'item_data': {
                'definition_raw': '@{X3|sing,datv}',
                'term_forms': [{'text': 'form1', 'tags': 'sing,datv'}]
            }
        }
        self.executeOK(data, schema=self.owned_id)
        self.cst3.refresh_from_db()
        self.assertEqual(self.cst3.definition_resolved, 'form1')
        self.assertEqual(self.cst3.term_forms, data['item_data']['term_forms'])

    @decl_endpoint('/api/rsforms/{schema}/update-crucial', method='patch')
    def test_update_crucial(self):
        data = {'target': [self.cst1.pk], 'value': True}
        self.executeForbidden(data, schema=self.unowned_id)

        self.logout()
        self.executeForbidden(data, schema=self.owned_id)

        self.login()
        self.executeOK(data, schema=self.owned_id)
        self.cst1.refresh_from_db()
        self.assertEqual(self.cst1.crucial, True)
