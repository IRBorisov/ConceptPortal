''' Testing API: Library. '''
from rest_framework.test import APITestCase, APIRequestFactory, APIClient
from rest_framework import status

from apps.users.models import User
from apps.rsform.models import LibraryItem, LibraryItemType, Subscription, LibraryTemplate

from ..utils import response_contains


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
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_populate_user(self):
        data = {'title': 'Title'}
        response = self.client.post('/api/library', data=data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Title')
        self.assertEqual(response.data['owner'], self.user.id)

    def test_update(self):
        data = {'id': self.owned.id, 'title': 'New title'}
        response = self.client.patch(
            f'/api/library/{self.owned.id}',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'New title')
        self.assertEqual(response.data['alias'], self.owned.alias)

    def test_update_unowned(self):
        data = {'id': self.unowned.id, 'title': 'New title'}
        response = self.client.patch(
            f'/api/library/{self.unowned.id}',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_destroy(self):
        response = self.client.delete(f'/api/library/{self.owned.id}')
        self.assertTrue(response.status_code in [status.HTTP_202_ACCEPTED, status.HTTP_204_NO_CONTENT])

    def test_destroy_admin_override(self):
        response = self.client.delete(f'/api/library/{self.unowned.id}')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.user.is_staff = True
        self.user.save()
        response = self.client.delete(f'/api/library/{self.unowned.id}')
        self.assertTrue(response.status_code in [status.HTTP_202_ACCEPTED, status.HTTP_204_NO_CONTENT])

    def test_claim(self):
        response = self.client.post(f'/api/library/{self.owned.id}/claim')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.owned.is_common = True
        self.owned.save()
        response = self.client.post(f'/api/library/{self.owned.id}/claim')
        self.assertEqual(response.status_code, status.HTTP_304_NOT_MODIFIED)

        response = self.client.post(f'/api/library/{self.unowned.id}/claim')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.assertFalse(self.user in self.unowned.subscribers())
        self.unowned.is_common = True
        self.unowned.save()
        response = self.client.post(f'/api/library/{self.unowned.id}/claim')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.unowned.refresh_from_db()
        self.assertEqual(self.unowned.owner, self.user)
        self.assertEqual(self.unowned.owner, self.user)
        self.assertTrue(self.user in self.unowned.subscribers())

    def test_claim_anonymous(self):
        self.client.logout()
        response = self.client.post(f'/api/library/{self.owned.id}/claim')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_retrieve_common(self):
        self.client.logout()
        response = self.client.get('/api/library/active')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response_contains(response, self.common))
        self.assertFalse(response_contains(response, self.unowned))
        self.assertFalse(response_contains(response, self.owned))

    def test_retrieve_owned(self):
        response = self.client.get('/api/library/active')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response_contains(response, self.common))
        self.assertFalse(response_contains(response, self.unowned))
        self.assertTrue(response_contains(response, self.owned))

    def test_retrieve_subscribed(self):
        response = self.client.get('/api/library/active')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response_contains(response, self.unowned))

        user2 =  User.objects.create(username='UserTest2')
        Subscription.subscribe(user=self.user, item=self.unowned)
        Subscription.subscribe(user=user2, item=self.unowned)
        Subscription.subscribe(user=user2, item=self.owned)
        response = self.client.get('/api/library/active')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response_contains(response, self.unowned))
        self.assertEqual(len(response.data), 3)

    def test_subscriptions(self):
        response = self.client.delete(f'/api/library/{self.unowned.id}/unsubscribe')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(self.user in self.unowned.subscribers())

        response = self.client.post(f'/api/library/{self.unowned.id}/subscribe')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertTrue(self.user in self.unowned.subscribers())

        response = self.client.post(f'/api/library/{self.unowned.id}/subscribe')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertTrue(self.user in self.unowned.subscribers())

        response = self.client.delete(f'/api/library/{self.unowned.id}/unsubscribe')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(self.user in self.unowned.subscribers())

    def test_retrieve_templates(self):
        response = self.client.get('/api/library/templates')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response_contains(response, self.common))
        self.assertFalse(response_contains(response, self.unowned))
        self.assertFalse(response_contains(response, self.owned))

        LibraryTemplate.objects.create(lib_source=self.unowned)
        response = self.client.get('/api/library/templates')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response_contains(response, self.common))
        self.assertTrue(response_contains(response, self.unowned))
        self.assertFalse(response_contains(response, self.owned))
