''' Testing API: RSForms. '''
import os
import io
from zipfile import ZipFile
from rest_framework.test import APITestCase, APIRequestFactory, APIClient
from rest_framework import status

from apps.users.models import User
from apps.rsform.models import (
  RSForm,
  Constituenta,
  CstType,
  LibraryItem,
  LibraryItemType
)

from cctext import ReferenceType
from ..utils import response_contains


class TestRSFormViewset(APITestCase):
    ''' Testing RSForm view. '''
    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.create(username='UserTest')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.owned = RSForm.create(title='Test', alias='T1', owner=self.user)
        self.unowned = RSForm.create(title='Test2', alias='T2')

    def test_list(self):
        non_schema = LibraryItem.objects.create(
            item_type=LibraryItemType.OPERATIONS_SCHEMA,
            title='Test3'
        )
        response = self.client.get('/api/rsforms')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response_contains(response, non_schema))
        self.assertTrue(response_contains(response, self.unowned.item))
        self.assertTrue(response_contains(response, self.owned.item))

        response = self.client.get('/api/library')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response_contains(response, non_schema))
        self.assertTrue(response_contains(response, self.unowned.item))
        self.assertTrue(response_contains(response, self.owned.item))

    def test_contents(self):
        schema = RSForm.create(title='Title1')
        schema.insert_last(alias='X1', insert_type=CstType.BASE)
        response = self.client.get(f'/api/rsforms/{schema.item.id}/contents')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_details(self):
        schema = RSForm.create(title='Test', owner=self.user)
        x1 = schema.insert_at(1, 'X1', CstType.BASE)
        x2 = schema.insert_at(2, 'X2', CstType.BASE)
        x1.term_raw = 'человек'
        x1.term_resolved = 'человек'
        x2.term_raw = '@{X1|plur}'
        x2.term_resolved = 'люди'
        x1.save()
        x2.save()

        response = self.client.get(f'/api/rsforms/{schema.item.id}/details')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Test')
        self.assertEqual(len(response.data['items']), 2)
        self.assertEqual(response.data['items'][0]['id'], x1.id)
        self.assertEqual(response.data['items'][0]['parse']['status'], 'verified')
        self.assertEqual(response.data['items'][0]['term_raw'], x1.term_raw)
        self.assertEqual(response.data['items'][0]['term_resolved'], x1.term_resolved)
        self.assertEqual(response.data['items'][1]['id'], x2.id)
        self.assertEqual(response.data['items'][1]['term_raw'], x2.term_raw)
        self.assertEqual(response.data['items'][1]['term_resolved'], x2.term_resolved)
        self.assertEqual(response.data['subscribers'], [self.user.pk])

    def test_check(self):
        schema = RSForm.create(title='Test')
        schema.insert_at(1, 'X1', CstType.BASE)
        data = {'expression': 'X1=X1'}
        response = self.client.post(
            f'/api/rsforms/{schema.item.id}/check',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['parseResult'], True)
        self.assertEqual(response.data['syntax'], 'math')
        self.assertEqual(response.data['astText'], '[=[X1][X1]]')
        self.assertEqual(response.data['typification'], 'LOGIC')
        self.assertEqual(response.data['valueClass'], 'value')

        response = self.client.post(
            f'/api/rsforms/{self.unowned.item.id}/check',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_resolve(self):
        schema = RSForm.create(title='Test')
        x1 = schema.insert_at(1, 'X1', CstType.BASE)
        x1.term_resolved = 'синий слон'
        x1.save()
        data = {'text': '@{1|редкий} @{X1|plur,datv}'}
        response = self.client.post(
            f'/api/rsforms/{schema.item.id}/resolve',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
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

    def test_import_trs(self):
        work_dir = os.path.dirname(os.path.abspath(__file__))
        with open(f'{work_dir}/data/sample-rsform.trs', 'rb') as file:
            data = {'file': file}
            response = self.client.post('/api/rsforms/import-trs', data=data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['owner'], self.user.pk)
        self.assertTrue(response.data['title'] != '')

    def test_export_trs(self):
        schema = RSForm.create(title='Test')
        schema.insert_at(1, 'X1', CstType.BASE)
        response = self.client.get(f'/api/rsforms/{schema.item.id}/export-trs')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.headers['Content-Disposition'], 'attachment; filename=Schema.trs')
        with io.BytesIO(response.content) as stream:
            with ZipFile(stream, 'r') as zipped_file:
                self.assertIsNone(zipped_file.testzip())
                self.assertIn('document.json', zipped_file.namelist())

    def test_create_constituenta(self):
        data = {'alias': 'X3', 'cst_type': 'basic'}
        response = self.client.post(
            f'/api/rsforms/{self.unowned.item.id}/cst-create',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        item = self.owned.item
        Constituenta.objects.create(
            schema=item,
            alias='X1',
            cst_type='basic',
            order=1
        )
        x2 = Constituenta.objects.create(
            schema=item,
            alias='X2',
            cst_type='basic',
            order=2
        )
        response = self.client.post(
            f'/api/rsforms/{item.id}/cst-create',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['new_cst']['alias'], 'X3')
        x3 = Constituenta.objects.get(alias=response.data['new_cst']['alias'])
        self.assertEqual(x3.order, 3)

        data = {
            'alias': 'X4',
            'cst_type': 'basic',
            'insert_after': x2.id,
            'term_raw': 'test',
            'term_forms': [{'text':'form1', 'tags':'sing,datv'}]
        }
        response = self.client.post(
            f'/api/rsforms/{item.id}/cst-create',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['new_cst']['alias'], data['alias'])
        x4 = Constituenta.objects.get(alias=response.data['new_cst']['alias'])
        self.assertEqual(x4.order, 3)
        self.assertEqual(x4.term_raw, data['term_raw'])
        self.assertEqual(x4.term_forms, data['term_forms'])

    def test_rename_constituenta(self):
        cst1 = Constituenta.objects.create(
            alias='X1',
            schema=self.owned.item,
            order=1,
            convention='Test',
            term_raw='Test1',
            term_resolved='Test1',
            term_forms=[{'text':'form1', 'tags':'sing,datv'}]
        )
        cst2 = Constituenta.objects.create(
            alias='X2',
            schema=self.unowned.item,
            order=1
        )
        cst3 = Constituenta.objects.create(
            alias='X3',
            schema=self.owned.item, order=2,
            term_raw='Test3',
            term_resolved='Test3',
            definition_raw='Test1',
            definition_resolved='Test2'
        )
        
        data = {'id': cst2.pk, 'alias': 'D2', 'cst_type': 'term'}
        response = self.client.patch(
            f'/api/rsforms/{self.unowned.item.id}/cst-rename',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        response = self.client.patch(
            f'/api/rsforms/{self.owned.item.id}/cst-rename',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        data = {'id': cst1.pk, 'alias': cst1.alias, 'cst_type': 'term'}
        response = self.client.patch(
            f'/api/rsforms/{self.owned.item.id}/cst-rename',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        data = {'id': cst1.pk, 'alias': cst3.alias}
        response = self.client.patch(
            f'/api/rsforms/{self.owned.item.id}/cst-rename',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        data = {'alias': 'D2', 'cst_type': 'term', 'id': cst1.pk}
        item = self.owned.item
        d1 = Constituenta.objects.create(schema=item, alias='D1', cst_type='term', order=4)
        d1.term_raw = '@{X1|plur}'
        d1.definition_formal = 'X1'
        d1.save()
        
        self.assertEqual(d1.order, 4)
        self.assertEqual(cst1.order, 1)
        self.assertEqual(cst1.alias, 'X1')
        self.assertEqual(cst1.cst_type, CstType.BASE)
        response = self.client.patch(
            f'/api/rsforms/{item.id}/cst-rename',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['new_cst']['alias'], 'D2')
        self.assertEqual(response.data['new_cst']['cst_type'], 'term')
        d1.refresh_from_db()
        cst1.refresh_from_db()
        self.assertEqual(d1.order, 4)
        self.assertEqual(d1.term_resolved, '')
        self.assertEqual(d1.term_raw,  '@{D2|plur}')
        self.assertEqual(cst1.order, 1)
        self.assertEqual(cst1.alias, 'D2')
        self.assertEqual(cst1.cst_type, CstType.TERM)

    def test_substitute_constituenta(self):
        x1 = Constituenta.objects.create(
            alias='X1',
            schema=self.owned.item,
            order=1,
            term_raw='Test1',
            term_resolved='Test1',
            term_forms=[{'text':'form1', 'tags':'sing,datv'}]
        )
        x2 = Constituenta.objects.create(
            alias='X2',
            schema=self.owned.item,
            order=2,
            term_raw='Test2'
        )
        unowned = Constituenta.objects.create(
            alias='X2',
            schema=self.unowned.item,
            order=1
        )
        
        data = {'original': x1.pk, 'substitution': unowned.pk, 'transfer_term': True}
        response = self.client.patch(
            f'/api/rsforms/{self.unowned.item.id}/cst-substitute',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        response = self.client.patch(
            f'/api/rsforms/{self.owned.item.id}/cst-substitute',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        data = {'original': unowned.pk, 'substitution': x1.pk, 'transfer_term': True}
        response = self.client.patch(
            f'/api/rsforms/{self.owned.item.id}/cst-substitute',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        data = {'original': x1.pk, 'substitution': x1.pk, 'transfer_term': True}
        response = self.client.patch(
            f'/api/rsforms/{self.owned.item.id}/cst-substitute',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        d1 = Constituenta.objects.create(
            alias='D1',
            schema=self.owned.item,
            order=3,
            term_raw='@{X2|sing,datv}',
            definition_formal='X1'
        )
        data = {'original': x1.pk, 'substitution': x2.pk, 'transfer_term': True}
        response = self.client.patch(
            f'/api/rsforms/{self.owned.item.id}/cst-substitute',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        d1.refresh_from_db()
        x2.refresh_from_db()
        self.assertEqual(x2.term_raw, 'Test1')
        self.assertEqual(d1.term_resolved, 'form1')
        self.assertEqual(d1.definition_formal, 'X2')

    def test_create_constituenta_data(self):
        data = {
            'alias': 'X3',
            'cst_type': 'basic',
            'convention': '1',
            'term_raw': '2',
            'definition_formal': '3',
            'definition_raw': '4'
        }
        item = self.owned.item
        response = self.client.post(
            f'/api/rsforms/{item.id}/cst-create',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['new_cst']['alias'], 'X3')
        self.assertEqual(response.data['new_cst']['cst_type'], 'basic')
        self.assertEqual(response.data['new_cst']['convention'], '1')
        self.assertEqual(response.data['new_cst']['term_raw'], '2')
        self.assertEqual(response.data['new_cst']['term_resolved'], '2')
        self.assertEqual(response.data['new_cst']['definition_formal'], '3')
        self.assertEqual(response.data['new_cst']['definition_raw'], '4')
        self.assertEqual(response.data['new_cst']['definition_resolved'], '4')

    def test_delete_constituenta(self):
        schema = self.owned
        data = {'items': [1337]}
        response = self.client.patch(
            f'/api/rsforms/{schema.item.id}/cst-delete-multiple',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        x1 = Constituenta.objects.create(schema=schema.item, alias='X1', cst_type='basic', order=1)
        x2 = Constituenta.objects.create(schema=schema.item, alias='X2', cst_type='basic', order=2)
        data = {'items': [x1.id]}
        response = self.client.patch(
            f'/api/rsforms/{schema.item.id}/cst-delete-multiple',
            data=data, format='json'
        )
        x2.refresh_from_db()
        schema.item.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        self.assertEqual(len(response.data['items']), 1)
        self.assertEqual(schema.constituents().count(), 1)
        self.assertEqual(x2.alias, 'X2')
        self.assertEqual(x2.order, 1)

        x3 = Constituenta.objects.create(schema=self.unowned.item, alias='X1', cst_type='basic', order=1)
        data = {'items': [x3.id]}
        response = self.client.patch(
            f'/api/rsforms/{schema.item.id}/cst-delete-multiple',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_move_constituenta(self):
        item = self.owned.item
        data = {'items': [1337], 'move_to': 1}
        response = self.client.patch(
            f'/api/rsforms/{item.id}/cst-moveto',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        x1 = Constituenta.objects.create(schema=item, alias='X1', cst_type='basic', order=1)
        x2 = Constituenta.objects.create(schema=item, alias='X2', cst_type='basic', order=2)
        data = {'items': [x2.id], 'move_to': 1}
        response = self.client.patch(
            f'/api/rsforms/{item.id}/cst-moveto',
            data=data, format='json'
        )
        x1.refresh_from_db()
        x2.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], item.id)
        self.assertEqual(x1.order, 2)
        self.assertEqual(x2.order, 1)

        x3 = Constituenta.objects.create(schema=self.unowned.item, alias='X1', cst_type='basic', order=1)
        data = {'items': [x3.id], 'move_to': 1}
        response = self.client.patch(
            f'/api/rsforms/{item.id}/cst-moveto',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_reset_aliases(self):
        item = self.owned.item
        response = self.client.patch(f'/api/rsforms/{item.id}/reset-aliases')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], item.id)

        x2 = Constituenta.objects.create(schema=item, alias='X2', cst_type='basic', order=1)
        x1 = Constituenta.objects.create(schema=item, alias='X1', cst_type='basic', order=2)
        d11 = Constituenta.objects.create(schema=item, alias='D11', cst_type='term', order=3)
        response = self.client.patch(f'/api/rsforms/{item.id}/reset-aliases')
        x1.refresh_from_db()
        x2.refresh_from_db()
        d11.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(x2.order, 1)
        self.assertEqual(x2.alias, 'X1')
        self.assertEqual(x1.order, 2)
        self.assertEqual(x1.alias, 'X2')
        self.assertEqual(d11.order, 3)
        self.assertEqual(d11.alias, 'D1')

        response = self.client.patch(f'/api/rsforms/{item.id}/reset-aliases')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_load_trs(self):
        schema = self.owned
        schema.item.title = 'Test11'
        schema.item.save()
        x1 = Constituenta.objects.create(schema=schema.item, alias='X1', cst_type='basic', order=1)
        work_dir = os.path.dirname(os.path.abspath(__file__))
        with open(f'{work_dir}/data/sample-rsform.trs', 'rb') as file:
            data = {'file': file, 'load_metadata': False}
            response = self.client.patch(
                f'/api/rsforms/{schema.item.id}/load-trs',
                data=data, format='multipart'
            )
        schema.item.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(schema.item.title, 'Test11')
        self.assertEqual(len(response.data['items']), 25)
        self.assertEqual(schema.constituents().count(), 25)
        self.assertFalse(Constituenta.objects.filter(pk=x1.id).exists())

    def test_clone(self):
        item = self.owned.item
        item.title = 'Test11'
        item.save()
        x1 = Constituenta.objects.create(schema=item, alias='X12', cst_type='basic', order=1)
        d1 = Constituenta.objects.create(schema=item, alias='D2', cst_type='term', order=1)
        x1.term_raw = 'человек'
        x1.term_resolved = 'человек'
        d1.term_raw = '@{X12|plur}'
        d1.term_resolved = 'люди'
        x1.save()
        d1.save()

        data = {'title': 'Title'}
        response = self.client.post(
            f'/api/library/{item.id}/clone',
            data=data, format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Title')
        self.assertEqual(response.data['items'][0]['alias'], x1.alias)
        self.assertEqual(response.data['items'][0]['term_raw'], x1.term_raw)
        self.assertEqual(response.data['items'][0]['term_resolved'], x1.term_resolved)
        self.assertEqual(response.data['items'][1]['term_raw'], d1.term_raw)
        self.assertEqual(response.data['items'][1]['term_resolved'], d1.term_resolved)
