''' Testing API: Library. '''
from rest_framework import status

from apps.users.models import User
from apps.rsform.models import LibraryItem, LibraryItemType, Subscription, LibraryTemplate, RSForm

from ..utils import response_contains

from .EndpointTester import decl_endpoint, EndpointTester


class TestLibraryViewset(EndpointTester):
    ''' Testing Library view. '''
    def setUp(self):
        super().setUp()
        self.owned = LibraryItem.objects.create(
            item_type=LibraryItemType.RSFORM,
            title='Test',
            alias='T1',
            owner=self.user
        )
        self.schema = RSForm(self.owned)
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
        self.invalid_item = 1337 + self.common.pk


    @decl_endpoint('/api/library', method='post')
    def test_create(self):
        data = {'title': 'Title'}
        response = self.post(data=data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Title')
        self.assertEqual(response.data['owner'], self.user.id)

        self.logout()
        data = {'title': 'Title2'}
        self.assertForbidden(data)


    @decl_endpoint('/api/library/{item}', method='patch')
    def test_update(self):
        data = {'id': self.unowned.id, 'title': 'New title'}
        self.assertNotFound(data, item=self.invalid_item)
        self.assertForbidden(data, item=self.unowned.id)

        data = {'id': self.owned.id, 'title': 'New title'}
        response = self.execute(data, item=self.owned.id)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'New title')
        self.assertEqual(response.data['alias'], self.owned.alias)


    @decl_endpoint('/api/library/{item}', method='delete')
    def test_destroy(self):
        response = self.execute(item=self.owned.id)
        self.assertTrue(response.status_code in [status.HTTP_202_ACCEPTED, status.HTTP_204_NO_CONTENT])

        self.assertForbidden(item=self.unowned.id)
        self.toggle_staff(True)
        response = self.execute(item=self.unowned.id)
        self.assertTrue(response.status_code in [status.HTTP_202_ACCEPTED, status.HTTP_204_NO_CONTENT])


    @decl_endpoint('/api/library/{item}/claim', method='post')
    def test_claim(self):
        self.assertNotFound(item=self.invalid_item)
        self.assertForbidden(item=self.owned.id)

        self.owned.is_common = True
        self.owned.save()
        self.assertNotModified(item=self.owned.id)
        self.assertForbidden(item=self.unowned.id)

        self.assertFalse(self.user in self.unowned.subscribers())
        self.unowned.is_common = True
        self.unowned.save()

        self.assertOK(item=self.unowned.id)
        self.unowned.refresh_from_db()
        self.assertEqual(self.unowned.owner, self.user)
        self.assertEqual(self.unowned.owner, self.user)
        self.assertTrue(self.user in self.unowned.subscribers())

        self.logout()
        self.assertForbidden(item=self.owned.id)


    @decl_endpoint('/api/library/active', method='get')
    def test_retrieve_common(self):
        response = self.execute()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response_contains(response, self.common))
        self.assertFalse(response_contains(response, self.unowned))
        self.assertTrue(response_contains(response, self.owned))

        self.logout()
        response = self.execute()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response_contains(response, self.common))
        self.assertFalse(response_contains(response, self.unowned))
        self.assertFalse(response_contains(response, self.owned))


    @decl_endpoint('/api/library/active', method='get')
    def test_retrieve_subscribed(self):
        response = self.execute()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response_contains(response, self.unowned))

        user2 =  User.objects.create(username='UserTest2')
        Subscription.subscribe(user=self.user, item=self.unowned)
        Subscription.subscribe(user=user2, item=self.unowned)
        Subscription.subscribe(user=user2, item=self.owned)

        response = self.execute()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response_contains(response, self.unowned))
        self.assertEqual(len(response.data), 3)


    @decl_endpoint('/api/library/{item}/subscribe', method='post')
    def test_subscriptions(self):
        self.assertNotFound(item=self.invalid_item)
        response = self.client.delete(f'/api/library/{self.unowned.id}/unsubscribe')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(self.user in self.unowned.subscribers())

        response = self.execute(item=self.unowned.id)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertTrue(self.user in self.unowned.subscribers())

        response = self.execute(item=self.unowned.id)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertTrue(self.user in self.unowned.subscribers())

        response = self.client.delete(f'/api/library/{self.unowned.id}/unsubscribe')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(self.user in self.unowned.subscribers())


    @decl_endpoint('/api/library/templates', method='get')
    def test_retrieve_templates(self):
        response = self.execute()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response_contains(response, self.common))
        self.assertFalse(response_contains(response, self.unowned))
        self.assertFalse(response_contains(response, self.owned))

        LibraryTemplate.objects.create(lib_source=self.unowned)
        response = self.execute()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response_contains(response, self.common))
        self.assertTrue(response_contains(response, self.unowned))
        self.assertFalse(response_contains(response, self.owned))


    @decl_endpoint('/api/library/{item}/clone', method='post')
    def test_clone_rsform(self):
        x12 = self.schema.insert_new(
            alias='X12',
            term_raw = 'человек',
            term_resolved = 'человек'
        )
        d2 = self.schema.insert_new(
            alias='D2',
            term_raw = '@{X12|plur}',
            term_resolved = 'люди'
        )

        data = {'title': 'Title1337'}
        self.assertNotFound(data, item=self.invalid_item)
        self.assertCreated(data, item=self.unowned.id)

        data = {'title': 'Title1338'}
        response = self.execute(data, item=self.owned.id)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], data['title'])
        self.assertEqual(len(response.data['items']), 2)
        self.assertEqual(response.data['items'][0]['alias'], x12.alias)
        self.assertEqual(response.data['items'][0]['term_raw'], x12.term_raw)
        self.assertEqual(response.data['items'][0]['term_resolved'], x12.term_resolved)
        self.assertEqual(response.data['items'][1]['term_raw'], d2.term_raw)
        self.assertEqual(response.data['items'][1]['term_resolved'], d2.term_resolved)

        data = {'title': 'Title1340', 'items': []}
        response = self.execute(data, item=self.owned.id)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], data['title'])
        self.assertEqual(len(response.data['items']), 0)

        data = {'title': 'Title1341', 'items': [x12.pk]}
        response = self.execute(data, item=self.owned.id)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], data['title'])
        self.assertEqual(len(response.data['items']), 1)
        self.assertEqual(response.data['items'][0]['alias'], x12.alias)
        self.assertEqual(response.data['items'][0]['term_raw'], x12.term_raw)
        self.assertEqual(response.data['items'][0]['term_resolved'], x12.term_resolved)
