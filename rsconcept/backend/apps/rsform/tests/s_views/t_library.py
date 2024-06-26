''' Testing API: Library. '''
from rest_framework import status

from apps.rsform.models import (
    AccessPolicy,
    Editor,
    LibraryItem,
    LibraryItemType,
    LibraryTemplate,
    LocationHead,
    RSForm,
    Subscription
)

from ..EndpointTester import EndpointTester, decl_endpoint
from ..testing_utils import response_contains


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
            location=LocationHead.COMMON
        )
        self.invalid_user = 1337 + self.user2.pk
        self.invalid_item = 1337 + self.common.pk


    @decl_endpoint('/api/library', method='post')
    def test_create(self):
        data = {
            'title': 'Title',
            'alias': 'alias',
        }
        self.executeBadData(data)

        data = {
            'item_type': LibraryItemType.OPERATIONS_SCHEMA,
            'title': 'Title',
            'alias': 'alias',
            'access_policy': AccessPolicy.PROTECTED,
            'visible': False,
            'read_only': True
        }
        response = self.executeCreated(data)
        self.assertEqual(response.data['owner'], self.user.pk)
        self.assertEqual(response.data['item_type'], data['item_type'])
        self.assertEqual(response.data['title'], data['title'])
        self.assertEqual(response.data['alias'], data['alias'])
        self.assertEqual(response.data['access_policy'], data['access_policy'])
        self.assertEqual(response.data['visible'], data['visible'])
        self.assertEqual(response.data['read_only'], data['read_only'])

        self.logout()
        data = {'title': 'Title2'}
        self.executeForbidden(data)


    @decl_endpoint('/api/library/{item}', method='patch')
    def test_update(self):
        data = {'id': self.unowned.pk, 'title': 'New Title'}
        self.executeNotFound(data, item=self.invalid_item)
        self.executeForbidden(data, item=self.unowned.pk)

        self.toggle_editor(self.unowned, True)
        response = self.executeOK(data, item=self.unowned.pk)
        self.assertEqual(response.data['title'], data['title'])

        self.unowned.access_policy = AccessPolicy.PRIVATE
        self.unowned.save()
        self.executeForbidden(data, item=self.unowned.pk)

        data = {'id': self.owned.pk, 'title': 'New Title'}
        response = self.executeOK(data, item=self.owned.pk)
        self.assertEqual(response.data['title'], data['title'])
        self.assertEqual(response.data['alias'], self.owned.alias)

        data = {
            'id': self.owned.pk,
            'title': 'Another Title',
            'owner': self.user2.pk,
            'access_policy': AccessPolicy.PROTECTED,
            'location': LocationHead.LIBRARY
        }
        response = self.executeOK(data, item=self.owned.pk)
        self.assertEqual(response.data['title'], data['title'])
        self.assertEqual(response.data['owner'], self.owned.owner.pk)
        self.assertEqual(response.data['access_policy'], self.owned.access_policy)
        self.assertEqual(response.data['location'], self.owned.location)
        self.assertNotEqual(response.data['location'], LocationHead.LIBRARY)


    @decl_endpoint('/api/library/{item}/set-owner', method='patch')
    def test_set_owner(self):
        time_update = self.owned.time_update

        data = {'user': self.user.pk}
        self.executeNotFound(data, item=self.invalid_item)
        self.executeForbidden(data, item=self.unowned.pk)
        self.executeOK(data, item=self.owned.pk)
        self.owned.refresh_from_db()
        self.assertEqual(self.owned.owner, self.user)

        data = {'user': self.user2.pk}
        self.executeOK(data, item=self.owned.pk)
        self.owned.refresh_from_db()
        self.assertEqual(self.owned.owner, self.user2)
        self.assertEqual(self.owned.time_update, time_update)
        self.executeForbidden(data, item=self.owned.pk)

        self.toggle_admin(True)
        data = {'user': self.user.pk}
        self.executeOK(data, item=self.owned.pk)
        self.owned.refresh_from_db()
        self.assertEqual(self.owned.owner, self.user)

    @decl_endpoint('/api/library/{item}/set-access-policy', method='patch')
    def test_set_access_policy(self):
        time_update = self.owned.time_update

        data = {'access_policy': 'invalid'}
        self.executeBadData(data, item=self.owned.pk)

        data = {'access_policy': AccessPolicy.PRIVATE}
        self.executeNotFound(data, item=self.invalid_item)
        self.executeForbidden(data, item=self.unowned.pk)
        self.executeOK(data, item=self.owned.pk)
        self.owned.refresh_from_db()
        self.assertEqual(self.owned.access_policy, data['access_policy'])

        self.toggle_editor(self.unowned, True)
        self.executeForbidden(data, item=self.unowned.pk)

        self.toggle_admin(True)
        self.executeOK(data, item=self.unowned.pk)
        self.unowned.refresh_from_db()
        self.assertEqual(self.unowned.access_policy, data['access_policy'])

    @decl_endpoint('/api/library/{item}/set-location', method='patch')
    def test_set_location(self):
        time_update = self.owned.time_update

        data = {'location': 'invalid'}
        self.executeBadData(data, item=self.owned.pk)

        data = {'location': '/U/temp'}
        self.executeNotFound(data, item=self.invalid_item)
        self.executeForbidden(data, item=self.unowned.pk)
        self.executeOK(data, item=self.owned.pk)
        self.owned.refresh_from_db()
        self.assertEqual(self.owned.location, data['location'])

        data = {'location': LocationHead.LIBRARY}
        self.executeForbidden(data, item=self.owned.pk)

        data = {'location': '/U/temp'}
        self.toggle_editor(self.unowned, True)
        self.executeForbidden(data, item=self.unowned.pk)

        self.toggle_admin(True)
        data = {'location': LocationHead.LIBRARY}
        self.executeOK(data, item=self.owned.pk)
        self.owned.refresh_from_db()
        self.assertEqual(self.owned.location, data['location'])

        self.executeOK(data, item=self.unowned.pk)
        self.unowned.refresh_from_db()
        self.assertEqual(self.unowned.location, data['location'])

    @decl_endpoint('/api/library/{item}/editors-add', method='patch')
    def test_add_editor(self):
        time_update = self.owned.time_update

        data = {'user': self.invalid_user}
        self.executeBadData(data, item=self.owned.pk)

        data = {'user': self.user.pk}
        self.executeNotFound(data, item=self.invalid_item)
        self.executeForbidden(data, item=self.unowned.pk)

        self.executeOK(data, item=self.owned.pk)
        self.owned.refresh_from_db()
        self.assertEqual(self.owned.time_update, time_update)
        self.assertEqual(self.owned.editors(), [self.user])

        self.executeOK(data)
        self.assertEqual(self.owned.editors(), [self.user])

        data = {'user': self.user2.pk}
        self.executeOK(data)
        self.assertEqual(set(self.owned.editors()), set([self.user, self.user2]))


    @decl_endpoint('/api/library/{item}/editors-remove', method='patch')
    def test_remove_editor(self):
        time_update = self.owned.time_update

        data = {'user': self.invalid_user}
        self.executeBadData(data, item=self.owned.pk)

        data = {'user': self.user.pk}
        self.executeNotFound(data, item=self.invalid_item)
        self.executeForbidden(data, item=self.unowned.pk)

        self.executeOK(data, item=self.owned.pk)
        self.owned.refresh_from_db()
        self.assertEqual(self.owned.time_update, time_update)
        self.assertEqual(self.owned.editors(), [])

        Editor.add(item=self.owned, user=self.user)
        self.executeOK(data)
        self.assertEqual(self.owned.editors(), [])

        Editor.add(item=self.owned, user=self.user)
        Editor.add(item=self.owned, user=self.user2)
        data = {'user': self.user2.pk}
        self.executeOK(data)
        self.assertEqual(self.owned.editors(), [self.user])


    @decl_endpoint('/api/library/{item}/editors-set', method='patch')
    def test_set_editors(self):
        time_update = self.owned.time_update

        data = {'users': [self.invalid_user]}
        self.executeBadData(data, item=self.owned.pk)

        data = {'users': [self.user.pk]}
        self.executeNotFound(data, item=self.invalid_item)
        self.executeForbidden(data, item=self.unowned.pk)

        self.executeOK(data, item=self.owned.pk)
        self.owned.refresh_from_db()
        self.assertEqual(self.owned.time_update, time_update)
        self.assertEqual(self.owned.editors(), [self.user])

        self.executeOK(data)
        self.assertEqual(self.owned.editors(), [self.user])

        data = {'users': [self.user2.pk]}
        self.executeOK(data)
        self.assertEqual(self.owned.editors(), [self.user2])

        data = {'users': []}
        self.executeOK(data)
        self.assertEqual(self.owned.editors(), [])

        data = {'users': [self.user2.pk, self.user.pk]}
        self.executeOK(data)
        self.assertEqual(set(self.owned.editors()), set([self.user2, self.user]))


    @decl_endpoint('/api/library/{item}', method='delete')
    def test_destroy(self):
        response = self.execute(item=self.owned.pk)
        self.assertTrue(response.status_code in [status.HTTP_202_ACCEPTED, status.HTTP_204_NO_CONTENT])

        self.executeForbidden(item=self.unowned.pk)
        self.toggle_admin(True)
        response = self.execute(item=self.unowned.pk)
        self.assertTrue(response.status_code in [status.HTTP_202_ACCEPTED, status.HTTP_204_NO_CONTENT])


    @decl_endpoint('/api/library/active', method='get')
    def test_retrieve_common(self):
        response = self.executeOK()
        self.assertTrue(response_contains(response, self.common))
        self.assertFalse(response_contains(response, self.unowned))
        self.assertTrue(response_contains(response, self.owned))

        self.logout()
        response = self.executeOK()
        self.assertTrue(response_contains(response, self.common))
        self.assertFalse(response_contains(response, self.unowned))
        self.assertFalse(response_contains(response, self.owned))

    @decl_endpoint('/api/library', method='get')
    def test_library_get(self):
        non_schema = LibraryItem.objects.create(
            item_type=LibraryItemType.OPERATIONS_SCHEMA,
            title='Test4'
        )
        response = self.executeOK()
        self.assertTrue(response_contains(response, non_schema))
        self.assertTrue(response_contains(response, self.unowned))
        self.assertTrue(response_contains(response, self.owned))

    @decl_endpoint('/api/library/all', method='get')
    def test_retrieve_all(self):
        self.toggle_admin(False)
        self.executeForbidden()
        self.toggle_admin(True)
        response = self.executeOK()
        self.assertTrue(response_contains(response, self.common))
        self.assertTrue(response_contains(response, self.unowned))
        self.assertTrue(response_contains(response, self.owned))

        self.logout()
        self.executeForbidden()


    @decl_endpoint('/api/library/active', method='get')
    def test_retrieve_subscribed(self):
        response = self.executeOK()
        self.assertFalse(response_contains(response, self.unowned))

        Subscription.subscribe(user=self.user, item=self.unowned)
        Subscription.subscribe(user=self.user2, item=self.unowned)
        Subscription.subscribe(user=self.user2, item=self.owned)

        response = self.executeOK()
        self.assertTrue(response_contains(response, self.unowned))
        self.assertEqual(len(response.data), 3)


    @decl_endpoint('/api/library/{item}/subscribe', method='post')
    def test_subscriptions(self):
        self.executeNotFound(item=self.invalid_item)
        response = self.client.delete(f'/api/library/{self.unowned.pk}/unsubscribe')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(self.user in self.unowned.subscribers())

        response = self.executeOK(item=self.unowned.pk)
        self.assertTrue(self.user in self.unowned.subscribers())

        response = self.executeOK(item=self.unowned.pk)
        self.assertTrue(self.user in self.unowned.subscribers())

        response = self.client.delete(f'/api/library/{self.unowned.pk}/unsubscribe')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(self.user in self.unowned.subscribers())


    @decl_endpoint('/api/library/templates', method='get')
    def test_retrieve_templates(self):
        response = self.executeOK()
        self.assertFalse(response_contains(response, self.common))
        self.assertFalse(response_contains(response, self.unowned))
        self.assertFalse(response_contains(response, self.owned))

        LibraryTemplate.objects.create(lib_source=self.unowned)
        response = self.executeOK()
        self.assertFalse(response_contains(response, self.common))
        self.assertTrue(response_contains(response, self.unowned))
        self.assertFalse(response_contains(response, self.owned))


    @decl_endpoint('/api/library/{item}/clone', method='post')
    def test_clone_rsform(self):
        x12 = self.schema.insert_new(
            alias='X12',
            term_raw='человек',
            term_resolved='человек'
        )
        d2 = self.schema.insert_new(
            alias='D2',
            term_raw='@{X12|plur}',
            term_resolved='люди'
        )

        data = {'title': 'Title1337'}
        self.executeNotFound(data, item=self.invalid_item)
        self.executeCreated(data, item=self.unowned.pk)

        data = {'title': 'Title1338'}
        response = self.executeCreated(data, item=self.owned.pk)
        self.assertEqual(response.data['title'], data['title'])
        self.assertEqual(len(response.data['items']), 2)
        self.assertEqual(response.data['items'][0]['alias'], x12.alias)
        self.assertEqual(response.data['items'][0]['term_raw'], x12.term_raw)
        self.assertEqual(response.data['items'][0]['term_resolved'], x12.term_resolved)
        self.assertEqual(response.data['items'][1]['term_raw'], d2.term_raw)
        self.assertEqual(response.data['items'][1]['term_resolved'], d2.term_resolved)

        data = {'title': 'Title1340', 'items': []}
        response = self.executeCreated(data, item=self.owned.pk)
        self.assertEqual(response.data['title'], data['title'])
        self.assertEqual(len(response.data['items']), 0)

        data = {'title': 'Title1341', 'items': [x12.pk]}
        response = self.executeCreated(data, item=self.owned.pk)
        self.assertEqual(response.data['title'], data['title'])
        self.assertEqual(len(response.data['items']), 1)
        self.assertEqual(response.data['items'][0]['alias'], x12.alias)
        self.assertEqual(response.data['items'][0]['term_raw'], x12.term_raw)
        self.assertEqual(response.data['items'][0]['term_resolved'], x12.term_resolved)
