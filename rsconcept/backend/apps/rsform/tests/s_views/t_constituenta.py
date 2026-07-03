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
        data = {'target': self.x1.pk, 'item_data': {'convention': 'tt', 'typification_manual': 'ℬ(X1)'}}
        self.executeForbidden(data, item=self.unowned_id)

        self.logout()
        self.executeForbidden(data, item=self.owned_id)

        self.login()
        self.executeOK(data)
        self.x1.refresh_from_db()
        self.assertEqual(self.x1.convention, 'tt')
        self.assertEqual(self.x1.typification_manual, 'ℬ(X1)')

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
            'typification_manual': 'ℬ(X1)',
            'crucial': True
        }
        response = self.executeCreated(data)
        self.assertEqual(response.data['new_cst']['alias'], data['alias'])
        x4 = Constituenta.objects.get(alias=response.data['new_cst']['alias'])
        self.assertEqual(x4.order, 3)
        self.assertEqual(x4.term_raw, data['term_raw'])
        self.assertEqual(x4.term_forms, data['term_forms'])
        self.assertEqual(x4.definition_formal, data['definition_formal'])
        self.assertEqual(x4.typification_manual, data['typification_manual'])
        self.assertEqual(x4.crucial, data['crucial'])


    @decl_endpoint('/api/rsforms/{item}/create-multiple-cst', method='post')
    def test_create_multiple_constituenta(self):
        data = {
            'insert_after': self.x2.pk,
            'items': [
                {
                    'alias': 'X4',
                    'cst_type': self.x1.cst_type,
                    'term_raw': self.x1.term_raw,
                    'definition_raw': self.x1.definition_raw,
                    'definition_formal': self.x1.definition_formal,
                    'typification_manual': self.x1.typification_manual,
                    'value_is_property': self.x1.value_is_property,
                    'convention': self.x1.convention,
                    'crucial': self.x1.crucial,
                    'term_forms': self.x1.term_forms
                },
                {
                    'alias': 'X5',
                    'cst_type': self.x3.cst_type,
                    'term_raw': self.x3.term_raw,
                    'definition_raw': self.x3.definition_raw,
                    'definition_formal': self.x3.definition_formal,
                    'typification_manual': self.x3.typification_manual,
                    'value_is_property': self.x3.value_is_property,
                    'convention': self.x3.convention,
                    'crucial': self.x3.crucial,
                    'term_forms': self.x3.term_forms
                }
            ]
        }
        self.executeForbidden(data, item=self.unowned_id)

        response = self.executeCreated(data, item=self.owned_id)
        self.assertEqual(len(response.data['cst_list']), 2)
        cloned_aliases = [item['alias'] for item in response.data['cst_list']]
        self.assertEqual(cloned_aliases, ['X4', 'X5'])
        x4 = Constituenta.objects.get(alias='X4')
        x5 = Constituenta.objects.get(alias='X5')
        self.assertEqual(x4.order, 2)
        self.assertEqual(x5.order, 3)
        self.assertEqual(x4.term_raw, self.x1.term_raw)
        self.assertEqual(x5.term_raw, self.x3.term_raw)

    @decl_endpoint('/api/rsforms/{item}/create-multiple-cst', method='post')
    def test_create_multiple_constituenta_with_remapped_references(self):
        self.x1.definition_formal = 'X1 = X2'
        self.x1.term_raw = '@{X1|sing}'
        self.x1.definition_raw = '@{X2|sing}'
        self.x1.save()
        self.x2.definition_formal = 'X2 = X1'
        self.x2.term_raw = '@{X2|sing}'
        self.x2.definition_raw = '@{X1|sing}'
        self.x2.save()

        data = {
            'insert_after': self.x2.pk,
            'items': [
                {
                    'alias': 'X4',
                    'cst_type': self.x1.cst_type,
                    'term_raw': '@{X4|sing}',
                    'definition_raw': '@{X5|sing}',
                    'definition_formal': 'X4 = X5',
                    'typification_manual': '',
                    'value_is_property': False,
                    'convention': '',
                    'crucial': False,
                    'term_forms': []
                },
                {
                    'alias': 'X5',
                    'cst_type': self.x2.cst_type,
                    'term_raw': '@{X5|sing}',
                    'definition_raw': '@{X4|sing}',
                    'definition_formal': 'X5 = X4',
                    'typification_manual': '',
                    'value_is_property': False,
                    'convention': '',
                    'crucial': False,
                    'term_forms': []
                }
            ]
        }
        response = self.executeCreated(data, item=self.owned_id)
        x4 = Constituenta.objects.get(pk=response.data['cst_list'][0]['id'])
        x5 = Constituenta.objects.get(pk=response.data['cst_list'][1]['id'])
        self.assertEqual(x4.definition_formal, 'X4 = X5')
        self.assertEqual(x5.definition_formal, 'X5 = X4')
        self.assertEqual(x4.term_raw, '@{X4|sing}')
        self.assertEqual(x5.definition_raw, '@{X4|sing}')


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
