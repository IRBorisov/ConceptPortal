''' Testing API: Library. '''
from rest_framework import status

from apps.library.models import (
    AccessPolicy,
    Editor,
    LibraryItem,
    LibraryItemType,
    LibraryTemplate,
    LocationHead
)
from apps.rsform.models import RSForm
from shared.EndpointTester import EndpointTester, decl_endpoint
from shared.testing_utils import response_contains


class TestLibraryViewset(EndpointTester):
    ''' Testing Library view. '''

    def setUp(self):
        super().setUp()
        self.owned = LibraryItem.objects.create(
            title='Test',
            alias='T1',
            owner=self.user
        )
        self.unowned = LibraryItem.objects.create(
            title='Test2',
            alias='T2'
        )
        self.common = LibraryItem.objects.create(
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
        response = self.executeCreated(data=data)
        self.assertEqual(response.data['owner'], self.user.pk)
        self.assertEqual(response.data['item_type'], LibraryItemType.RSFORM)
        self.assertEqual(response.data['title'], data['title'])
        self.assertEqual(response.data['alias'], data['alias'])

        data = {
            'item_type': LibraryItemType.OPERATION_SCHEMA,
            'title': 'Title2',
            'alias': 'alias2',
            'access_policy': AccessPolicy.PROTECTED,
            'visible': False,
            'read_only': True
        }
        response = self.executeCreated(data=data)
        self.assertEqual(response.data['owner'], self.user.pk)
        self.assertEqual(response.data['item_type'], data['item_type'])
        self.assertEqual(response.data['title'], data['title'])
        self.assertEqual(response.data['alias'], data['alias'])
        self.assertEqual(response.data['access_policy'], data['access_policy'])
        self.assertEqual(response.data['visible'], data['visible'])
        self.assertEqual(response.data['read_only'], data['read_only'])

        self.logout()
        data = {'title': 'Title2'}
        self.executeForbidden(data=data)


    @decl_endpoint('/api/library/{item}', method='patch')
    def test_update(self):
        data = {'title': 'New Title'}
        self.executeNotFound(data=data, item=self.invalid_item)
        self.executeForbidden(data=data, item=self.unowned.pk)

        self.toggle_editor(self.unowned, True)
        response = self.executeOK(data=data, item=self.unowned.pk)
        self.assertEqual(response.data['title'], data['title'])

        self.unowned.access_policy = AccessPolicy.PRIVATE
        self.unowned.save()
        self.executeForbidden(data=data, item=self.unowned.pk)

        data = {'title': 'New Title'}
        response = self.executeOK(data=data, item=self.owned.pk)
        self.assertEqual(response.data['title'], data['title'])
        self.assertEqual(response.data['alias'], self.owned.alias)

        data = {
            'title': 'Another Title',
            'owner': self.user2.pk,
            'access_policy': AccessPolicy.PROTECTED,
            'location': LocationHead.LIBRARY
        }
        response = self.executeOK(data=data, item=self.owned.pk)
        self.assertEqual(response.data['title'], data['title'])
        self.assertEqual(response.data['owner'], self.owned.owner.pk)
        self.assertEqual(response.data['access_policy'], self.owned.access_policy)
        self.assertEqual(response.data['location'], self.owned.location)
        self.assertNotEqual(response.data['location'], LocationHead.LIBRARY)


    @decl_endpoint('/api/library/{item}/set-owner', method='patch')
    def test_set_owner(self):
        time_update = self.owned.time_update

        data = {'user': self.user.pk}
        self.executeNotFound(data=data, item=self.invalid_item)
        self.executeForbidden(data=data, item=self.unowned.pk)
        self.executeOK(data=data, item=self.owned.pk)
        self.owned.refresh_from_db()
        self.assertEqual(self.owned.owner, self.user)

        data = {'user': self.user2.pk}
        self.executeOK(data=data, item=self.owned.pk)
        self.owned.refresh_from_db()
        self.assertEqual(self.owned.owner, self.user2)
        self.assertEqual(self.owned.time_update, time_update)
        self.executeForbidden(data=data, item=self.owned.pk)

        self.toggle_admin(True)
        data = {'user': self.user.pk}
        self.executeOK(data=data, item=self.owned.pk)
        self.owned.refresh_from_db()
        self.assertEqual(self.owned.owner, self.user)

    @decl_endpoint('/api/library/{item}/set-access-policy', method='patch')
    def test_set_access_policy(self):
        time_update = self.owned.time_update

        data = {'access_policy': 'invalid'}
        self.executeBadData(data=data, item=self.owned.pk)

        data = {'access_policy': AccessPolicy.PRIVATE}
        self.executeNotFound(data=data, item=self.invalid_item)
        self.executeForbidden(data=data, item=self.unowned.pk)
        self.executeOK(data=data, item=self.owned.pk)
        self.owned.refresh_from_db()
        self.assertEqual(self.owned.access_policy, data['access_policy'])

        self.toggle_editor(self.unowned, True)
        self.executeForbidden(data=data, item=self.unowned.pk)

        self.toggle_admin(True)
        self.executeOK(data=data, item=self.unowned.pk)
        self.unowned.refresh_from_db()
        self.assertEqual(self.unowned.access_policy, data['access_policy'])

    @decl_endpoint('/api/library/{item}/set-location', method='patch')
    def test_set_location(self):
        time_update = self.owned.time_update

        data = {'location': 'invalid'}
        self.executeBadData(data=data, item=self.owned.pk)

        data = {'location': '/U/temp'}
        self.executeNotFound(data=data, item=self.invalid_item)
        self.executeForbidden(data=data, item=self.unowned.pk)
        self.executeOK(data=data, item=self.owned.pk)
        self.owned.refresh_from_db()
        self.assertEqual(self.owned.location, data['location'])

        data = {'location': LocationHead.LIBRARY}
        self.executeForbidden(data=data, item=self.owned.pk)

        data = {'location': '/U/temp'}
        self.toggle_editor(self.unowned, True)
        self.executeForbidden(data=data, item=self.unowned.pk)

        self.toggle_admin(True)
        data = {'location': LocationHead.LIBRARY}
        self.executeOK(data=data, item=self.owned.pk)
        self.owned.refresh_from_db()
        self.assertEqual(self.owned.location, data['location'])

        self.executeOK(data=data, item=self.unowned.pk)
        self.unowned.refresh_from_db()
        self.assertEqual(self.unowned.location, data['location'])

    @decl_endpoint('/api/library/rename-location', method='patch')
    def test_rename_location(self):
        self.owned.location = '/S/temp'
        self.owned.save()
        self.unowned.location = '/S/temp'
        self.unowned.save()
        owned2 = LibraryItem.objects.create(
            title='Test3',
            alias='T3',
            owner=self.user,
            location='/S/temp/123'
        )

        data = {
            'target': '/S/temp',
            'new_location': '/S/temp2'
        }

        self.executeBadData(data={})
        self.executeBadData(data={'target:': '/S/temp'})
        self.executeBadData(data={'new_location:': '/S/temp'})
        self.executeBadData(data={'target:': 'invalid', 'new_location': '/S/temp'})
        self.executeBadData(data={'target:': '/S/temp', 'new_location': 'invalid'})
        self.executeOK(data=data)
        self.owned.refresh_from_db()
        self.unowned.refresh_from_db()
        owned2.refresh_from_db()
        self.assertEqual(self.owned.location, '/S/temp2')
        self.assertEqual(self.unowned.location, '/S/temp')
        self.assertEqual(owned2.location, '/S/temp2/123')

        self.toggle_admin(True)
        self.executeOK(data=data)
        self.unowned.refresh_from_db()
        self.assertEqual(self.unowned.location, '/S/temp2')

    @decl_endpoint('/api/library/rename-location', method='patch')
    def test_rename_location_user(self):
        self.owned.location = '/U/temp'
        self.owned.save()
        self.unowned.location = '/U/temp'
        self.unowned.save()

        data = {
            'target': '/U/temp',
            'new_location': '/U/temp2'
        }

        self.toggle_admin(True)
        self.executeOK(data=data)
        self.owned.refresh_from_db()
        self.unowned.refresh_from_db()
        self.assertEqual(self.owned.location, '/U/temp2')
        self.assertEqual(self.unowned.location, '/U/temp')

    @decl_endpoint('/api/library/{item}/set-editors', method='patch')
    def test_set_editors(self):
        time_update = self.owned.time_update

        data = {'users': [self.invalid_user]}
        self.executeBadData(data=data, item=self.owned.pk)

        data = {'users': [self.user.pk]}
        self.executeNotFound(data=data, item=self.invalid_item)
        self.executeForbidden(data=data, item=self.unowned.pk)

        self.executeOK(data=data, item=self.owned.pk)
        self.owned.refresh_from_db()
        self.assertEqual(self.owned.time_update, time_update)
        self.assertEqual(list(self.owned.getQ_editors()), [self.user])

        self.executeOK(data=data)
        self.assertEqual(list(self.owned.getQ_editors()), [self.user])

        data = {'users': [self.user2.pk]}
        self.executeOK(data=data)
        self.assertEqual(list(self.owned.getQ_editors()), [self.user2])

        data = {'users': []}
        self.executeOK(data=data)
        self.assertEqual(list(self.owned.getQ_editors()), [])

        data = {'users': [self.user2.pk, self.user.pk]}
        self.executeOK(data=data)
        self.assertEqual(set(self.owned.getQ_editors()), set([self.user2, self.user]))


    @decl_endpoint('/api/library/{item}', method='delete')
    def test_destroy(self):
        self.executeNoContent(item=self.owned.pk)
        self.executeForbidden(item=self.unowned.pk)
        self.toggle_admin(True)
        self.executeNoContent(item=self.unowned.pk)


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
            item_type=LibraryItemType.OPERATION_SCHEMA,
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
        schema = RSForm(self.owned)
        x12 = schema.insert_new(
            alias='X12',
            term_raw='человек',
            term_resolved='человек'
        )
        d2 = schema.insert_new(
            alias='D2',
            term_raw='@{X12|plur}',
            term_resolved='люди'
        )

        data = {'title': 'Title1337'}
        self.executeNotFound(data=data, item=self.invalid_item)
        self.executeCreated(data=data, item=self.unowned.pk)

        data = {'title': 'Title1338'}
        response = self.executeCreated(data=data, item=self.owned.pk)
        self.assertEqual(response.data['title'], data['title'])
        self.assertEqual(len(response.data['items']), 2)
        self.assertEqual(response.data['items'][0]['alias'], x12.alias)
        self.assertEqual(response.data['items'][0]['term_raw'], x12.term_raw)
        self.assertEqual(response.data['items'][0]['term_resolved'], x12.term_resolved)
        self.assertEqual(response.data['items'][1]['term_raw'], d2.term_raw)
        self.assertEqual(response.data['items'][1]['term_resolved'], d2.term_resolved)

        data = {'title': 'Title1340', 'items': []}
        response = self.executeCreated(data=data, item=self.owned.pk)
        self.assertEqual(response.data['title'], data['title'])
        self.assertEqual(len(response.data['items']), 0)

        data = {'title': 'Title1341', 'items': [x12.pk]}
        response = self.executeCreated(data=data, item=self.owned.pk)
        self.assertEqual(response.data['title'], data['title'])
        self.assertEqual(len(response.data['items']), 1)
        self.assertEqual(response.data['items'][0]['alias'], x12.alias)
        self.assertEqual(response.data['items'][0]['term_raw'], x12.term_raw)
        self.assertEqual(response.data['items'][0]['term_resolved'], x12.term_resolved)
