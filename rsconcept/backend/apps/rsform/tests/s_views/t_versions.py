''' Testing API: Versions. '''
import io
from zipfile import ZipFile
from rest_framework.test import APITestCase, APIRequestFactory, APIClient
from rest_framework import status

from apps.users.models import User
from apps.rsform.models import RSForm, Constituenta


class TestVersionViews(APITestCase):
    ''' Testing versioning endpoints. '''
    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.create(username='UserTest')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.owned = RSForm.create(title='Test', alias='T1', owner=self.user)
        self.unowned = RSForm.create(title='Test2', alias='T2')
        self.x1 = Constituenta.objects.create(
            schema=self.owned.item,
            alias='X1',
            cst_type='basic',
            convention='testStart',
            order=1
        )

    def test_create_version(self):
        invalid_data = {'description': 'test'}
        data = {'version': '1.0.0', 'description': 'test'}
        invalid_id = 1338
        response = self.client.post(
            f'/api/rsforms/{invalid_id}/versions/create',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        response = self.client.post(
            f'/api/rsforms/{self.unowned.item.id}/versions/create',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        response = self.client.post(
            f'/api/rsforms/{self.owned.item.id}/versions/create',
            data=invalid_data, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        response = self.client.post(
            f'/api/rsforms/{self.owned.item.id}/versions/create',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue('version' in response.data)
        self.assertTrue('schema' in response.data)
        self.assertTrue(response.data['version'] in [v['id'] for v in response.data['schema']['versions']])


    def test_retrieve_version(self):
        data = {'version': '1.0.0', 'description': 'test'}
        response = self.client.post(
            f'/api/rsforms/{self.owned.item.id}/versions/create',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        version_id = response.data['version']

        invalid_id = 1338
        response = self.client.get(f'/api/rsforms/{invalid_id}/versions/{invalid_id}')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        response = self.client.get(f'/api/rsforms/{self.owned.item.id}/versions/{invalid_id}')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        response = self.client.get(f'/api/rsforms/{invalid_id}/versions/{version_id}')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        response = self.client.get(f'/api/rsforms/{self.unowned.item.id}/versions/{version_id}')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        self.owned.item.alias = 'NewName'
        self.owned.item.save()
        self.x1.alias = 'X33'
        self.x1.save()
        
        response = self.client.get(f'/api/rsforms/{self.owned.item.id}/versions/{version_id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotEqual(response.data['alias'], self.owned.item.alias)
        self.assertNotEqual(response.data['items'][0]['alias'], self.x1.alias)
        self.assertEqual(response.data['version'], version_id)

    def test_access_version(self):
        data = {'version': '1.0.0', 'description': 'test'}
        response = self.client.post(
            f'/api/rsforms/{self.owned.item.id}/versions/create',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        version_id = response.data['version']
        invalid_id = version_id + 1337

        response = self.client.get(f'/api/versions/{invalid_id}')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        self.client.logout()
        response = self.client.get(f'/api/versions/{version_id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['version'], data['version'])
        self.assertEqual(response.data['description'], data['description'])
        self.assertEqual(response.data['item'], self.owned.item.id)

        response = self.client.patch(
            f'/api/versions/{version_id}',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        response = self.client.delete(f'/api/versions/{version_id}')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(user=self.user)

        data = {'version': '1.1.0', 'description': 'test1'}
        response = self.client.patch(
            f'/api/versions/{version_id}',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response = self.client.get(f'/api/versions/{version_id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['version'], data['version'])
        self.assertEqual(response.data['description'], data['description'])

        response = self.client.delete(f'/api/versions/{version_id}')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        response = self.client.get(f'/api/versions/{version_id}')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_retrieve_version_details(self):
        a1 = Constituenta.objects.create(
            schema=self.owned.item,
            alias='A1',
            cst_type='axiom',
            definition_formal='X1=X1',
            order=2
        )

        data = {'version': '1.0.0', 'description': 'test'}
        response = self.client.post(
            f'/api/rsforms/{self.owned.item.id}/versions/create',
            data=data, format='json'
        )
        version_id = response.data['version']

        a1.definition_formal = 'X1=X2'
        a1.save()

        response = self.client.get(f'/api/rsforms/{self.owned.item.id}/versions/{version_id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        loaded_a1 = response.data['items'][1]
        self.assertEqual(loaded_a1['definition_formal'], 'X1=X1')
        self.assertEqual(loaded_a1['parse']['status'], 'verified')

    def test_export_version(self):
        invalid_id = 1338
        response = self.client.get(f'/api/versions/{invalid_id}/export-file')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        data = {'version': '1.0.0', 'description': 'test'}
        response = self.client.post(
            f'/api/rsforms/{self.owned.item.id}/versions/create',
            data=data, format='json'
        )
        version_id = response.data['version']

        response = self.client.get(f'/api/versions/{version_id}/export-file')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.headers['Content-Disposition'],
            f'attachment; filename={self.owned.item.alias}.trs'
        )
        with io.BytesIO(response.content) as stream:
            with ZipFile(stream, 'r') as zipped_file:
                self.assertIsNone(zipped_file.testzip())
                self.assertIn('document.json', zipped_file.namelist())
