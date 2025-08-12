''' Testing API: RSForms. '''
import io
import os
from zipfile import ZipFile

from cctext import ReferenceType
from rest_framework import status

from apps.library.models import AccessPolicy, LibraryItem, LibraryItemType, LocationHead
from apps.rsform.models import Constituenta, CstType, RSForm
from shared.EndpointTester import EndpointTester, decl_endpoint
from shared.testing_utils import response_contains


class TestRSFormViewset(EndpointTester):
    ''' Testing RSForm view. '''

    def setUp(self):
        super().setUp()
        self.owned = RSForm.create(title='Test', alias='T1', owner=self.user)
        self.owned_id = self.owned.model.pk
        self.unowned = RSForm.create(title='Test2', alias='T2')
        self.unowned_id = self.unowned.model.pk
        self.private = RSForm.create(title='Test2', alias='T2', access_policy=AccessPolicy.PRIVATE)
        self.private_id = self.private.model.pk


    @decl_endpoint('/api/rsforms/create-detailed', method='post')
    def test_create_rsform_file(self):
        work_dir = os.path.dirname(os.path.abspath(__file__))
        data = {
            'title': 'Test123',
            'description': '123',
            'alias': 'ks1',
            'location': LocationHead.PROJECTS,
            'access_policy': AccessPolicy.PROTECTED,
            'visible': False
        }
        self.executeBadData(data)

        with open(f'{work_dir}/data/sample-rsform.trs', 'rb') as file:
            data['file'] = file
            response = self.client.post(self.endpoint, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['owner'], self.user.pk)
        self.assertEqual(response.data['title'], data['title'])
        self.assertEqual(response.data['alias'], data['alias'])
        self.assertEqual(response.data['description'], data['description'])


    @decl_endpoint('/api/rsforms', method='get')
    def test_list_rsforms(self):
        oss = LibraryItem.objects.create(
            item_type=LibraryItemType.OPERATION_SCHEMA,
            title='Test3'
        )
        response = self.executeOK()
        self.assertFalse(response_contains(response, oss))
        self.assertTrue(response_contains(response, self.unowned.model))
        self.assertTrue(response_contains(response, self.owned.model))


    @decl_endpoint('/api/rsforms/{item}/contents', method='get')
    def test_contents(self):
        response = self.executeOK(item=self.owned_id)
        self.assertEqual(response.data['owner'], self.owned.model.owner.pk)
        self.assertEqual(response.data['title'], self.owned.model.title)
        self.assertEqual(response.data['alias'], self.owned.model.alias)
        self.assertEqual(response.data['location'], self.owned.model.location)
        self.assertEqual(response.data['access_policy'], self.owned.model.access_policy)
        self.assertEqual(response.data['visible'], self.owned.model.visible)


    @decl_endpoint('/api/rsforms/{item}/details', method='get')
    def test_details(self):
        x1 = self.owned.insert_last(
            alias='X1',
            term_raw='человек',
            term_resolved='человек'
        )
        x2 = self.owned.insert_last(
            alias='X2',
            term_raw='@{X1|plur}',
            term_resolved='люди'
        )

        response = self.executeOK(item=self.owned_id)
        self.assertEqual(response.data['owner'], self.owned.model.owner.pk)
        self.assertEqual(response.data['title'], self.owned.model.title)
        self.assertEqual(response.data['alias'], self.owned.model.alias)
        self.assertEqual(response.data['location'], self.owned.model.location)
        self.assertEqual(response.data['access_policy'], self.owned.model.access_policy)
        self.assertEqual(response.data['visible'], self.owned.model.visible)

        self.assertEqual(len(response.data['items']), 2)
        self.assertEqual(response.data['items'][0]['id'], x1.pk)
        self.assertEqual(response.data['items'][0]['parse']['status'], 'verified')
        self.assertEqual(response.data['items'][0]['term_raw'], x1.term_raw)
        self.assertEqual(response.data['items'][0]['term_resolved'], x1.term_resolved)
        self.assertEqual(response.data['items'][1]['id'], x2.pk)
        self.assertEqual(response.data['items'][1]['term_raw'], x2.term_raw)
        self.assertEqual(response.data['items'][1]['term_resolved'], x2.term_resolved)
        self.assertEqual(response.data['editors'], [])
        self.assertEqual(response.data['inheritance'], [])
        self.assertEqual(response.data['oss'], [])

        self.executeOK(item=self.unowned_id)
        self.executeForbidden(item=self.private_id)

        self.logout()
        self.executeOK(item=self.owned_id)
        self.executeOK(item=self.unowned_id)
        self.executeForbidden(item=self.private_id)


    @decl_endpoint('/api/rsforms/{item}/check-expression', method='post')
    def test_check_expression(self):
        self.owned.insert_last('X1')
        data = {'expression': 'X1=X1'}
        response = self.executeOK(data, item=self.owned_id)
        self.assertEqual(response.data['parseResult'], True)
        self.assertEqual(response.data['syntax'], 'math')
        self.assertEqual(response.data['astText'], '[=[X1][X1]]')
        self.assertEqual(response.data['typification'], 'LOGIC')
        self.assertEqual(response.data['valueClass'], 'value')

        self.executeOK(data, item=self.unowned_id)


    @decl_endpoint('/api/rsforms/{item}/check-constituenta', method='post')
    def test_check_constituenta(self):
        self.owned.insert_last('X1')
        data = {'definition_formal': 'X1=X1', 'alias': 'A111', 'cst_type': CstType.AXIOM}
        response = self.executeOK(data, item=self.owned_id)
        self.assertEqual(response.data['parseResult'], True)
        self.assertEqual(response.data['syntax'], 'math')
        self.assertEqual(response.data['astText'], '[:==[A111][=[X1][X1]]]')
        self.assertEqual(response.data['typification'], 'LOGIC')
        self.assertEqual(response.data['valueClass'], 'value')


    @decl_endpoint('/api/rsforms/{item}/check-constituenta', method='post')
    def test_check_constituenta_error(self):
        self.owned.insert_last('X1')
        data = {'definition_formal': 'X1=X1', 'alias': 'D111', 'cst_type': CstType.TERM}
        response = self.executeOK(data, item=self.owned_id)
        self.assertEqual(response.data['parseResult'], False)


    @decl_endpoint('/api/rsforms/{item}/resolve', method='post')
    def test_resolve(self):
        x1 = self.owned.insert_last(
            alias='X1',
            term_resolved='синий слон'
        )

        data = {'text': '@{1|редкий} @{X1|plur,datv}'}
        response = self.executeOK(data, item=self.owned_id)
        self.assertEqual(response.data['input'], '@{1|редкий} @{X1|plur,datv}')
        self.assertEqual(response.data['output'], 'редким синим слонам')
        self.assertEqual(len(response.data['refs']), 2)
        self.assertEqual(response.data['refs'][0]['type'], ReferenceType.syntactic.value)
        self.assertEqual(response.data['refs'][0]['resolved'], 'редким')
        self.assertEqual(response.data['refs'][0]['data']['offset'], 1)
        self.assertEqual(response.data['refs'][0]['data']['nominal'], 'редкий')
        self.assertEqual(response.data['refs'][0]['pos_input']['start'], 0)
        self.assertEqual(response.data['refs'][0]['pos_input']['finish'], 11)
        self.assertEqual(response.data['refs'][0]['pos_output']['start'], 0)
        self.assertEqual(response.data['refs'][0]['pos_output']['finish'], 6)
        self.assertEqual(response.data['refs'][1]['type'], ReferenceType.entity.value)
        self.assertEqual(response.data['refs'][1]['resolved'], 'синим слонам')
        self.assertEqual(response.data['refs'][1]['data']['entity'], 'X1')
        self.assertEqual(response.data['refs'][1]['data']['form'], 'plur,datv')
        self.assertEqual(response.data['refs'][1]['pos_input']['start'], 12)
        self.assertEqual(response.data['refs'][1]['pos_input']['finish'], 27)
        self.assertEqual(response.data['refs'][1]['pos_output']['start'], 7)
        self.assertEqual(response.data['refs'][1]['pos_output']['finish'], 19)


    @decl_endpoint('/api/rsforms/import-trs', method='post')
    def test_import_trs(self):
        work_dir = os.path.dirname(os.path.abspath(__file__))
        with open(f'{work_dir}/data/sample-rsform.trs', 'rb') as file:
            data = {'file': file}
            response = self.client.post(self.endpoint, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['owner'], self.user.pk)
        self.assertTrue(response.data['title'] != '')


    @decl_endpoint('/api/rsforms/{item}/export-trs', method='get')
    def test_export_trs(self):
        schema = RSForm.create(title='Test')
        schema.insert_last('X1')
        response = self.executeOK(item=schema.model.pk)
        self.assertEqual(response.headers['Content-Disposition'], 'attachment; filename=Schema.trs')
        with io.BytesIO(response.content) as stream:
            with ZipFile(stream, 'r') as zipped_file:
                self.assertIsNone(zipped_file.testzip())
                self.assertIn('document.json', zipped_file.namelist())


    @decl_endpoint('/api/rsforms/{item}/substitute', method='patch')
    def test_substitute_multiple(self):
        self.set_params(item=self.owned_id)

        x1 = self.owned.insert_last('X1')
        x2 = self.owned.insert_last('X2')
        d1 = self.owned.insert_last('D1')
        d2 = self.owned.insert_last('D2')
        d3 = self.owned.insert_last(
            alias='D3',
            definition_formal=r'X1 \ X2'
        )

        data = {'substitutions': []}
        self.executeBadData(data)

        data = {'substitutions': [
            {
                'original': x1.pk,
                'substitution': d1.pk
            },
            {
                'original': x1.pk,
                'substitution': d2.pk
            }
        ]}
        self.executeBadData(data)

        data = {'substitutions': [
            {
                'original': x1.pk,
                'substitution': d1.pk
            },
            {
                'original': x2.pk,
                'substitution': d2.pk
            }
        ]}
        response = self.executeOK(data, item=self.owned_id)
        d3.refresh_from_db()
        self.assertEqual(d3.definition_formal, r'D1 \ D2')


    @decl_endpoint('/api/rsforms/{item}/create-cst', method='post')
    def test_create_constituenta_data(self):
        data = {
            'alias': 'X3',
            'cst_type': CstType.BASE,
            'convention': '1',
            'term_raw': '2',
            'definition_formal': '3',
            'definition_raw': '4'
        }
        response = self.executeCreated(data, item=self.owned_id)
        self.assertEqual(response.data['new_cst']['alias'], 'X3')
        self.assertEqual(response.data['new_cst']['cst_type'], CstType.BASE)
        self.assertEqual(response.data['new_cst']['convention'], '1')
        self.assertEqual(response.data['new_cst']['term_raw'], '2')
        self.assertEqual(response.data['new_cst']['term_resolved'], '2')
        self.assertEqual(response.data['new_cst']['definition_formal'], '3')
        self.assertEqual(response.data['new_cst']['definition_raw'], '4')
        self.assertEqual(response.data['new_cst']['definition_resolved'], '4')


    @decl_endpoint('/api/rsforms/{item}/delete-multiple-cst', method='patch')
    def test_delete_constituenta(self):
        self.set_params(item=self.owned_id)

        data = {'items': [1337]}
        self.executeBadData(data, item=self.owned_id)

        x1 = self.owned.insert_last('X1')
        x2 = self.owned.insert_last('X2')

        data = {'items': [x1.pk]}
        response = self.executeOK(data)
        x2.refresh_from_db()
        self.owned.model.refresh_from_db()
        self.assertEqual(len(response.data['items']), 1)
        self.assertEqual(self.owned.constituentsQ().count(), 1)
        self.assertEqual(x2.alias, 'X2')
        self.assertEqual(x2.order, 0)

        x3 = self.unowned.insert_last('X1')
        data = {'items': [x3.pk]}
        self.executeBadData(data, item=self.owned_id)


    @decl_endpoint('/api/rsforms/{item}/move-cst', method='patch')
    def test_move_constituenta(self):
        self.set_params(item=self.owned_id)

        data = {'items': [1337], 'move_to': 0}
        self.executeBadData(data)

        x1 = self.owned.insert_last('X1')
        x2 = self.owned.insert_last('X2')

        data = {'items': [x2.pk], 'move_to': 0}
        response = self.executeOK(data)
        x1.refresh_from_db()
        x2.refresh_from_db()
        self.assertEqual(response.data['id'], self.owned_id)
        self.assertEqual(x1.order, 1)
        self.assertEqual(x2.order, 0)

        x3 = self.unowned.insert_last('X1')
        data = {'items': [x3.pk], 'move_to': 0}
        self.executeBadData(data)


    @decl_endpoint('/api/rsforms/{item}/reset-aliases', method='patch')
    def test_reset_aliases(self):
        self.set_params(item=self.owned_id)

        response = self.executeOK()
        self.assertEqual(response.data['id'], self.owned_id)

        x2 = self.owned.insert_last('X2')
        x1 = self.owned.insert_last('X1')
        d11 = self.owned.insert_last('D11')

        response = self.executeOK()
        x1.refresh_from_db()
        x2.refresh_from_db()
        d11.refresh_from_db()
        self.assertEqual(x2.order, 0)
        self.assertEqual(x2.alias, 'X1')
        self.assertEqual(x1.order, 1)
        self.assertEqual(x1.alias, 'X2')
        self.assertEqual(d11.order, 2)
        self.assertEqual(d11.alias, 'D1')

        self.executeOK()


    @decl_endpoint('/api/rsforms/{item}/load-trs', method='patch')
    def test_load_trs(self):
        self.set_params(item=self.owned_id)
        self.owned.model.title = 'Test11'
        self.owned.model.save()
        x1 = self.owned.insert_last('X1')
        work_dir = os.path.dirname(os.path.abspath(__file__))
        with open(f'{work_dir}/data/sample-rsform.trs', 'rb') as file:
            data = {'file': file, 'load_metadata': False}
            response = self.client.patch(self.endpoint, data, format='multipart')
        self.owned.model.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.owned.model.title, 'Test11')
        self.assertEqual(len(response.data['items']), 25)
        self.assertEqual(self.owned.constituentsQ().count(), 25)
        self.assertFalse(Constituenta.objects.filter(pk=x1.pk).exists())


    @decl_endpoint('/api/rsforms/{item}/produce-structure', method='patch')
    def test_produce_structure(self):
        self.set_params(item=self.owned_id)
        x1 = self.owned.insert_last('X1')
        s1 = self.owned.insert_last(
            alias='S1',
            definition_formal='ℬ(X1×X1)'
        )
        s2 = self.owned.insert_last(
            alias='S2',
            definition_formal='invalid'
        )
        s3 = self.owned.insert_last(
            alias='S3',
            definition_formal='X1×(X1×ℬℬ(X1))×ℬ(X1×X1)'
        )
        a1 = self.owned.insert_last(
            alias='A1',
            definition_formal='1=1'
        )
        f1 = self.owned.insert_last(
            alias='F10',
            definition_formal='[α∈X1, β∈X1] Fi1[{α,β}](S1)'
        )
        invalid_id = f1.pk + 1337

        self.executeBadData({'target': invalid_id})
        self.executeBadData({'target': x1.pk})
        self.executeBadData({'target': s2.pk})

        # Testing simple structure
        response = self.executeOK({'target': s1.pk})
        result = response.data['schema']
        items = [item for item in result['items'] if item['id'] in response.data['cst_list']]
        self.assertEqual(len(items), 2)
        self.assertEqual(items[0]['definition_formal'], 'Pr1(S1)')
        self.assertEqual(items[1]['definition_formal'], 'Pr2(S1)')

        # Testing complex structure
        s3.refresh_from_db()
        response = self.executeOK({'target': s3.pk})
        result = response.data['schema']
        items = [item for item in result['items'] if item['id'] in response.data['cst_list']]
        self.assertEqual(len(items), 8)
        self.assertEqual(items[0]['definition_formal'], 'pr1(S3)')

        # Testing function
        f1.refresh_from_db()
        response = self.executeOK({'target': f1.pk})
        result = response.data['schema']
        items = [item for item in result['items'] if item['id'] in response.data['cst_list']]
        self.assertEqual(len(items), 2)
        self.assertEqual(items[0]['definition_formal'], '[α∈X1, β∈X1] Pr1(F10[α,β])')


