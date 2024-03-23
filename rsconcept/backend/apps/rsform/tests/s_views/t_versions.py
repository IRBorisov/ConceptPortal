''' Testing API: Versions. '''
import io
from typing import cast
from sys import version
from zipfile import ZipFile
from rest_framework import status

from apps.rsform.models import RSForm, Constituenta

from .EndpointTester import decl_endpoint, EndpointTester


class TestVersionViews(EndpointTester):
    ''' Testing versioning endpoints. '''
    def setUp(self):
        super().setUp()
        self.owned = RSForm.create(title='Test', alias='T1', owner=self.user).item
        self.unowned = RSForm.create(title='Test2', alias='T2').item
        self.x1 = Constituenta.objects.create(
            schema=self.owned,
            alias='X1',
            cst_type='basic',
            convention='testStart',
            order=1
        )

    @decl_endpoint('/api/rsforms/{schema}/versions/create', method='post')
    def test_create_version(self):
        invalid_data = {'description': 'test'}
        invalid_id = 1338
        data = {'version': '1.0.0', 'description': 'test'}

        self.assertNotFound(data, schema=invalid_id)
        self.assertForbidden(data, schema=self.unowned.id)
        self.assertBadData(invalid_data, schema=self.owned.id)

        response = self.execute(data, schema=self.owned.id)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue('version' in response.data)
        self.assertTrue('schema' in response.data)
        self.assertTrue(response.data['version'] in [v['id'] for v in response.data['schema']['versions']])
        
    @decl_endpoint('/api/rsforms/{schema}/versions/{version}', method='get')
    def test_retrieve_version(self):
        version_id = self._create_version({'version': '1.0.0', 'description': 'test'})
        invalid_id = version_id + 1337

        self.assertNotFound(schema=invalid_id, version=invalid_id)
        self.assertNotFound(schema=self.owned.id, version=invalid_id)
        self.assertNotFound(schema=invalid_id, version=version_id)
        self.assertNotFound(schema=self.unowned.id, version=version_id)

        self.owned.alias = 'NewName'
        self.owned.save()
        self.x1.alias = 'X33'
        self.x1.save()
        
        response = self.execute(schema=self.owned.id, version=version_id)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotEqual(response.data['alias'], self.owned.alias)
        self.assertNotEqual(response.data['items'][0]['alias'], self.x1.alias)
        self.assertEqual(response.data['version'], version_id)

    @decl_endpoint('/api/versions/{version}', method='get')
    def test_access_version(self):
        data = {'version': '1.0.0', 'description': 'test'}
        version_id = self._create_version(data)
        invalid_id = version_id + 1337

        self.assertNotFound(version=invalid_id)

        self.set_params(version=version_id)
        self.logout()
        response = self.execute()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['version'], data['version'])
        self.assertEqual(response.data['description'], data['description'])
        self.assertEqual(response.data['item'], self.owned.id)

        data = {'version': '1.2.0', 'description': 'test1'}
        self.method = 'patch'
        self.assertForbidden(data)

        self.method = 'delete'
        self.assertForbidden()

        self.client.force_authenticate(user=self.user)
        self.method = 'patch'
        self.assertOK(data)
        response = self.get()
        self.assertEqual(response.data['version'], data['version'])
        self.assertEqual(response.data['description'], data['description'])

        response = self.delete()
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        response = self.get()
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    @decl_endpoint('/api/rsforms/{schema}/versions/{version}', method='get')
    def test_retrieve_version_details(self):
        a1 = Constituenta.objects.create(
            schema=self.owned,
            alias='A1',
            cst_type='axiom',
            definition_formal='X1=X1',
            order=2
        )
        version_id = self._create_version({'version': '1.0.0', 'description': 'test'})
        a1.definition_formal = 'X1=X2'
        a1.save()

        response = self.get(schema=self.owned.id, version=version_id)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        loaded_a1 = response.data['items'][1]
        self.assertEqual(loaded_a1['definition_formal'], 'X1=X1')
        self.assertEqual(loaded_a1['parse']['status'], 'verified')

    @decl_endpoint('/api/versions/{version}/export-file', method='get')
    def test_export_version(self):
        invalid_id = 1338
        self.assertNotFound(version=invalid_id)

        version_id = self._create_version({'version': '1.0.0', 'description': 'test'})
        response = self.get(version=version_id)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.headers['Content-Disposition'],
            f'attachment; filename={self.owned.alias}.trs'
        )
        with io.BytesIO(response.content) as stream:
            with ZipFile(stream, 'r') as zipped_file:
                self.assertIsNone(zipped_file.testzip())
                self.assertIn('document.json', zipped_file.namelist())

    def _create_version(self, data) -> int:
        response = self.client.post(
            f'/api/rsforms/{self.owned.id}/versions/create',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        return response.data['version'] # type: ignore
