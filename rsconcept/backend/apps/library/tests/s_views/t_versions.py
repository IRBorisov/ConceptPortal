''' Testing API: Versions. '''
import io
from sys import version
from typing import cast
from zipfile import ZipFile

from rest_framework import status

from apps.library.models import Version
from apps.rsform.models import Constituenta, RSForm
from shared.EndpointTester import EndpointTester, decl_endpoint


class TestVersionViews(EndpointTester):
    ''' Testing versioning endpoints. '''

    def setUp(self):
        super().setUp()
        self.owned = RSForm.create(title='Test', alias='T1', owner=self.user)
        self.owned_id = self.owned.model.pk
        self.unowned = RSForm.create(title='Test2', alias='T2')
        self.unowned_id = self.unowned.model.pk
        self.x1 = self.owned.insert_last(
            alias='X1',
            convention='testStart'
        )


    @decl_endpoint('/api/library/{schema}/create-version', method='post')
    def test_create_version(self):
        invalid_data = {'description': 'test'}
        invalid_id = 1338
        data = {'version': '1.0.0', 'description': 'test'}

        self.executeNotFound(data, schema=invalid_id)
        self.executeForbidden(data, schema=self.unowned_id)
        self.executeBadData(invalid_data, schema=self.owned_id)

        response = self.executeCreated(data, schema=self.owned_id)
        self.assertTrue('version' in response.data)
        self.assertTrue('schema' in response.data)
        self.assertTrue(response.data['version'] in [v['id'] for v in response.data['schema']['versions']])


    @decl_endpoint('/api/library/{schema}/create-version', method='post')
    def test_create_version_filter(self):
        x2 = self.owned.insert_last('X2')
        data = {'version': '1.0.0', 'description': 'test', 'items': [x2.pk]}
        response = self.executeCreated(data, schema=self.owned_id)
        version = Version.objects.get(pk=response.data['version'])
        items = version.data['items']
        self.assertTrue('version' in response.data)
        self.assertTrue('schema' in response.data)
        self.assertTrue(response.data['version'] in [v['id'] for v in response.data['schema']['versions']])
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0]['id'], x2.pk)


    @decl_endpoint('/api/library/{schema}/versions/{version}', method='get')
    def test_retrieve_version(self):
        version_id = self._create_version({'version': '1.0.0', 'description': 'test'})
        invalid_id = version_id + 1337

        self.executeNotFound(schema=invalid_id, version=invalid_id)
        self.executeNotFound(schema=self.owned_id, version=invalid_id)
        self.executeNotFound(schema=invalid_id, version=version_id)
        self.executeNotFound(schema=self.unowned_id, version=version_id)

        self.owned.model.alias = 'NewName'
        self.owned.model.save()
        self.x1.alias = 'X33'
        self.x1.save()

        response = self.executeOK(schema=self.owned_id, version=version_id)
        self.assertNotEqual(response.data['alias'], self.owned.model.alias)
        self.assertNotEqual(response.data['items'][0]['alias'], self.x1.alias)
        self.assertEqual(response.data['version'], version_id)


    @decl_endpoint('/api/library/{schema}/versions/{version}', method='get')
    def test_retrieve_version_details(self):
        a1 = Constituenta.objects.create(
            schema=self.owned.model,
            alias='A1',
            cst_type='axiom',
            definition_formal='X1=X1',
            order=1,
            crucial=True
        )
        version_id = self._create_version({'version': '1.0.0', 'description': 'test'})
        a1.definition_formal = 'X1=X2'
        a1.crucial = False
        a1.save()

        response = self.executeOK(schema=self.owned_id, version=version_id)
        loaded_a1 = response.data['items'][1]
        self.assertEqual(loaded_a1['definition_formal'], 'X1=X1')
        self.assertEqual(loaded_a1['crucial'], True)


    @decl_endpoint('/api/versions/{version}', method='get')
    def test_access_version(self):
        data = {'version': '1.0.0', 'description': 'test'}
        version_id = self._create_version(data)
        invalid_id = version_id + 1337

        self.executeNotFound(version=invalid_id)

        self.set_params(version=version_id)
        self.logout()
        response = self.executeOK()
        self.assertEqual(response.data['version'], data['version'])
        self.assertEqual(response.data['description'], data['description'])
        self.assertEqual(response.data['item'], self.owned_id)

        data = {'version': '1.2.0', 'description': 'test1'}
        self.method = 'patch'
        self.executeForbidden(data)

        self.method = 'delete'
        self.executeForbidden()

        self.client.force_authenticate(user=self.user)
        self.method = 'patch'
        self.executeOK(data)
        response = self.get()
        self.assertEqual(response.data['version'], data['version'])
        self.assertEqual(response.data['description'], data['description'])

        response = self.delete()
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        response = self.get()
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


    @decl_endpoint('/api/versions/{version}/export-file', method='get')
    def test_export_version(self):
        invalid_id = 1338
        self.executeNotFound(version=invalid_id)

        version_id = self._create_version({'version': '1.0.0', 'description': 'test'})
        response = self.executeOK(version=version_id)
        self.assertEqual(
            response.headers['Content-Disposition'],
            f'attachment; filename={self.owned.model.alias}.trs'
        )
        with io.BytesIO(response.content) as stream:
            with ZipFile(stream, 'r') as zipped_file:
                self.assertIsNone(zipped_file.testzip())
                self.assertIn('document.json', zipped_file.namelist())


    @decl_endpoint('/api/versions/{version}/restore', method='patch')
    def test_restore_version(self):
        x1 = self.x1
        x2 = self.owned.insert_last('X2')
        d1 = self.owned.insert_last('D1', term_raw='TestTerm')
        data = {'version': '1.0.0', 'description': 'test'}
        version_id = self._create_version(data)
        invalid_id = version_id + 1337

        Constituenta.objects.get(pk=d1.pk).delete()
        x3 = self.owned.insert_last('X3')
        x1.order = x3.order
        x1.convention = 'Test2'
        x1.term_raw = 'Test'
        x1.save()
        x3.order = 0
        x3.save()

        self.executeNotFound(version=invalid_id)

        response = self.executeOK(version=version_id)
        x1.refresh_from_db()
        x2.refresh_from_db()
        self.assertEqual(len(response.data['items']), 3)
        self.assertEqual(x1.order, 0)
        self.assertEqual(x1.convention, 'testStart')
        self.assertEqual(x1.term_raw, '')
        self.assertEqual(x2.order, 1)
        self.assertEqual(response.data['items'][2]['alias'], 'D1')
        self.assertEqual(response.data['items'][2]['term_raw'], 'TestTerm')


    def _create_version(self, data) -> int:
        response = self.client.post(
            f'/api/library/{self.owned_id}/create-version',
            data, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        return response.data['version']  # type: ignore