class TestInlineSynthesis(EndpointTester):
    ''' Testing Inline synthesis. '''


    @decl_endpoint('/api/rsforms/inline-synthesis', method='patch')
    def setUp(self):
        super().setUp()
        self.schema1 = RSForm.create(title='Test1', alias='T1', owner=self.user)
        self.schema2 = RSForm.create(title='Test2', alias='T2', owner=self.user)
        self.unowned = RSForm.create(title='Test3', alias='T3')


    def test_inline_synthesis_inputs(self):
        invalid_id = 1338
        data = {
            'receiver': self.unowned.model.pk,
            'source': self.schema1.model.pk,
            'items': [],
            'substitutions': []
        }
        self.executeForbidden(data)

        data['receiver'] = invalid_id
        self.executeBadData(data)

        data['receiver'] = self.schema1.model.pk
        data['source'] = invalid_id
        self.executeBadData(data)

        data['source'] = self.schema1.model.pk
        self.executeOK(data)

        data['items'] = [invalid_id]
        self.executeBadData(data)


    def test_inline_synthesis(self):
        ks1_x1 = self.schema1.insert_last('X1', term_raw='KS1X1')  # -> delete
        ks1_x2 = self.schema1.insert_last('X2', term_raw='KS1X2')  # -> X2
        ks1_s1 = self.schema1.insert_last('S1', definition_formal='X2', term_raw='KS1S1')  # -> S1
        ks1_d1 = self.schema1.insert_last('D1', definition_formal=r'S1\X1\X2')  # -> D1
        ks2_x1 = self.schema2.insert_last('X1', term_raw='KS2X1')  # -> delete
        ks2_x2 = self.schema2.insert_last('X2', term_raw='KS2X2')  # -> X4
        ks2_s1 = self.schema2.insert_last('S1', definition_formal='X2×X2', term_raw='KS2S1')  # -> S2
        ks2_d1 = self.schema2.insert_last('D1', definition_formal=r'S1\X1\X2')  # -> D2
        ks2_a1 = self.schema2.insert_last('A1', definition_formal='1=1')  # -> not included in items

        data = {
            'receiver': self.schema1.model.pk,
            'source': self.schema2.model.pk,
            'items': [ks2_x1.pk, ks2_x2.pk, ks2_s1.pk, ks2_d1.pk],
            'substitutions': [
                {
                    'original': ks1_x1.pk,
                    'substitution': ks2_s1.pk
                },
                {
                    'original': ks2_x1.pk,
                    'substitution': ks1_s1.pk
                }
            ]
        }
        response = self.executeOK(data)
        result = {item['alias']: item for item in response.data['items']}
        self.assertEqual(len(result), 6)
        self.assertEqual(result['S1']['definition_formal'], 'X2')
        self.assertEqual(result['S2']['definition_formal'], 'X4×X4')
        self.assertEqual(result['D1']['definition_formal'], r'S1\S2\X2')
        self.assertEqual(result['D2']['definition_formal'], r'S2\S1\X4')
