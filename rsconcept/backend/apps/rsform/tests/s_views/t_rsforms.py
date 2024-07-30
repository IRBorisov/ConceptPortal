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
            'comment': '123',
            'alias': 'ks1',
            'location': LocationHead.PROJECTS,
            'access_policy': AccessPolicy.PROTECTED,
            'visible': False
        }
        self.executeBadData(data=data)

        with open(f'{work_dir}/data/sample-rsform.trs', 'rb') as file:
            data['file'] = file
            response = self.client.post(self.endpoint, data=data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['owner'], self.user.pk)
        self.assertEqual(response.data['title'], data['title'])
        self.assertEqual(response.data['alias'], data['alias'])
        self.assertEqual(response.data['comment'], data['comment'])


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
        x1 = self.owned.insert_new(
            alias='X1',
            term_raw='человек',
            term_resolved='человек'
        )
        x2 = self.owned.insert_new(
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
        self.assertEqual(response.data['subscribers'], [self.user.pk])
        self.assertEqual(response.data['editors'], [])

        self.executeOK(item=self.unowned_id)
        self.executeForbidden(item=self.private_id)

        self.logout()
        self.executeOK(item=self.owned_id)
        self.executeOK(item=self.unowned_id)
        self.executeForbidden(item=self.private_id)


    @decl_endpoint('/api/rsforms/{item}/check', method='post')
    def test_check(self):
        self.owned.insert_new('X1')
        data = {'expression': 'X1=X1'}
        response = self.executeOK(data=data, item=self.owned_id)
        self.assertEqual(response.data['parseResult'], True)
        self.assertEqual(response.data['syntax'], 'math')
        self.assertEqual(response.data['astText'], '[=[X1][X1]]')
        self.assertEqual(response.data['typification'], 'LOGIC')
        self.assertEqual(response.data['valueClass'], 'value')

        self.executeOK(data=data, item=self.unowned_id)


    @decl_endpoint('/api/rsforms/{item}/resolve', method='post')
    def test_resolve(self):
        x1 = self.owned.insert_new(
            alias='X1',
            term_resolved='синий слон'
        )

        data = {'text': '@{1|редкий} @{X1|plur,datv}'}
        response = self.executeOK(data=data, item=self.owned_id)
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
            response = self.client.post(self.endpoint, data=data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['owner'], self.user.pk)
        self.assertTrue(response.data['title'] != '')


    @decl_endpoint('/api/rsforms/{item}/export-trs', method='get')
    def test_export_trs(self):
        schema = RSForm.create(title='Test')
        schema.insert_new('X1')
        response = self.executeOK(item=schema.model.pk)
        self.assertEqual(response.headers['Content-Disposition'], 'attachment; filename=Schema.trs')
        with io.BytesIO(response.content) as stream:
            with ZipFile(stream, 'r') as zipped_file:
                self.assertIsNone(zipped_file.testzip())
                self.assertIn('document.json', zipped_file.namelist())


    @decl_endpoint('/api/rsforms/{item}/create-cst', method='post')
    def test_create_constituenta(self):
        data = {'alias': 'X3'}
        self.executeForbidden(data=data, item=self.unowned_id)

        self.owned.insert_new('X1')
        x2 = self.owned.insert_new('X2')
        self.executeBadData(item=self.owned_id)
        self.executeBadData(data=data, item=self.owned_id)

        data['cst_type'] = 'invalid'
        self.executeBadData(data=data, item=self.owned_id)

        data['cst_type'] = CstType.BASE
        response = self.executeCreated(data=data, item=self.owned_id)
        self.assertEqual(response.data['new_cst']['alias'], 'X3')
        x3 = Constituenta.objects.get(alias=response.data['new_cst']['alias'])
        self.assertEqual(x3.order, 3)

        data = {
            'alias': 'X4',
            'cst_type': CstType.BASE,
            'insert_after': x2.pk,
            'term_raw': 'test',
            'term_forms': [{'text': 'form1', 'tags': 'sing,datv'}]
        }
        response = self.executeCreated(data=data, item=self.owned_id)
        self.assertEqual(response.data['new_cst']['alias'], data['alias'])
        x4 = Constituenta.objects.get(alias=response.data['new_cst']['alias'])
        self.assertEqual(x4.order, 3)
        self.assertEqual(x4.term_raw, data['term_raw'])
        self.assertEqual(x4.term_forms, data['term_forms'])

        data = {
            'alias': 'X5',
            'cst_type': CstType.BASE,
            'insert_after': None,
            'term_raw': 'test5'
        }
        response = self.executeCreated(data=data, item=self.owned_id)
        self.assertEqual(response.data['new_cst']['alias'], data['alias'])


    @decl_endpoint('/api/rsforms/{item}/rename-cst', method='patch')
    def test_rename_constituenta(self):
        x1 = self.owned.insert_new(
            alias='X1',
            convention='Test',
            term_raw='Test1',
            term_resolved='Test1',
            term_forms=[{'text': 'form1', 'tags': 'sing,datv'}]
        )
        x2_2 = self.unowned.insert_new('X2')
        x3 = self.owned.insert_new(
            alias='X3',
            term_raw='Test3',
            term_resolved='Test3',
            definition_raw='Test1',
            definition_resolved='Test2'
        )

        data = {'target': x2_2.pk, 'alias': 'D2', 'cst_type': CstType.TERM}
        self.executeForbidden(data=data, item=self.unowned_id)
        self.executeBadData(data=data, item=self.owned_id)

        data = {'target': x1.pk, 'alias': x1.alias, 'cst_type': CstType.TERM}
        self.executeBadData(data=data, item=self.owned_id)

        data = {'target': x1.pk, 'alias': x3.alias}
        self.executeBadData(data=data, item=self.owned_id)

        d1 = self.owned.insert_new(
            alias='D1',
            term_raw='@{X1|plur}',
            definition_formal='X1'
        )
        self.assertEqual(x1.order, 1)
        self.assertEqual(x1.alias, 'X1')
        self.assertEqual(x1.cst_type, CstType.BASE)

        data = {'target': x1.pk, 'alias': 'D2', 'cst_type': CstType.TERM}
        response = self.executeOK(data=data, item=self.owned_id)
        self.assertEqual(response.data['new_cst']['alias'], 'D2')
        self.assertEqual(response.data['new_cst']['cst_type'], CstType.TERM)
        d1.refresh_from_db()
        x1.refresh_from_db()
        self.assertEqual(d1.term_resolved, '')
        self.assertEqual(d1.term_raw, '@{D2|plur}')
        self.assertEqual(x1.order, 1)
        self.assertEqual(x1.alias, 'D2')
        self.assertEqual(x1.cst_type, CstType.TERM)


    @decl_endpoint('/api/rsforms/{item}/substitute', method='patch')
    def test_substitute_multiple(self):
        self.set_params(item=self.owned_id)
        x1 = self.owned.insert_new('X1')
        x2 = self.owned.insert_new('X2')
        d1 = self.owned.insert_new('D1')
        d2 = self.owned.insert_new('D2')
        d3 = self.owned.insert_new(
            alias='D3',
            definition_formal=r'X1 \ X2'
        )

        data = {'substitutions': []}
        self.executeBadData(data=data)

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
        self.executeBadData(data=data)

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
        response = self.executeOK(data=data, item=self.owned_id)
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
        response = self.executeCreated(data=data, item=self.owned_id)
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
        self.executeBadData(data=data)

        x1 = self.owned.insert_new('X1')
        x2 = self.owned.insert_new('X2')

        data = {'items': [x1.pk]}
        response = self.executeOK(data=data)
        x2.refresh_from_db()
        self.owned.refresh_from_db()
        self.assertEqual(len(response.data['items']), 1)
        self.assertEqual(self.owned.constituents().count(), 1)
        self.assertEqual(x2.alias, 'X2')
        self.assertEqual(x2.order, 1)

        x3 = self.unowned.insert_new('X1')
        data = {'items': [x3.pk]}
        self.executeBadData(data=data, item=self.owned_id)


    @decl_endpoint('/api/rsforms/{item}/move-cst', method='patch')
    def test_move_constituenta(self):
        self.set_params(item=self.owned_id)

        data = {'items': [1337], 'move_to': 1}
        self.executeBadData(data=data)

        x1 = self.owned.insert_new('X1')
        x2 = self.owned.insert_new('X2')

        data = {'items': [x2.pk], 'move_to': 1}
        response = self.executeOK(data=data)
        x1.refresh_from_db()
        x2.refresh_from_db()
        self.assertEqual(response.data['id'], self.owned_id)
        self.assertEqual(x1.order, 2)
        self.assertEqual(x2.order, 1)

        x3 = self.unowned.insert_new('X1')
        data = {'items': [x3.pk], 'move_to': 1}
        self.executeBadData(data=data)


    @decl_endpoint('/api/rsforms/{item}/reset-aliases', method='patch')
    def test_reset_aliases(self):
        self.set_params(item=self.owned_id)

        response = self.executeOK()
        self.assertEqual(response.data['id'], self.owned_id)

        x2 = self.owned.insert_new('X2')
        x1 = self.owned.insert_new('X1')
        d11 = self.owned.insert_new('D11')

        response = self.executeOK()
        x1.refresh_from_db()
        x2.refresh_from_db()
        d11.refresh_from_db()
        self.assertEqual(x2.order, 1)
        self.assertEqual(x2.alias, 'X1')
        self.assertEqual(x1.order, 2)
        self.assertEqual(x1.alias, 'X2')
        self.assertEqual(d11.order, 3)
        self.assertEqual(d11.alias, 'D1')

        self.executeOK()


    @decl_endpoint('/api/rsforms/{item}/load-trs', method='patch')
    def test_load_trs(self):
        self.set_params(item=self.owned_id)
        self.owned.model.title = 'Test11'
        self.owned.save()
        x1 = self.owned.insert_new('X1')
        work_dir = os.path.dirname(os.path.abspath(__file__))
        with open(f'{work_dir}/data/sample-rsform.trs', 'rb') as file:
            data = {'file': file, 'load_metadata': False}
            response = self.client.patch(self.endpoint, data=data, format='multipart')
        self.owned.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.owned.model.title, 'Test11')
        self.assertEqual(len(response.data['items']), 25)
        self.assertEqual(self.owned.constituents().count(), 25)
        self.assertFalse(Constituenta.objects.filter(pk=x1.pk).exists())


    @decl_endpoint('/api/rsforms/{item}/produce-structure', method='patch')
    def test_produce_structure(self):
        self.set_params(item=self.owned_id)
        x1 = self.owned.insert_new('X1')
        s1 = self.owned.insert_new(
            alias='S1',
            definition_formal='ℬ(X1×X1)'
        )
        s2 = self.owned.insert_new(
            alias='S2',
            definition_formal='invalid'
        )
        s3 = self.owned.insert_new(
            alias='S3',
            definition_formal='X1×(X1×ℬℬ(X1))×ℬ(X1×X1)'
        )
        a1 = self.owned.insert_new(
            alias='A1',
            definition_formal='1=1'
        )
        f1 = self.owned.insert_new(
            alias='F10',
            definition_formal='[α∈X1, β∈X1] Fi1[{α,β}](S1)'
        )
        invalid_id = f1.pk + 1337

        self.executeBadData({'target': invalid_id})
        self.executeBadData({'target': x1.pk})
        self.executeBadData({'target': s2.pk})

        # Testing simple structure
        response = self.executeOK(data={'target': s1.pk})
        result = response.data['schema']
        items = [item for item in result['items'] if item['id'] in response.data['cst_list']]
        self.assertEqual(len(items), 2)
        self.assertEqual(items[0]['order'], s1.order + 1)
        self.assertEqual(items[0]['definition_formal'], 'Pr1(S1)')
        self.assertEqual(items[1]['order'], s1.order + 2)
        self.assertEqual(items[1]['definition_formal'], 'Pr2(S1)')

        # Testing complex structure
        s3.refresh_from_db()
        response = self.executeOK(data={'target': s3.pk})
        result = response.data['schema']
        items = [item for item in result['items'] if item['id'] in response.data['cst_list']]
        self.assertEqual(len(items), 8)
        self.assertEqual(items[0]['order'], s3.order + 1)
        self.assertEqual(items[0]['definition_formal'], 'pr1(S3)')

        # Testing function
        f1.refresh_from_db()
        response = self.executeOK(data={'target': f1.pk})
        result = response.data['schema']
        items = [item for item in result['items'] if item['id'] in response.data['cst_list']]
        self.assertEqual(len(items), 2)
        self.assertEqual(items[0]['order'], f1.order + 1)
        self.assertEqual(items[0]['definition_formal'], '[α∈X1, β∈X1] Pr1(F10[α,β])')
