''' Testing views '''
import os
import io
from zipfile import ZipFile
from rest_framework.test import APITestCase, APIRequestFactory, APIClient
from rest_framework.exceptions import ErrorDetail

from cctext import ReferenceType, split_grams

from apps.users.models import User
from apps.rsform.models import Syntax, RSForm, Constituenta, CstType, LibraryItem, LibraryItemType, Subscription
from apps.rsform.views import (
    convert_to_ascii,
    convert_to_math,
    parse_expression,
    inflect,
    parse_text,
    generate_lexeme
)


def _response_contains(response, item: LibraryItem) -> bool:
    return any(x for x in response.data if x['id'] == item.pk)


class TestConstituentaAPI(APITestCase):
    ''' Testing Constituenta view. '''
    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.create(username='UserTest')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.rsform_owned = RSForm.create(title='Test', alias='T1', owner=self.user)
        self.rsform_unowned = RSForm.create(title='Test2', alias='T2')
        self.cst1 = Constituenta.objects.create(
            alias='X1', schema=self.rsform_owned.item, order=1, convention='Test',
            term_raw='Test1', term_resolved='Test1R',
            term_forms=[{'text':'form1', 'tags':'sing,datv'}])
        self.cst2 = Constituenta.objects.create(
            alias='X2', schema=self.rsform_unowned.item, order=1, convention='Test1',
            term_raw='Test2', term_resolved='Test2R')
        self.cst3 = Constituenta.objects.create(
            alias='X3', schema=self.rsform_owned.item, order=2,
            term_raw='Test3', term_resolved='Test3',
            definition_raw='Test1', definition_resolved='Test2')

    def test_retrieve(self):
        response = self.client.get(f'/api/constituents/{self.cst1.id}')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['alias'], self.cst1.alias)
        self.assertEqual(response.data['convention'], self.cst1.convention)

    def test_partial_update(self):
        data = {'convention': 'tt'}
        response = self.client.patch(
            f'/api/constituents/{self.cst2.id}',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, 403)

        self.client.logout()
        response = self.client.patch(
            f'/api/constituents/{self.cst1.id}',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, 403)

        self.client.force_authenticate(user=self.user)
        response = self.client.patch(
            f'/api/constituents/{self.cst1.id}',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.cst1.refresh_from_db()
        self.assertEqual(response.data['convention'], 'tt')
        self.assertEqual(self.cst1.convention, 'tt')

        response = self.client.patch(
            f'/api/constituents/{self.cst1.id}',
            data=data,
            format='json'
        )
        self.assertEqual(response.status_code, 200)

    def test_update_resolved_norefs(self):
        data = {
            'term_raw': 'New term',
            'definition_raw': 'New def'
        }
        response = self.client.patch(f'/api/constituents/{self.cst3.id}', data, format='json')
        self.assertEqual(response.status_code, 200)
        self.cst3.refresh_from_db()
        self.assertEqual(response.data['term_resolved'], 'New term')
        self.assertEqual(self.cst3.term_resolved, 'New term')
        self.assertEqual(response.data['definition_resolved'], 'New def')
        self.assertEqual(self.cst3.definition_resolved, 'New def')

    def test_update_resolved_refs(self):
        data = {
            'term_raw': '@{X1|nomn,sing}',
            'definition_raw': '@{X1|nomn,sing} @{X1|sing,datv}'
        }
        response = self.client.patch(
            f'/api/constituents/{self.cst3.id}',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.cst3.refresh_from_db()
        self.assertEqual(self.cst3.term_resolved, self.cst1.term_resolved)
        self.assertEqual(response.data['term_resolved'], self.cst1.term_resolved)
        self.assertEqual(self.cst3.definition_resolved, f'{self.cst1.term_resolved} form1')
        self.assertEqual(response.data['definition_resolved'], f'{self.cst1.term_resolved} form1')

    def test_readonly_cst_fields(self):
        data = {'alias': 'X33', 'order': 10}
        response = self.client.patch(
            f'/api/constituents/{self.cst1.id}',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['alias'], 'X1')
        self.assertEqual(response.data['alias'], self.cst1.alias)
        self.assertEqual(response.data['order'], self.cst1.order)


class TestLibraryViewset(APITestCase):
    ''' Testing Library view. '''
    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.create(username='UserTest')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.owned = LibraryItem.objects.create(
            item_type=LibraryItemType.RSFORM,
            title='Test',
            alias='T1',
            owner=self.user
        )
        self.unowned = LibraryItem.objects.create(
            item_type=LibraryItemType.RSFORM,
            title='Test2',
            alias='T2'
        )
        self.common = LibraryItem.objects.create(
            item_type=LibraryItemType.RSFORM,
            title='Test3',
            alias='T3',
            is_common=True
        )

    def test_create_anonymous(self):
        self.client.logout()
        data = {'title': 'Title'}
        response = self.client.post('/api/library', data=data, format='json')
        self.assertEqual(response.status_code, 403)

    def test_create_populate_user(self):
        data = {'title': 'Title'}
        response = self.client.post('/api/library', data=data, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['title'], 'Title')
        self.assertEqual(response.data['owner'], self.user.id)

    def test_update(self):
        data = {'id': self.owned.id, 'title': 'New title'}
        response = self.client.patch(
            f'/api/library/{self.owned.id}',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['title'], 'New title')
        self.assertEqual(response.data['alias'], self.owned.alias)

    def test_update_unowned(self):
        data = {'id': self.unowned.id, 'title': 'New title'}
        response = self.client.patch(
            f'/api/library/{self.unowned.id}',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, 403)

    def test_destroy(self):
        response = self.client.delete(f'/api/library/{self.owned.id}')
        self.assertTrue(response.status_code in [202, 204])

    def test_destroy_admin_override(self):
        response = self.client.delete(f'/api/library/{self.unowned.id}')
        self.assertEqual(response.status_code, 403)
        self.user.is_staff = True
        self.user.save()
        response = self.client.delete(f'/api/library/{self.unowned.id}')
        self.assertTrue(response.status_code in [202, 204])

    def test_claim(self):
        response = self.client.post(f'/api/library/{self.owned.id}/claim')
        self.assertEqual(response.status_code, 403)

        self.owned.is_common = True
        self.owned.save()
        response = self.client.post(f'/api/library/{self.owned.id}/claim')
        self.assertEqual(response.status_code, 304)

        response = self.client.post(f'/api/library/{self.unowned.id}/claim')
        self.assertEqual(response.status_code, 403)

        self.assertFalse(self.user in self.unowned.subscribers())
        self.unowned.is_common = True
        self.unowned.save()
        response = self.client.post(f'/api/library/{self.unowned.id}/claim')
        self.assertEqual(response.status_code, 200)
        self.unowned.refresh_from_db()
        self.assertEqual(self.unowned.owner, self.user)
        self.assertEqual(self.unowned.owner, self.user)
        self.assertTrue(self.user in self.unowned.subscribers())

    def test_claim_anonymous(self):
        self.client.logout()
        response = self.client.post(f'/api/library/{self.owned.id}/claim')
        self.assertEqual(response.status_code, 403)

    def test_retrieve_common(self):
        self.client.logout()
        response = self.client.get('/api/library/active')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(_response_contains(response, self.common))
        self.assertFalse(_response_contains(response, self.unowned))
        self.assertFalse(_response_contains(response, self.owned))

    def test_retrieve_owned(self):
        response = self.client.get('/api/library/active')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(_response_contains(response, self.common))
        self.assertFalse(_response_contains(response, self.unowned))
        self.assertTrue(_response_contains(response, self.owned))

    def test_retrieve_subscribed(self):
        response = self.client.get('/api/library/active')
        self.assertEqual(response.status_code, 200)
        self.assertFalse(_response_contains(response, self.unowned))

        user2 =  User.objects.create(username='UserTest2')
        Subscription.subscribe(user=self.user, item=self.unowned)
        Subscription.subscribe(user=user2, item=self.unowned)
        Subscription.subscribe(user=user2, item=self.owned)
        response = self.client.get('/api/library/active')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(_response_contains(response, self.unowned))
        self.assertEqual(len(response.data), 3)

    def test_subscriptions(self):
        response = self.client.delete(f'/api/library/{self.unowned.id}/unsubscribe')
        self.assertEqual(response.status_code, 204)
        self.assertFalse(self.user in self.unowned.subscribers())

        response = self.client.post(f'/api/library/{self.unowned.id}/subscribe')
        self.assertEqual(response.status_code, 204)
        self.assertTrue(self.user in self.unowned.subscribers())

        response = self.client.post(f'/api/library/{self.unowned.id}/subscribe')
        self.assertEqual(response.status_code, 204)
        self.assertTrue(self.user in self.unowned.subscribers())

        response = self.client.delete(f'/api/library/{self.unowned.id}/unsubscribe')
        self.assertEqual(response.status_code, 204)
        self.assertFalse(self.user in self.unowned.subscribers())


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
        self.assertEqual(response.status_code, 200)
        self.assertFalse(_response_contains(response, non_schema))
        self.assertTrue(_response_contains(response, self.unowned.item))
        self.assertTrue(_response_contains(response, self.owned.item))

        response = self.client.get('/api/library')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(_response_contains(response, non_schema))
        self.assertTrue(_response_contains(response, self.unowned.item))
        self.assertTrue(_response_contains(response, self.owned.item))

    def test_contents(self):
        schema = RSForm.create(title='Title1')
        schema.insert_last(alias='X1', insert_type=CstType.BASE)
        response = self.client.get(f'/api/rsforms/{schema.item.id}/contents')
        self.assertEqual(response.status_code, 200)

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

        self.assertEqual(response.status_code, 200)
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
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['parseResult'], True)
        self.assertEqual(response.data['syntax'], Syntax.MATH)
        self.assertEqual(response.data['astText'], '[=[X1][X1]]')
        self.assertEqual(response.data['typification'], 'LOGIC')
        self.assertEqual(response.data['valueClass'], 'value')

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
        self.assertEqual(response.status_code, 200)
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
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['owner'], self.user.pk)
        self.assertTrue(response.data['title'] != '')

    def test_export_trs(self):
        schema = RSForm.create(title='Test')
        schema.insert_at(1, 'X1', CstType.BASE)
        response = self.client.get(f'/api/rsforms/{schema.item.id}/export-trs')
        self.assertEqual(response.status_code, 200)
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
        self.assertEqual(response.status_code, 403)

        item = self.owned.item
        Constituenta.objects.create(schema=item, alias='X1', cst_type='basic', order=1)
        x2 = Constituenta.objects.create(schema=item, alias='X2', cst_type='basic', order=2)
        response = self.client.post(
            f'/api/rsforms/{item.id}/cst-create',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['new_cst']['alias'], 'X3')
        x3 = Constituenta.objects.get(alias=response.data['new_cst']['alias'])
        self.assertEqual(x3.order, 3)

        data = {'alias': 'X4', 'cst_type': 'basic', 'insert_after': x2.id}
        response = self.client.post(
            f'/api/rsforms/{item.id}/cst-create',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['new_cst']['alias'], 'X4')
        x4 = Constituenta.objects.get(alias=response.data['new_cst']['alias'])
        self.assertEqual(x4.order, 3)

    def test_rename_constituenta(self):
        self.cst1 = Constituenta.objects.create(
            alias='X1', schema=self.owned.item, order=1, convention='Test',
            term_raw='Test1', term_resolved='Test1',
            term_forms=[{'text':'form1', 'tags':'sing,datv'}]
        )
        self.cst2 = Constituenta.objects.create(
            alias='X2', schema=self.unowned.item, order=1, convention='Test1',
            term_raw='Test2', term_resolved='Test2'
        )
        self.cst3 = Constituenta.objects.create(
            alias='X3', schema=self.owned.item, order=2,
            term_raw='Test3', term_resolved='Test3',
            definition_raw='Test1', definition_resolved='Test2'
        )
        
        data = {'alias': 'D2', 'cst_type': 'term', 'id': self.cst2.pk}
        response = self.client.patch(
            f'/api/rsforms/{self.unowned.item.id}/cst-rename',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, 403)

        response = self.client.patch(
            f'/api/rsforms/{self.owned.item.id}/cst-rename',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, 400)

        data = {'alias': self.cst1.alias, 'cst_type': 'term', 'id': self.cst1.pk}
        response = self.client.patch(
            f'/api/rsforms/{self.owned.item.id}/cst-rename',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, 400)

        data = {'alias': 'D2', 'cst_type': 'term', 'id': self.cst1.pk}
        item = self.owned.item
        d1 = Constituenta.objects.create(schema=item, alias='D1', cst_type='term', order=4)
        d1.term_raw = '@{X1|plur}'
        d1.definition_formal = 'X1'
        d1.save()
        
        self.assertEqual(d1.order, 4)
        self.assertEqual(self.cst1.order, 1)
        self.assertEqual(self.cst1.alias, 'X1')
        self.assertEqual(self.cst1.cst_type, CstType.BASE)
        response = self.client.patch(
            f'/api/rsforms/{item.id}/cst-rename',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['new_cst']['alias'], 'D2')
        self.assertEqual(response.data['new_cst']['cst_type'], 'term')
        d1.refresh_from_db()
        self.cst1.refresh_from_db()
        self.assertEqual(d1.order, 4)
        self.assertEqual(d1.term_resolved, '')
        self.assertEqual(d1.term_raw,  '@{D2|plur}')
        self.assertEqual(self.cst1.order, 1)
        self.assertEqual(self.cst1.alias, 'D2')
        self.assertEqual(self.cst1.cst_type, CstType.TERM)

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
        self.assertEqual(response.status_code, 201)
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
            f'/api/rsforms/{schema.item.id}/cst-multidelete',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, 400)

        x1 = Constituenta.objects.create(schema=schema.item, alias='X1', cst_type='basic', order=1)
        x2 = Constituenta.objects.create(schema=schema.item, alias='X2', cst_type='basic', order=2)
        data = {'items': [x1.id]}
        response = self.client.patch(
            f'/api/rsforms/{schema.item.id}/cst-multidelete',
            data=data, format='json'
        )
        x2.refresh_from_db()
        schema.item.refresh_from_db()
        self.assertEqual(response.status_code, 202)
        self.assertEqual(len(response.data['items']), 1)
        self.assertEqual(schema.constituents().count(), 1)
        self.assertEqual(x2.alias, 'X2')
        self.assertEqual(x2.order, 1)

        x3 = Constituenta.objects.create(schema=self.unowned.item, alias='X1', cst_type='basic', order=1)
        data = {'items': [x3.id]}
        response = self.client.patch(
            f'/api/rsforms/{schema.item.id}/cst-multidelete',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, 400)

    def test_move_constituenta(self):
        item = self.owned.item
        data = {'items': [1337], 'move_to': 1}
        response = self.client.patch(
            f'/api/rsforms/{item.id}/cst-moveto',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, 400)

        x1 = Constituenta.objects.create(schema=item, alias='X1', cst_type='basic', order=1)
        x2 = Constituenta.objects.create(schema=item, alias='X2', cst_type='basic', order=2)
        data = {'items': [x2.id], 'move_to': 1}
        response = self.client.patch(
            f'/api/rsforms/{item.id}/cst-moveto',
            data=data, format='json'
        )
        x1.refresh_from_db()
        x2.refresh_from_db()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['id'], item.id)
        self.assertEqual(x1.order, 2)
        self.assertEqual(x2.order, 1)

        x3 = Constituenta.objects.create(schema=self.unowned.item, alias='X1', cst_type='basic', order=1)
        data = {'items': [x3.id], 'move_to': 1}
        response = self.client.patch(
            f'/api/rsforms/{item.id}/cst-moveto',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, 400)

    def test_reset_aliases(self):
        item = self.owned.item
        response = self.client.patch(f'/api/rsforms/{item.id}/reset-aliases')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['id'], item.id)

        x2 = Constituenta.objects.create(schema=item, alias='X2', cst_type='basic', order=1)
        x1 = Constituenta.objects.create(schema=item, alias='X1', cst_type='basic', order=2)
        d11 = Constituenta.objects.create(schema=item, alias='D11', cst_type='term', order=3)
        response = self.client.patch(f'/api/rsforms/{item.id}/reset-aliases')
        x1.refresh_from_db()
        x2.refresh_from_db()
        d11.refresh_from_db()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(x2.order, 1)
        self.assertEqual(x2.alias, 'X1')
        self.assertEqual(x1.order, 2)
        self.assertEqual(x1.alias, 'X2')
        self.assertEqual(d11.order, 3)
        self.assertEqual(d11.alias, 'D1')

        response = self.client.patch(f'/api/rsforms/{item.id}/reset-aliases')
        self.assertEqual(response.status_code, 200)

    def test_load_trs(self):
        schema = self.owned
        schema.item.title = 'Testt11'
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
        self.assertEqual(response.status_code, 200)
        self.assertEqual(schema.item.title, 'Testt11')
        self.assertEqual(len(response.data['items']), 25)
        self.assertEqual(schema.constituents().count(), 25)
        self.assertFalse(Constituenta.objects.filter(pk=x1.id).exists())

    def test_clone(self):
        item = self.owned.item
        item.title = 'Testt11'
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

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['title'], 'Title')
        self.assertEqual(response.data['items'][0]['alias'], x1.alias)
        self.assertEqual(response.data['items'][0]['term_raw'], x1.term_raw)
        self.assertEqual(response.data['items'][0]['term_resolved'], x1.term_resolved)
        self.assertEqual(response.data['items'][1]['term_raw'], d1.term_raw)
        self.assertEqual(response.data['items'][1]['term_resolved'], d1.term_resolved)


