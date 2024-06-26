''' Testing API: Constituents. '''
from apps.rsform.models import Constituenta, CstType, RSForm

from ..EndpointTester import EndpointTester, decl_endpoint


class TestConstituentaAPI(EndpointTester):
    ''' Testing Constituenta view. '''

    def setUp(self):
        super().setUp()
        self.rsform_owned = RSForm.create(title='Test', alias='T1', owner=self.user)
        self.rsform_unowned = RSForm.create(title='Test2', alias='T2')
        self.cst1 = Constituenta.objects.create(
            alias='X1',
            cst_type=CstType.BASE,
            schema=self.rsform_owned.item,
            order=1,
            convention='Test',
            term_raw='Test1',
            term_resolved='Test1R',
            term_forms=[{'text': 'form1', 'tags': 'sing,datv'}])
        self.cst2 = Constituenta.objects.create(
            alias='X2',
            cst_type=CstType.BASE,
            schema=self.rsform_unowned.item,
            order=1,
            convention='Test1',
            term_raw='Test2',
            term_resolved='Test2R'
        )
        self.cst3 = Constituenta.objects.create(
            alias='X3',
            schema=self.rsform_owned.item,
            order=2,
            term_raw='Test3',
            term_resolved='Test3',
            definition_raw='Test1',
            definition_resolved='Test2'
        )
        self.invalid_cst = self.cst3.pk + 1337


    @decl_endpoint('/api/constituents/{item}', method='get')
    def test_retrieve(self):
        self.executeNotFound(item=self.invalid_cst)
        response = self.executeOK(item=self.cst1.pk)
        self.assertEqual(response.data['alias'], self.cst1.alias)
        self.assertEqual(response.data['convention'], self.cst1.convention)


    @decl_endpoint('/api/constituents/{item}', method='patch')
    def test_partial_update(self):
        data = {'convention': 'tt'}
        self.executeForbidden(data, item=self.cst2.pk)

        self.logout()
        self.executeForbidden(data, item=self.cst1.pk)

        self.login()
        response = self.executeOK(data, item=self.cst1.pk)
        self.cst1.refresh_from_db()
        self.assertEqual(response.data['convention'], 'tt')
        self.assertEqual(self.cst1.convention, 'tt')

        self.executeOK(data, item=self.cst1.pk)


    @decl_endpoint('/api/constituents/{item}', method='patch')
    def test_update_resolved_no_refs(self):
        data = {
            'term_raw': 'New term',
            'definition_raw': 'New def'
        }
        response = self.executeOK(data, item=self.cst3.pk)
        self.cst3.refresh_from_db()
        self.assertEqual(response.data['term_resolved'], 'New term')
        self.assertEqual(self.cst3.term_resolved, 'New term')
        self.assertEqual(response.data['definition_resolved'], 'New def')
        self.assertEqual(self.cst3.definition_resolved, 'New def')


    @decl_endpoint('/api/constituents/{item}', method='patch')
    def test_update_resolved_refs(self):
        data = {
            'term_raw': '@{X1|nomn,sing}',
            'definition_raw': '@{X1|nomn,sing} @{X1|sing,datv}'
        }
        response = self.executeOK(data, item=self.cst3.pk)
        self.cst3.refresh_from_db()
        self.assertEqual(self.cst3.term_resolved, self.cst1.term_resolved)
        self.assertEqual(response.data['term_resolved'], self.cst1.term_resolved)
        self.assertEqual(self.cst3.definition_resolved, f'{self.cst1.term_resolved} form1')
        self.assertEqual(response.data['definition_resolved'], f'{self.cst1.term_resolved} form1')


    @decl_endpoint('/api/constituents/{item}', method='patch')
    def test_readonly_cst_fields(self):
        data = {'alias': 'X33', 'order': 10}
        response = self.executeOK(data, item=self.cst1.pk)
        self.assertEqual(response.data['alias'], 'X1')
        self.assertEqual(response.data['alias'], self.cst1.alias)
        self.assertEqual(response.data['order'], self.cst1.order)
