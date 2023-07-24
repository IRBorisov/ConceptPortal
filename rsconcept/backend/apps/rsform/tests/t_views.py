''' Testing views '''
import json
import os
import io
from zipfile import ZipFile
from rest_framework.test import APITestCase, APIRequestFactory, APIClient
from rest_framework.exceptions import ErrorDetail

from apps.users.models import User
from apps.rsform.models import Syntax, RSForm, Constituenta, CstType
from apps.rsform.views import (
    convert_to_ascii,
    convert_to_math,
    parse_expression
)


class TestConstituentaAPI(APITestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.create(username='UserTest')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.rsform_owned: RSForm = RSForm.objects.create(title='Test', alias='T1', owner=self.user)
        self.rsform_unowned: RSForm = RSForm.objects.create(title='Test2', alias='T2')
        self.cst1 = Constituenta.objects.create(
            alias='X1', schema=self.rsform_owned, order=1, convention='Test')
        self.cst2 = Constituenta.objects.create(
            alias='X2', schema=self.rsform_unowned, order=1, convention='Test1')

    def test_retrieve(self):
        response = self.client.get(f'/api/constituents/{self.cst1.id}/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['alias'], self.cst1.alias)
        self.assertEqual(response.data['convention'], self.cst1.convention)

    def test_partial_update(self):
        data = json.dumps({'convention': 'tt'})
        response = self.client.patch(f'/api/constituents/{self.cst2.id}/', data, content_type='application/json')
        self.assertEqual(response.status_code, 403)

        self.client.logout()
        response = self.client.patch(f'/api/constituents/{self.cst1.id}/', data, content_type='application/json')
        self.assertEqual(response.status_code, 403)

        self.client.force_authenticate(user=self.user)
        response = self.client.patch(f'/api/constituents/{self.cst1.id}/', data, content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.cst1.refresh_from_db()
        self.assertEqual(response.data['convention'], 'tt')
        self.assertEqual(self.cst1.convention, 'tt')

        response = self.client.patch(f'/api/constituents/{self.cst1.id}/', data, content_type='application/json')
        self.assertEqual(response.status_code, 200)

    def test_readonly_cst_fields(self):
        data = json.dumps({'alias': 'X33', 'order': 10})
        response = self.client.patch(f'/api/constituents/{self.cst1.id}/', data, content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['alias'], 'X1')
        self.assertEqual(response.data['alias'], self.cst1.alias)
        self.assertEqual(response.data['order'], self.cst1.order)


class TestRSFormViewset(APITestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.create(username='UserTest')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.rsform_owned: RSForm = RSForm.objects.create(title='Test', alias='T1', owner=self.user)
        self.rsform_unowned: RSForm = RSForm.objects.create(title='Test2', alias='T2')

    def test_create_anonymous(self):
        self.client.logout()
        data = json.dumps({'title': 'Title'})
        response = self.client.post('/api/rsforms/', data=data, content_type='application/json')
        self.assertEqual(response.status_code, 403)

    def test_create_populate_user(self):
        data = json.dumps({'title': 'Title'})
        response = self.client.post('/api/rsforms/', data=data, content_type='application/json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['title'], 'Title')
        self.assertEqual(response.data['owner'], self.user.id)

    def test_update(self):
        data = json.dumps({'id': self.rsform_owned.id, 'title': 'New title'})
        response = self.client.patch(f'/api/rsforms/{self.rsform_owned.id}/',
                                     data=data, content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['title'], 'New title')
        self.assertEqual(response.data['alias'], self.rsform_owned.alias)

    def test_update_unowned(self):
        data = json.dumps({'id': self.rsform_unowned.id, 'title': 'New title'})
        response = self.client.patch(f'/api/rsforms/{self.rsform_unowned.id}/',
                                     data=data, content_type='application/json')
        self.assertEqual(response.status_code, 403)

    def test_destroy(self):
        response = self.client.delete(f'/api/rsforms/{self.rsform_owned.id}/')
        self.assertTrue(response.status_code in [202, 204])

    def test_destroy_admin_override(self):
        response = self.client.delete(f'/api/rsforms/{self.rsform_unowned.id}/')
        self.assertEqual(response.status_code, 403)
        self.user.is_staff = True
        self.user.save()
        response = self.client.delete(f'/api/rsforms/{self.rsform_unowned.id}/')
        self.assertTrue(response.status_code in [202, 204])

    def test_contents(self):
        schema = RSForm.objects.create(title='Title1')
        schema.insert_last(alias='X1', type=CstType.BASE)
        response = self.client.get(f'/api/rsforms/{schema.id}/contents/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, schema.to_json())

    def test_details(self):
        schema = RSForm.objects.create(title='Test')
        cst = schema.insert_at(1, 'X1', CstType.BASE)
        schema.insert_at(2, 'X2', CstType.BASE)
        response = self.client.get(f'/api/rsforms/{schema.id}/details/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['title'], 'Test')
        self.assertEqual(len(response.data['items']), 2)
        self.assertEqual(response.data['items'][0]['parse']['status'], 'verified')
        self.assertEqual(response.data['items'][0]['id'], cst.id)

    def test_check(self):
        schema = RSForm.objects.create(title='Test')
        schema.insert_at(1, 'X1', CstType.BASE)
        data = json.dumps({'expression': 'X1=X1'})
        response = self.client.post(f'/api/rsforms/{schema.id}/check/', data=data, content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['parseResult'], True)
        self.assertEqual(response.data['syntax'], Syntax.MATH)
        self.assertEqual(response.data['astText'], '[=[X1][X1]]')
        self.assertEqual(response.data['typification'], 'LOGIC')
        self.assertEqual(response.data['valueClass'], 'value')

    def test_import_trs(self):
        work_dir = os.path.dirname(os.path.abspath(__file__))
        with open(f'{work_dir}/data/sample-rsform.trs', 'rb') as file:
            data = {'file': file}
            response = self.client.post('/api/rsforms/import-trs/', data=data, format='multipart')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['owner'], self.user.pk)
        self.assertTrue(response.data['title'] != '')

    def test_export_trs(self):
        schema = RSForm.objects.create(title='Test')
        schema.insert_at(1, 'X1', CstType.BASE)
        response = self.client.get(f'/api/rsforms/{schema.id}/export-trs/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers['Content-Disposition'], 'attachment; filename=Schema.trs')
        with io.BytesIO(response.content) as stream:
            with ZipFile(stream, 'r') as zipped_file:
                self.assertIsNone(zipped_file.testzip())
                self.assertIn('document.json', zipped_file.namelist())

    def test_claim(self):
        response = self.client.post(f'/api/rsforms/{self.rsform_owned.id}/claim/')
        self.assertEqual(response.status_code, 304)
        response = self.client.post(f'/api/rsforms/{self.rsform_unowned.id}/claim/')
        self.assertEqual(response.status_code, 200)
        self.rsform_unowned.refresh_from_db()
        self.assertEqual(self.rsform_unowned.owner, self.user)

    def test_claim_anonymous(self):
        self.client.logout()
        response = self.client.post(f'/api/rsforms/{self.rsform_owned.id}/claim/')
        self.assertEqual(response.status_code, 403)

    def test_create_constituenta(self):
        data = json.dumps({'alias': 'X3', 'csttype': 'basic'})
        response = self.client.post(f'/api/rsforms/{self.rsform_unowned.id}/cst-create/',
                                    data=data, content_type='application/json')
        self.assertEqual(response.status_code, 403)

        schema = self.rsform_owned
        Constituenta.objects.create(schema=schema, alias='X1', csttype='basic', order=1)
        x2 = Constituenta.objects.create(schema=schema, alias='X2', csttype='basic', order=2)
        response = self.client.post(f'/api/rsforms/{schema.id}/cst-create/',
                                    data=data, content_type='application/json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['new_cst']['alias'], 'X3')
        x3 = Constituenta.objects.get(alias=response.data['new_cst']['alias'])
        self.assertEqual(x3.order, 3)

        data = json.dumps({'alias': 'X4', 'csttype': 'basic', 'insert_after': x2.id})
        response = self.client.post(f'/api/rsforms/{schema.id}/cst-create/',
                                    data=data, content_type='application/json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['new_cst']['alias'], 'X4')
        x4 = Constituenta.objects.get(alias=response.data['new_cst']['alias'])
        self.assertEqual(x4.order, 3)

    def test_delete_constituenta(self):
        schema = self.rsform_owned
        data = json.dumps({'items': [{'id': 1337}]})
        response = self.client.patch(f'/api/rsforms/{schema.id}/cst-multidelete/',
                                     data=data, content_type='application/json')
        self.assertEqual(response.status_code, 400)

        x1 = Constituenta.objects.create(schema=schema, alias='X1', csttype='basic', order=1)
        x2 = Constituenta.objects.create(schema=schema, alias='X2', csttype='basic', order=2)
        data = json.dumps({'items': [{'id': x1.id}]})
        response = self.client.patch(f'/api/rsforms/{schema.id}/cst-multidelete/',
                                     data=data, content_type='application/json')
        x2.refresh_from_db()
        schema.refresh_from_db()
        self.assertEqual(response.status_code, 202)
        self.assertEqual(len(response.data['items']), 1)
        self.assertEqual(schema.constituents().count(), 1)
        self.assertEqual(x2.alias, 'X2')
        self.assertEqual(x2.order, 1)

        x3 = Constituenta.objects.create(schema=self.rsform_unowned, alias='X1', csttype='basic', order=1)
        data = json.dumps({'items': [{'id': x3.id}]})
        response = self.client.patch(f'/api/rsforms/{schema.id}/cst-multidelete/',
                                     data=data, content_type='application/json')
        self.assertEqual(response.status_code, 400)

    def test_move_constituenta(self):
        schema = self.rsform_owned
        data = json.dumps({'items': [{'id': 1337}], 'move_to': 1})
        response = self.client.patch(f'/api/rsforms/{schema.id}/cst-moveto/',
                                     data=data, content_type='application/json')
        self.assertEqual(response.status_code, 400)

        x1 = Constituenta.objects.create(schema=schema, alias='X1', csttype='basic', order=1)
        x2 = Constituenta.objects.create(schema=schema, alias='X2', csttype='basic', order=2)
        data = json.dumps({'items': [{'id': x2.id}], 'move_to': 1})
        response = self.client.patch(f'/api/rsforms/{schema.id}/cst-moveto/',
                                     data=data, content_type='application/json')
        x1.refresh_from_db()
        x2.refresh_from_db()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['id'], schema.id)
        self.assertEqual(x1.order, 2)
        self.assertEqual(x2.order, 1)

        x3 = Constituenta.objects.create(schema=self.rsform_unowned, alias='X1', csttype='basic', order=1)
        data = json.dumps({'items': [{'id': x3.id}], 'move_to': 1})
        response = self.client.patch(f'/api/rsforms/{schema.id}/cst-moveto/',
                                     data=data, content_type='application/json')
        self.assertEqual(response.status_code, 400)


class TestFunctionalViews(APITestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.create(username='UserTest')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_create_rsform(self):
        work_dir = os.path.dirname(os.path.abspath(__file__))
        with open(f'{work_dir}/data/sample-rsform.trs', 'rb') as file:
            data = {'file': file, 'title': 'Test123', 'comment': '123', 'alias': 'ks1'}
            response = self.client.post('/api/rsforms/create-detailed/', data=data, format='multipart')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['owner'], self.user.pk)
        self.assertEqual(response.data['title'], 'Test123')
        self.assertEqual(response.data['alias'], 'ks1')
        self.assertEqual(response.data['comment'], '123')

    def test_create_rsform_fallback(self):
        data = {'title': 'Test123', 'comment': '123', 'alias': 'ks1'}
        response = self.client.post('/api/rsforms/create-detailed/', data=data)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['owner'], self.user.pk)
        self.assertEqual(response.data['title'], 'Test123')
        self.assertEqual(response.data['alias'], 'ks1')
        self.assertEqual(response.data['comment'], '123')

    def test_convert_to_ascii(self):
        data = {'expression': '1=1'}
        request = self.factory.post('/api/func/to-ascii', data)
        response = convert_to_ascii(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['result'], r'1 \eq 1')

    def test_convert_to_ascii_missing_data(self):
        data = {'data': '1=1'}
        request = self.factory.post('/api/func/to-ascii', data)
        response = convert_to_ascii(request)
        self.assertEqual(response.status_code, 400)
        self.assertIsInstance(response.data['expression'][0], ErrorDetail)

    def test_convert_to_math(self):
        data = {'expression': r'1 \eq 1'}
        request = self.factory.post('/api/func/to-math', data)
        response = convert_to_math(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['result'], r'1=1')

    def test_convert_to_math_missing_data(self):
        data = {'data': r'1 \eq 1'}
        request = self.factory.post('/api/func/to-math', data)
        response = convert_to_math(request)
        self.assertEqual(response.status_code, 400)
        self.assertIsInstance(response.data['expression'][0], ErrorDetail)

    def test_parse_expression(self):
        data = {'expression': r'1=1'}
        request = self.factory.post('/api/func/parse-expression', data)
        response = parse_expression(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['parseResult'], True)
        self.assertEqual(response.data['syntax'], Syntax.MATH)
        self.assertEqual(response.data['astText'], '[=[1][1]]')

    def test_parse_expression_missing_data(self):
        data = {'data': r'1=1'}
        request = self.factory.post('/api/func/parse-expression', data)
        response = parse_expression(request)
        self.assertEqual(response.status_code, 400)
        self.assertIsInstance(response.data['expression'][0], ErrorDetail)
