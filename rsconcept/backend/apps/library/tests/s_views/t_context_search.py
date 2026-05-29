''' Testing API: Library context search. '''
from apps.library.models import AccessPolicy, LibraryItem, LibraryItemType, LocationHead
from apps.oss.models import Block, Operation, OperationType
from apps.rsform.models import Constituenta
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
