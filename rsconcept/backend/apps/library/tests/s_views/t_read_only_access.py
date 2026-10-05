''' Regression: read-only items stay readable for owners and editors. '''
from apps.library.models import AccessPolicy, LibraryItem
from shared.EndpointTester import EndpointTester


class TestReadOnlyAccess(EndpointTester):
    ''' Owner and editor reads must not depend on write permission. '''

    def setUp(self):
        super().setUp()
        self.private_owned = LibraryItem.objects.create(
            title='Private owned',
            alias='RO1',
            owner=self.user,
            access_policy=AccessPolicy.PRIVATE,
            read_only=True,
        )
        self.protected_edited = LibraryItem.objects.create(
            title='Protected edited',
            alias='RO2',
            owner=self.user2,
            access_policy=AccessPolicy.PROTECTED,
            read_only=True,
        )
        self.toggle_editor(self.protected_edited, True)
        self.private_edited = LibraryItem.objects.create(
            title='Private edited',
            alias='RO3',
            owner=self.user2,
            access_policy=AccessPolicy.PRIVATE,
            read_only=True,
        )
        self.toggle_editor(self.private_edited, True)
        self.public_locked = LibraryItem.objects.create(
            title='Public locked',
            alias='RO4',
            owner=self.user2,
            access_policy=AccessPolicy.PUBLIC,
            read_only=True,
        )

    def test_owner_can_read_private_read_only_item(self):
        library = self.client.get(f'/api/library/{self.private_owned.pk}')
        details = self.client.get(f'/api/rsforms/{self.private_owned.pk}/details')
        self.assertEqual(library.status_code, 200)
        self.assertEqual(details.status_code, 200)
        self.assertEqual(library.data['id'], self.private_owned.pk)

    def test_owner_cannot_edit_private_read_only_item(self):
        response = self.client.patch(
            f'/api/library/{self.private_owned.pk}',
            data={'title': 'Changed'},
            format='json',
        )
        self.assertEqual(response.status_code, 403)
        self.private_owned.refresh_from_db()
        self.assertEqual(self.private_owned.title, 'Private owned')

    def test_editor_can_read_protected_read_only_item(self):
        library = self.client.get(f'/api/library/{self.protected_edited.pk}')
        details = self.client.get(f'/api/rsforms/{self.protected_edited.pk}/details')
        self.assertEqual(library.status_code, 200)
        self.assertEqual(details.status_code, 200)

    def test_editor_cannot_edit_protected_read_only_item(self):
        response = self.client.patch(
            f'/api/library/{self.protected_edited.pk}',
            data={'title': 'Changed'},
            format='json',
        )
        self.assertEqual(response.status_code, 403)

    def test_editor_cannot_read_private_read_only_item(self):
        library = self.client.get(f'/api/library/{self.private_edited.pk}')
        details = self.client.get(f'/api/rsforms/{self.private_edited.pk}/details')
        self.assertEqual(library.status_code, 403)
        self.assertEqual(details.status_code, 403)

    def test_stranger_cannot_read_private_read_only_item(self):
        self.login2()
        response = self.client.get(f'/api/library/{self.private_owned.pk}')
        self.assertEqual(response.status_code, 403)

    def test_anonymous_can_read_public_read_only_item(self):
        self.logout()
        response = self.client.get(f'/api/library/{self.public_locked.pk}')
        self.assertEqual(response.status_code, 200)

    def test_anonymous_cannot_read_private_read_only_item(self):
        self.logout()
        response = self.client.get(f'/api/library/{self.private_owned.pk}')
        self.assertEqual(response.status_code, 403)
