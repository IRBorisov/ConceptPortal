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
        self.x1 = Constituenta.objects.create(
            alias='X1',
            cst_type=CstType.BASE,
            schema=self.owned.model,
            order=0,
            convention='Test',
            term_raw='Test1',
            term_resolved='Test1R',
            term_forms=[{'text': 'form1', 'tags': 'sing,datv'}])
        self.x2 = Constituenta.objects.create(
            alias='X2',
            cst_type=CstType.BASE,
            schema=self.owned.model,
            order=1,
            convention='Test1',
            term_raw='Test2',
            term_resolved='Test2R'
        )
        self.x3 = Constituenta.objects.create(
            alias='X3',
            schema=self.owned.model,
            order=2,
            term_raw='Test3',
            term_resolved='Test3',
            definition_raw='Test1',
            definition_resolved='Test2'
        )
        self.unowned_cst = self.unowned.insert_last(alias='X1', cst_type=CstType.BASE)
        self.invalid_cst = self.x3.pk + 1337

    @decl_endpoint('/api/rsforms/{item}/update-cst', method='patch')
    def test_partial_update(self):
        data = {'target': self.x1.pk, 'item_data': {'convention': 'tt'}}
        self.executeForbidden(data, item=self.unowned_id)

        self.logout()
        self.executeForbidden(data, item=self.owned_id)

        self.login()
        self.executeOK(data)
        self.x1.refresh_from_db()
        self.assertEqual(self.x1.convention, 'tt')

        self.executeOK(data)


    @decl_endpoint('/api/rsforms/{item}/update-cst', method='patch')
    def test_partial_update_rename(self):
        data = {'target': self.x1.pk, 'item_data': {'alias': self.x3.alias}}
        self.executeBadData(data, item=self.owned_id)

        d1 = self.owned.insert_last(
            alias='D1',
            term_raw='@{X1|plur}',
            definition_formal='X1'
        )
        self.assertEqual(self.x1.order, 0)
        self.assertEqual(self.x1.alias, 'X1')
        self.assertEqual(self.x1.cst_type, CstType.BASE)

        data = {'target': self.x1.pk, 'item_data': {'alias': 'D2', 'cst_type': CstType.TERM}}
        self.executeOK(data, item=self.owned_id)
        d1.refresh_from_db()
        self.x1.refresh_from_db()
        self.assertEqual(d1.term_resolved, '')
        self.assertEqual(d1.term_raw, '@{D2|plur}')
        self.assertEqual(self.x1.order, 0)
        self.assertEqual(self.x1.alias, 'D2')
        self.assertEqual(self.x1.cst_type, CstType.TERM)


    @decl_endpoint('/api/rsforms/{item}/update-cst', method='patch')
    def test_update_resolved_no_refs(self):
        data = {
            'target': self.x3.pk,
            'item_data': {
                'term_raw': 'New term',
                'definition_raw': 'New def'
            }
        }
        self.executeOK(data, item=self.owned_id)
        self.x3.refresh_from_db()
        self.assertEqual(self.x3.term_resolved, 'New term')
        self.assertEqual(self.x3.definition_resolved, 'New def')


    @decl_endpoint('/api/rsforms/{item}/update-cst', method='patch')
    def test_update_resolved_refs(self):
        data = {
            'target': self.x3.pk,
            'item_data': {
                'term_raw': '@{X1|nomn,sing}',
                'definition_raw': '@{X1|nomn,sing} @{X1|sing,datv}'
            }
        }
        self.executeOK(data, item=self.owned_id)
        self.x3.refresh_from_db()
        self.assertEqual(self.x3.term_resolved, self.x1.term_resolved)
        self.assertEqual(self.x3.definition_resolved, f'{self.x1.term_resolved} form1')


    @decl_endpoint('/api/rsforms/{item}/update-cst', method='patch')
    def test_update_term_forms(self):
        data = {
            'target': self.x3.pk,
            'item_data': {
                'definition_raw': '@{X3|sing,datv}',
                'term_forms': [{'text': 'form1', 'tags': 'sing,datv'}]
            }
        }
        self.executeOK(data, item=self.owned_id)
        self.x3.refresh_from_db()
        self.assertEqual(self.x3.definition_resolved, 'form1')
        self.assertEqual(self.x3.term_forms, data['item_data']['term_forms'])


    @decl_endpoint('/api/rsforms/{item}/update-crucial', method='patch')
    def test_update_crucial(self):
        data = {'target': [self.x1.pk], 'value': True}
        self.executeForbidden(data, item=self.unowned_id)

        self.logout()
        self.executeForbidden(data, item=self.owned_id)

        self.login()
        self.executeOK(data, item=self.owned_id)
        self.x1.refresh_from_db()
        self.assertEqual(self.x1.crucial, True)


    @decl_endpoint('/api/rsforms/{item}/create-cst', method='post')
    def test_create_constituenta(self):
        data = {'alias': 'X4', 'cst_type': CstType.BASE}
        self.executeForbidden(data, item=self.unowned_id)

        data = {'alias': 'X4'}
        self.executeBadData(item=self.owned_id)
        self.executeBadData(data)

        data['cst_type'] = 'invalid'
        self.executeBadData(data)

        data = {
            'alias': 'X4',
            'cst_type': CstType.BASE,
            'term_raw': 'test',
            'term_forms': [{'text': 'form1', 'tags': 'sing,datv'}],
            'definition_formal': 'invalid',
            'crucial': True
        }
        response = self.executeCreated(data)
        self.assertEqual(response.data['new_cst']['alias'], data['alias'])
        x4 = Constituenta.objects.get(alias=response.data['new_cst']['alias'])
        self.assertEqual(x4.order, 3)
        self.assertEqual(x4.term_raw, data['term_raw'])
        self.assertEqual(x4.term_forms, data['term_forms'])
        self.assertEqual(x4.definition_formal, data['definition_formal'])
        self.assertEqual(x4.crucial, data['crucial'])


    @decl_endpoint('/api/rsforms/{item}/create-cst', method='post')
    def test_create_constituenta_after(self):
        self.set_params(item=self.owned_id)

        data = {'alias': 'X4', 'cst_type': CstType.BASE, 'insert_after': self.invalid_cst}
        self.executeBadData(data)

        data['insert_after'] = self.unowned_cst.pk
        self.executeBadData(data)

        data = {
            'alias': 'X4',
            'cst_type': CstType.BASE,
            'insert_after': self.x2.pk,
        }
        response = self.executeCreated(data)
        self.assertEqual(response.data['new_cst']['alias'], data['alias'])
        x4 = Constituenta.objects.get(alias=response.data['new_cst']['alias'])
        self.x3.refresh_from_db()
        self.assertEqual(x4.order, 2)
        self.assertEqual(self.x3.order, 3)
