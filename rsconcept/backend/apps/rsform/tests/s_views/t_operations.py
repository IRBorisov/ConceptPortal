''' Testing API: Operations. '''
from rest_framework import status
from .EndpointTester import decl_endpoint, EndpointTester

from apps.rsform.models import (
  RSForm,
  Constituenta,
  CstType
)


class TestInlineSynthesis(EndpointTester):
    ''' Testing Operations endpoints. '''


    @decl_endpoint('/api/operations/inline-synthesis', method='patch')
    def setUp(self):
        super().setUp()
        self.schema1 = RSForm.create(title='Test1', alias='T1', owner=self.user)
        self.schema2 = RSForm.create(title='Test2', alias='T2', owner=self.user)
        self.unowned = RSForm.create(title='Test3', alias='T3')


    def test_inline_synthesis_inputs(self):
        invalid_id = 1338
        data = {
            'receiver': self.unowned.item.id,
            'source': self.schema1.item.id,
            'items': [],
            'substitutions': []
        }
        self.assertForbidden(data)

        data['receiver'] = invalid_id
        self.assertBadData(data)

        data['receiver'] = self.schema1.item.id
        data['source'] = invalid_id
        self.assertBadData(data)

        data['source'] = self.schema1.item.id
        self.assertOK(data)

        data['items'] = [invalid_id]
        self.assertBadData(data)


    def test_inline_synthesis(self):
        ks1_x1 = self.schema1.insert_new('X1', term_raw='KS1X1') # -> delete
        ks1_x2 = self.schema1.insert_new('X2', term_raw='KS1X2') # -> X2
        ks1_s1 = self.schema1.insert_new('S1', definition_formal='X2', term_raw='KS1S1') # -> S1
        ks1_d1 = self.schema1.insert_new('D1', definition_formal=r'S1\X1\X2') # -> D1
        ks2_x1 = self.schema2.insert_new('X1', term_raw='KS2X1') # -> delete
        ks2_x2 = self.schema2.insert_new('X2', term_raw='KS2X2') # -> X4
        ks2_s1 = self.schema2.insert_new('S1', definition_formal='X2×X2', term_raw='KS2S1') # -> S2
        ks2_d1 = self.schema2.insert_new('D1', definition_formal=r'S1\X1\X2') # -> D2
        ks2_a1 = self.schema2.insert_new('A1', definition_formal='1=1') # -> not included in items

        data = {
            'receiver': self.schema1.item.id,
            'source': self.schema2.item.id,
            'items': [ks2_x1.pk, ks2_x2.pk, ks2_s1.pk, ks2_d1.pk],
            'substitutions': [
                {
                    'original': ks1_x1.pk, 
                    'substitution': ks2_s1.pk,
                    'transfer_term': False
                },
                {
                    'original': ks2_x1.pk, 
                    'substitution': ks1_s1.pk,
                    'transfer_term': True
                }
            ]
        }
        response = self.execute(data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        result = {item['alias']: item for item in response.data['items']}
        self.assertEqual(len(result), 6)
        self.assertEqual(result['X2']['term_raw'], ks1_x2.term_raw)
        self.assertEqual(result['X2']['order'], 1)
        self.assertEqual(result['X4']['term_raw'], ks2_x2.term_raw)
        self.assertEqual(result['X4']['order'], 2)
        self.assertEqual(result['S1']['term_raw'], ks2_x1.term_raw)
        self.assertEqual(result['S2']['term_raw'], ks2_s1.term_raw)
        self.assertEqual(result['S1']['definition_formal'], 'X2')
        self.assertEqual(result['S2']['definition_formal'], 'X4×X4')
        self.assertEqual(result['D1']['definition_formal'], r'S1\S2\X2')
        self.assertEqual(result['D2']['definition_formal'], r'S2\S1\X4')
