''' Testing API: Library context search. '''
from apps.library.models import AccessPolicy, LibraryItem, LibraryItemType, LocationHead
from apps.oss.models import Block, Operation, OperationType
from apps.rsform.models import Constituenta
from apps.rsmodel.models import RSModel
from shared.EndpointTester import EndpointTester, decl_endpoint


class TestLibraryContextSearch(EndpointTester):
    ''' Testing library context search endpoint. '''

    endpoint_search = '/api/library/context-search'

    def setUp(self):
        super().setUp()
        self.schema = LibraryItem.objects.create(
            title='Outer title',
            alias='OUT',
            description='Outer description',
            owner=self.user,
            location=LocationHead.USER
        )
        Constituenta.objects.create(
            schema=self.schema,
            alias='X1',
            term_resolved='UniqueTermToken',
        )
        self.hidden = LibraryItem.objects.create(
            title='Hidden schema',
            alias='HID',
            description='',
            owner=self.user,
            visible=False,
            location=LocationHead.USER
        )
        Constituenta.objects.create(
            schema=self.hidden,
            alias='X42',
            term_resolved='HiddenUniqueTerm',
        )
        self.oss = LibraryItem.objects.create(
            item_type=LibraryItemType.OPERATION_SCHEMA,
            title='OSS title',
            alias='OSS1',
            owner=self.user,
            location=LocationHead.USER
        )
        Operation.objects.create(
            oss=self.oss,
            operation_type=OperationType.INPUT,
            alias='OP1',
            title='OperationUniqueTitle',
            description=''
        )
        Block.objects.create(
            oss=self.oss,
            title='BlockUniqueTitle',
            description=''
        )

    def _search(self, **params):
        response = self.client.get(self.endpoint_search, params)
        self.assertEqual(response.status_code, 200)
        return response

    @decl_endpoint('/api/library/context-search', method='get')
    def test_search_by_constituent_term(self):
        response = self._search(q='UniqueTermToken')
        self.assertIn(self.schema.pk, response.data['ids'])
        self.assertNotIn(self.oss.pk, response.data['ids'])

    @decl_endpoint('/api/library/context-search', method='get')
    def test_search_is_case_insensitive(self):
        response = self._search(q='uniquetermtoken')
        self.assertIn(self.schema.pk, response.data['ids'])

        Constituenta.objects.create(
            schema=self.schema,
            alias='C2',
            term_resolved='Словоформы',
        )
        response = self._search(q='словоформы')
        self.assertIn(self.schema.pk, response.data['ids'])
        response = self._search(q='СЛОВОФОРМЫ')
        self.assertIn(self.schema.pk, response.data['ids'])

    @decl_endpoint('/api/library/context-search', method='get')
    def test_search_respects_field_filter(self):
        response = self._search(q='UniqueTermToken', search_fields='title')
        self.assertNotIn(self.schema.pk, response.data['ids'])

        response = self._search(q='Outer title', search_fields='title')
        self.assertIn(self.schema.pk, response.data['ids'])

    @decl_endpoint('/api/library/context-search', method='get')
    def test_search_oss_operation_and_block(self):
        response = self._search(q='OperationUniqueTitle', search_fields='operation')
        self.assertIn(self.oss.pk, response.data['ids'])

        response = self._search(q='BlockUniqueTitle', search_fields='block')
        self.assertIn(self.oss.pk, response.data['ids'])

    @decl_endpoint('/api/library/context-search', method='get')
    def test_search_hidden_item_for_owner(self):
        response = self._search(q='HiddenUniqueTerm')
        self.assertIn(self.hidden.pk, response.data['ids'])

    @decl_endpoint('/api/library/context-search', method='get')
    def test_search_empty_query(self):
        response = self._search(q='   ')
        self.assertEqual(response.data['ids'], [])

    @decl_endpoint('/api/library/context-search', method='get')
    def test_search_does_not_leak_linked_private_schema(self):
        private_schema = LibraryItem.objects.create(
            title='Private schema',
            alias='PRV',
            owner=self.user2,
            access_policy=AccessPolicy.PRIVATE,
            location=LocationHead.USER
        )
        Constituenta.objects.create(
            schema=private_schema,
            alias='S1',
            term_resolved='SecretLinkedTerm',
        )
        public_model = LibraryItem.objects.create(
            item_type=LibraryItemType.RSMODEL,
            title='Public model',
            alias='MOD',
            owner=self.user,
            access_policy=AccessPolicy.PUBLIC,
            location=LocationHead.COMMON
        )
        RSModel.objects.create(model=public_model, schema=private_schema)

        response = self._search(q='SecretLinkedTerm')
        self.assertNotIn(public_model.pk, response.data['ids'])

    @decl_endpoint('/api/library/context-search', method='get')
    def test_search_anonymous_only_public(self):
        public_schema = LibraryItem.objects.create(
            title='Public schema',
            alias='PUB',
            location=LocationHead.COMMON,
            access_policy=AccessPolicy.PUBLIC
        )
        Constituenta.objects.create(
            schema=public_schema,
            alias='P1',
            term_resolved='AnonymousVisibleTerm',
        )
        self.logout()
        response = self._search(q='AnonymousVisibleTerm')
        self.assertIn(public_schema.pk, response.data['ids'])
        self.assertNotIn(self.schema.pk, response.data['ids'])

    @decl_endpoint('/api/library/context-search', method='get')
    def test_search_filters_by_location_exact(self):
        nested = LibraryItem.objects.create(
            title='Nested schema',
            alias='NST',
            owner=self.user,
            location=f'{LocationHead.USER}/Project'
        )
        Constituenta.objects.create(
            schema=nested,
            alias='X2',
            term_resolved='LocationScopedTerm',
        )
        response = self._search(q='LocationScopedTerm', location=LocationHead.USER)
        self.assertNotIn(nested.pk, response.data['ids'])

        response = self._search(q='LocationScopedTerm', location=f'{LocationHead.USER}/Project')
        self.assertIn(nested.pk, response.data['ids'])

    @decl_endpoint('/api/library/context-search', method='get')
    def test_search_filters_by_location_with_subfolders(self):
        nested = LibraryItem.objects.create(
            title='Nested schema',
            alias='NST',
            owner=self.user,
            location=f'{LocationHead.USER}/Project'
        )
        Constituenta.objects.create(
            schema=nested,
            alias='X2',
            term_resolved='LocationScopedTerm',
        )
        response = self._search(
            q='LocationScopedTerm',
            location=LocationHead.USER,
            subfolders='1'
        )
        self.assertIn(nested.pk, response.data['ids'])

    @decl_endpoint('/api/library/context-search', method='get')
    def test_search_filters_by_item_type(self):
        response = self._search(q='OperationUniqueTitle', item_type='rsform')
        self.assertNotIn(self.oss.pk, response.data['ids'])

        response = self._search(q='OperationUniqueTitle', search_fields='operation', item_type='oss')
        self.assertIn(self.oss.pk, response.data['ids'])
        self.assertNotIn(self.schema.pk, response.data['ids'])

    @decl_endpoint('/api/library/context-search', method='get')
    def test_search_rejects_invalid_location(self):
        response = self.client.get(self.endpoint_search, {'q': 'test', 'location': 'bad-path'})
        self.assertEqual(response.status_code, 400)

    @decl_endpoint('/api/library/context-search', method='get')
    def test_search_rejects_invalid_item_type(self):
        response = self.client.get(self.endpoint_search, {'q': 'test', 'item_type': 'unknown'})
        self.assertEqual(response.status_code, 400)
