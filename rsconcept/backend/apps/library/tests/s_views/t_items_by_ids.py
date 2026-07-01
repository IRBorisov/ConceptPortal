''' Testing API: Library items by ids. '''
from apps.library.models import AccessPolicy, LibraryItem, LibraryItemType, LocationHead
from apps.library.utils import MAX_LIBRARY_ITEMS_BY_IDS
from shared.EndpointTester import EndpointTester, decl_endpoint


def response_contains(response, item: LibraryItem) -> bool:
    return any(entry['id'] == item.pk for entry in response.data)


class TestLibraryItemsByIds(EndpointTester):
    ''' Testing library items lookup by ids endpoint. '''

    endpoint_lookup = '/api/library/by-ids'

    def setUp(self):
        super().setUp()
        self.owned = LibraryItem.objects.create(
            title='Owned schema',
            alias='OWN',
            description='Owned description',
            owner=self.user,
            location=LocationHead.USER
        )
        self.common = LibraryItem.objects.create(
            title='Common schema',
            alias='COM',
            description='Common description',
            location=LocationHead.COMMON,
            access_policy=AccessPolicy.PUBLIC
        )
        self.private = LibraryItem.objects.create(
            title='Private schema',
            alias='PRV',
            description='Private description',
            owner=self.user2,
            access_policy=AccessPolicy.PRIVATE,
            location=LocationHead.USER
        )

    def _lookup(self, **params):
        response = self.client.get(self.endpoint_lookup, params)
        self.assertEqual(response.status_code, 200)
        return response

    @decl_endpoint('/api/library/by-ids', method='get')
    def test_returns_accessible_items(self):
        response = self._lookup(ids=f'{self.owned.pk},{self.common.pk},{self.private.pk}')
        self.assertTrue(response_contains(response, self.owned))
        self.assertTrue(response_contains(response, self.common))
        self.assertFalse(response_contains(response, self.private))
        self.assertEqual(len(response.data), 2)

    @decl_endpoint('/api/library/by-ids', method='get')
    def test_preserves_request_order(self):
        response = self._lookup(ids=f'{self.common.pk},{self.owned.pk}')
        self.assertEqual(response.data[0]['id'], self.common.pk)
        self.assertEqual(response.data[1]['id'], self.owned.pk)

    @decl_endpoint('/api/library/by-ids', method='get')
    def test_returns_metadata_fields(self):
        response = self._lookup(ids=str(self.owned.pk))
        item = response.data[0]
        self.assertEqual(item['title'], self.owned.title)
        self.assertEqual(item['alias'], self.owned.alias)
        self.assertEqual(item['description'], self.owned.description)
        self.assertEqual(item['item_type'], LibraryItemType.RSFORM)
        self.assertEqual(item['location'], self.owned.location)

    @decl_endpoint('/api/library/by-ids', method='get')
    def test_empty_ids_returns_empty_list(self):
        response = self._lookup(ids='')
        self.assertEqual(response.data, [])

    @decl_endpoint('/api/library/by-ids', method='get')
    def test_anonymous_only_public_items(self):
        self.logout()
        response = self._lookup(ids=f'{self.common.pk},{self.owned.pk}')
        self.assertEqual(len(response.data), 1)
        self.assertTrue(response_contains(response, self.common))

    @decl_endpoint('/api/library/by-ids', method='get')
    def test_rejects_invalid_id(self):
        response = self.client.get(self.endpoint_lookup, {'ids': '1,bad'})
        self.assertEqual(response.status_code, 400)

    @decl_endpoint('/api/library/by-ids', method='get')
    def test_rejects_id_above_pk_range(self):
        response = self.client.get(self.endpoint_lookup, {'ids': str(2**63)})
        self.assertEqual(response.status_code, 400)

    @decl_endpoint('/api/library/by-ids', method='get')
    def test_rejects_too_many_ids(self):
        ids = ','.join(str(index) for index in range(1, MAX_LIBRARY_ITEMS_BY_IDS + 2))
        response = self.client.get(self.endpoint_lookup, {'ids': ids})
        self.assertEqual(response.status_code, 400)