class TestRSLanguageViews(APITestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.create(username='UserTest')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_create_rsform(self):
        work_dir = os.path.dirname(os.path.abspath(__file__))
        with open(f'{work_dir}/data/sample-rsform.trs', 'rb') as file:
            data = {'file': file, 'title': 'Test123', 'comment': '123', 'alias': 'ks1'}
            response = self.client.post(
                '/api/rsforms/create-detailed',
                data=data, format='multipart'
            )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['owner'], self.user.pk)
        self.assertEqual(response.data['title'], 'Test123')
        self.assertEqual(response.data['alias'], 'ks1')
        self.assertEqual(response.data['comment'], '123')

    def test_create_rsform_fallback(self):
        data = {'title': 'Test123', 'comment': '123', 'alias': 'ks1'}
        response = self.client.post(
            '/api/rsforms/create-detailed',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['owner'], self.user.pk)
        self.assertEqual(response.data['title'], 'Test123')
        self.assertEqual(response.data['alias'], 'ks1')
        self.assertEqual(response.data['comment'], '123')

    def test_convert_to_ascii(self):
        data = {'expression': '1=1'}
        request = self.factory.post(
            '/api/rslang/to-ascii',
            data=data, format='json'
        )
        response = convert_to_ascii(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['result'], r'1 \eq 1')

    def test_convert_to_ascii_missing_data(self):
        data = {'data': '1=1'}
        request = self.factory.post(
            '/api/rslang/to-ascii',
            data=data, format='json'
        )
        response = convert_to_ascii(request)
        self.assertEqual(response.status_code, 400)
        self.assertIsInstance(response.data['expression'][0], ErrorDetail)

    def test_convert_to_math(self):
        data = {'expression': r'1 \eq 1'}
        request = self.factory.post(
            '/api/rslang/to-math',
            data=data, format='json'
        )
        response = convert_to_math(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['result'], r'1=1')

    def test_convert_to_math_missing_data(self):
        data = {'data': r'1 \eq 1'}
        request = self.factory.post(
            '/api/rslang/to-math',
            data=data, format='json'
        )
        response = convert_to_math(request)
        self.assertEqual(response.status_code, 400)
        self.assertIsInstance(response.data['expression'][0], ErrorDetail)

    def test_parse_expression(self):
        data = {'expression': r'1=1'}
        request = self.factory.post(
            '/api/rslang/parse-expression',
            data=data, format='json'
        )
        response = parse_expression(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['parseResult'], True)
        self.assertEqual(response.data['syntax'], Syntax.MATH)
        self.assertEqual(response.data['astText'], '[=[1][1]]')

    def test_parse_expression_missing_data(self):
        data = {'data': r'1=1'}
        request = self.factory.post(
            '/api/rslang/parse-expression',
            data=data, format='json'
        )
        response = parse_expression(request)
        self.assertEqual(response.status_code, 400)
        self.assertIsInstance(response.data['expression'][0], ErrorDetail)


class TestNaturalLanguageViews(APITestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.client = APIClient()

    def _assert_tags(self, actual: str, expected: str):
        self.assertEqual(set(split_grams(actual)), set(split_grams(expected)))

    def test_parse_text(self):
        data = {'text': 'синим слонам'}
        request = self.factory.post(
            '/api/cctext/parse',
            data=data, format='json'
        )
        response = parse_text(request)
        self.assertEqual(response.status_code, 200)
        self._assert_tags(response.data['result'], 'datv,NOUN,plur,anim,masc')

    def test_inflect(self):
        data = {'text': 'синий слон', 'grams': 'plur,datv'}
        request = self.factory.post(
            '/api/cctext/inflect',
            data=data, format='json'
        )
        response = inflect(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['result'], 'синим слонам')

    def test_generate_lexeme(self):
        data = {'text': 'синий слон'}
        request = self.factory.post(
            '/api/cctext/generate-lexeme',
            data=data, format='json'
        )
        response = generate_lexeme(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['items']), 12)
        self.assertEqual(response.data['items'][0]['text'], 'синий слон')
