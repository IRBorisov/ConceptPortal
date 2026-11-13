''' Agent model creation: schema ACLs, ownership, atomicity and quotas. '''
from unittest.mock import patch

from django.core.cache import cache
from rest_framework.exceptions import ValidationError
from rest_framework.test import APIClient

from apps.agents.models import AgentActionLog, ApiKey
from apps.library.models import AccessPolicy, LibraryItem, LibraryItemType
from apps.rsform.models import RSForm
from apps.rsmodel.models import RSModel
from shared.EndpointTester import EndpointTester


class TestAgentModelCreate(EndpointTester):
    ''' Creating a model cannot bypass schema access or leave a partial item. '''

    def setUp(self):
        super().setUp()
        cache.clear()
        self.schema = RSForm.create(title='Schema', alias='S', owner=self.user)
        self.private = RSForm.create(
            title='Private schema', alias='PRIVATE', owner=self.user2,
            access_policy=AccessPolicy.PRIVATE,
        )
        self.key, token = ApiKey.create_for_user(self.user, 'Create model')
        self.client.force_authenticate(user=None)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        self.payload = {
            'title': 'Conceptual model', 'alias': 'MODEL',
            'description': 'Interpretation of the schema',
            'schema': self.schema.model.pk,
            'location': '/U/Дипломы/D00B01',
            'access_policy': AccessPolicy.PRIVATE,
        }

    def reject_without_item(self, payload, status_code):
        ''' Rejections may consume quota/audit, but never create library/model rows. '''
        items = LibraryItem.objects.count()
        models = RSModel.objects.count()
        response = self.client.post('/api/agents/models', payload, format='json')
        self.assertEqual(response.status_code, status_code, response.data)
        self.assertEqual(LibraryItem.objects.count(), items)
        self.assertEqual(RSModel.objects.count(), models)
        return response

    def test_create_returns_bound_model_and_readable_details(self):
        response = self.client.post('/api/agents/models', self.payload, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(response.data['schema'], self.schema.model.pk)
        self.assertIs(type(response.data['schema']), int)
        self.assertEqual(response.data['item_type'], LibraryItemType.RSMODEL)
        self.assertEqual(response.data['owner'], self.user.pk)
        self.assertEqual(response.data['location'], self.payload['location'])
        self.assertEqual(response.data['access_policy'], AccessPolicy.PRIVATE)
        self.assertEqual(response.data['description'], self.payload['description'])
        self.assertEqual(response.data['items'], [])
        model = RSModel.objects.get(pk=response.data['id'])
        self.assertEqual(model.schema_id, self.schema.model.pk)
        details = self.client.get(f'/api/agents/models/{model.pk}/details')
        self.assertEqual(details.status_code, 200)
        self.assertEqual(details.data, response.data)
        audit = AgentActionLog.objects.get(action='model.create')
        self.assertEqual(audit.item_id, model.pk)
        self.assertEqual(audit.status_code, 201)
        self.assertEqual(audit.api_key_id, self.key.pk)

    def test_required_schema_and_rejected_reference_types_leave_no_item(self):
        missing = dict(self.payload)
        missing.pop('schema')
        self.reject_without_item(missing, 400)
        non_schema = RSModel.create(self.schema.model, title='Not a schema', owner=self.user)
        for schema in (None, 'not-an-id', 99999999, non_schema.pk):
            with self.subTest(schema=schema):
                response = self.reject_without_item({**self.payload, 'schema': schema}, 400)
                self.assertIn('schema', response.data)

    def test_private_foreign_schema_cannot_be_bound(self):
        self.reject_without_item({**self.payload, 'schema': self.private.model.pk}, 403)
        self.assertTrue(AgentActionLog.objects.filter(action='model.create', status_code=403).exists())

    def test_public_foreign_and_private_owned_schemas_can_be_read(self):
        public = RSForm.create(title='Public', owner=self.user2, access_policy=AccessPolicy.PUBLIC)
        owned = RSForm.create(title='Owned private', owner=self.user, access_policy=AccessPolicy.PRIVATE)
        for schema in (public.model, owned.model):
            with self.subTest(schema=schema.pk):
                response = self.client.post('/api/agents/models', {**self.payload, 'schema': schema.pk}, format='json')
                self.assertEqual(response.status_code, 201, response.data)
                self.assertEqual(response.data['owner'], self.user.pk)
                self.assertEqual(response.data['schema'], schema.pk)

    def test_owner_and_item_type_are_server_controlled(self):
        response = self.client.post('/api/agents/models', {
            **self.payload, 'owner': self.user2.pk, 'item_type': LibraryItemType.OPERATION_SCHEMA,
        }, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        item = LibraryItem.objects.get(pk=response.data['id'])
        self.assertEqual(item.owner_id, self.user.pk)
        self.assertEqual(item.item_type, LibraryItemType.RSMODEL)

    def test_location_and_access_policy_are_validated_before_creation(self):
        self.reject_without_item({**self.payload, 'location': '/L/06 Дипломы'}, 403)
        self.reject_without_item({**self.payload, 'location': '/X/invalid'}, 400)
        self.reject_without_item({**self.payload, 'access_policy': 'everyone'}, 400)
        self.user.is_staff = True
        self.user.save(update_fields=['is_staff'])
        response = self.client.post('/api/agents/models', {**self.payload, 'location': '/L/06 Дипломы'}, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(response.data['location'], '/L/06 Дипломы')

    def test_default_location_is_personal(self):
        payload = dict(self.payload)
        payload.pop('location')
        response = self.client.post('/api/agents/models', payload, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(response.data['location'], '/U')

    def test_missing_or_read_only_key_cannot_create(self):
        self.client.credentials()
        self.reject_without_item(self.payload, 401)
        _, token = ApiKey.create_for_user(self.user, 'Read only', scopes=['read'])
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        self.reject_without_item(self.payload, 403)

    def test_non_object_and_unknown_fields_are_rejected(self):
        self.reject_without_item([self.payload], 400)
        self.reject_without_item({**self.payload, 'unexpected': True}, 400)
        self.assertEqual(AgentActionLog.objects.filter(action='model.create', status_code=400).count(), 2)

    def test_binding_failure_rolls_back_library_item(self):
        with patch.object(RSModel.objects, 'create', side_effect=ValidationError('Synthetic binding failure')):
            self.reject_without_item(self.payload, 400)
        self.assertFalse(AgentActionLog.objects.filter(action='model.create', status_code=201).exists())
        self.assertTrue(AgentActionLog.objects.filter(action='model.create', status_code=400).exists())

    def test_creation_consumes_shared_heavy_budget(self):
        with (
            patch('apps.agents.services.quota.HEAVY_PER_HOUR', 1),
            patch('apps.agents.services.quota.WRITE_PER_MINUTE', 50),
            patch('apps.agents.services.quota.WRITE_PER_HOUR', 50),
        ):
            response = self.client.post('/api/agents/models', self.payload, format='json')
            self.assertEqual(response.status_code, 201, response.data)
            self.reject_without_item(self.payload, 429)
        self.assertEqual(AgentActionLog.objects.filter(action='model.create').count(), 1)

    def test_read_only_key_does_not_gain_creation_from_session(self):
        _, token = ApiKey.create_for_user(self.user, 'Read only', scopes=['read'])
        client = APIClient()
        client.force_authenticate(user=self.user)
        self.assertEqual(client.post('/api/agents/models', self.payload, format='json').status_code, 403)
        client.force_authenticate(user=None)
        client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        self.assertEqual(client.post('/api/agents/models', self.payload, format='json').status_code, 403)
