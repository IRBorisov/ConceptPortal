''' Testing API: agent conceptual model interpretations. '''
from django.core.cache import cache
from rest_framework import status

from apps.agents.models import AgentActionLog, ApiKey
from apps.library.models import AccessPolicy, Editor, LibraryItem
from apps.rsform.models import RSForm
from apps.rsmodel.models import ConstituentData, RSModel
from shared.concurrency import EXPECTED_TIME_UPDATE_HEADER
from shared.EndpointTester import EndpointTester, decl_endpoint


class TestAgentModelApi(EndpointTester):
    ''' API-key routes that read and change model interpretations. '''

    def setUp(self):
        ''' Authenticate as the model owner and prepare two constituents. '''
        super().setUp()
        cache.clear()
        self.schema = RSForm.create(title='Schema', alias='S1', owner=self.user)
        self.x1 = self.schema.insert_last(alias='X1')
        self.x2 = self.schema.insert_last(alias='X2')
        self.model = RSModel.create(
            self.schema.model,
            title='Model',
            alias='M1',
            owner=self.user,
        )
        self.model_id = self.model.pk
        self.private = RSModel.create(
            self.schema.model,
            title='Private',
            alias='PRIV',
            owner=self.user2,
            access_policy=AccessPolicy.PRIVATE,
        )
        _, self.secret = ApiKey.create_for_user(self.user, 'ModelAgent')
        self.client.force_authenticate(user=None)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.secret}')

    def _bind(self, constituent, data, model=None):
        ''' Store one interpretation binding on the model. '''
        return ConstituentData.objects.create(
            model=(model or self.model).model,
            constituent=constituent,
            type='basic',
            data=data,
        )

    @decl_endpoint('/api/agents/models/{item}/details', method='get')
    def test_details_returns_interpretations(self):
        ''' Details include the schema id and stored values, and are not logged. '''
        self._bind(self.x1, {'1': 'Петя'})
        response = self.executeOK(item=self.model_id)
        self.assertEqual(response.data['alias'], 'M1')
        self.assertEqual(response.data['schema'], self.schema.model.pk)
        self.assertEqual(response.data['items'], [{
            'id': self.x1.pk,
            'type': 'basic',
            'value': {'1': 'Петя'},
            'stored_type': 'basic',
            'effective_type': 'ℬ(X1)',
            'type_diagnostic': None,
        }])
        self.assertFalse(AgentActionLog.objects.filter(action='model.set_value').exists())

    @decl_endpoint('/api/agents/models/{item}/details', method='get')
    def test_details_reports_current_types_after_schema_edit(self):
        ''' Compare stored types with the schema without migrating the bindings. '''
        s2 = self.schema.insert_last(alias='S2', definition_formal='ℬ(X1×X2)')
        d1 = self.schema.insert_last(alias='D1', definition_formal='S2')
        d2 = self.schema.insert_last(alias='D2', definition_formal='S2', typification_manual='ℬ(X2)')
        d3 = self.schema.insert_last(alias='D3', definition_formal='S99')
        s3 = self.schema.insert_last(alias='S3', definition_formal='ℬ(S2)')
        bindings = [
            (d2, 'ℬ(X2)', [1]),
            (s2, 'ℬ(X1×X1)', [[1, 2]]),
            (d1, 'ℬ(X1×X2)', [[1, 2]]),
            (d3, 'INVALID', []),
            (s3, 'shape:ℬ(*×*)', [[1, 2]]),
        ]
        for cst, stored_type, value in bindings:
            ConstituentData.objects.create(
                model=self.model.model, constituent=cst, type=stored_type, data=value,
            )

        response = self.executeOK(item=self.model_id)
        items = {item['id']: item for item in response.data['items']}
        self.assertEqual(items[s2.pk], {
            'id': s2.pk,
            'type': 'ℬ(X1×X1)',
            'value': [[1, 2]],
            'stored_type': 'ℬ(X1×X1)',
            'effective_type': 'ℬ(X1×X2)',
            'type_diagnostic': 'normalized_stored_type',
        })
        self.assertEqual(items[d1.pk]['effective_type'], 'ℬ(X1×X2)')
        self.assertIsNone(items[d1.pk]['type_diagnostic'])
        self.assertEqual(items[d2.pk]['effective_type'], 'ℬ(X2)')
        self.assertIsNone(items[d2.pk]['type_diagnostic'])
        self.assertIsNone(items[d3.pk]['effective_type'])
        self.assertEqual(items[d3.pk]['type_diagnostic'], 'effective_type_unavailable')
        self.assertEqual(items[s3.pk]['effective_type'], 'ℬ(X1×X2)')
        self.assertIsNone(items[s3.pk]['type_diagnostic'])

        s2.definition_formal = 'ℬ(X2)'
        s2.save(update_fields=['definition_formal'])
        updated = self.executeOK(item=self.model_id)
        items = {item['id']: item for item in updated.data['items']}
        self.assertEqual(items[s2.pk]['effective_type'], 'ℬ(X2)')
        self.assertEqual(items[s2.pk]['type_diagnostic'], 'stored_type_mismatch')
        self.assertEqual(items[d1.pk]['effective_type'], 'ℬ(X2)')
        self.assertEqual(items[d1.pk]['type_diagnostic'], 'stored_type_mismatch')
        self.assertEqual(items[s3.pk]['stored_type'], 'shape:ℬ(*×*)')
        self.assertEqual(items[s3.pk]['type_diagnostic'], 'stored_type_mismatch')
        self.assertEqual(updated.data['time_update'], response.data['time_update'])
        self.assertCountEqual(
            ConstituentData.objects.filter(model=self.model.model).values_list('constituent_id', 'type', 'data'),
            [(cst.pk, stored_type, value) for cst, stored_type, value in bindings],
        )

    @decl_endpoint('/api/agents/models/{item}/details', method='get')
    def test_public_model_does_not_expose_private_schema_types(self):
        ''' The existing binding stays readable without exposing the live schema. '''
        self.schema.model.access_policy = AccessPolicy.PRIVATE
        self.schema.model.save(update_fields=['access_policy'])
        self._bind(self.x1, {'1': 'a'})
        self.client.credentials()

        response = self.executeOK(item=self.model_id)
        self.assertEqual(response.data['items'], [{
            'id': self.x1.pk,
            'type': 'basic',
            'value': {'1': 'a'},
            'stored_type': 'basic',
            'effective_type': None,
            'type_diagnostic': 'effective_type_unavailable',
        }])

    @decl_endpoint('/api/agents/models/{item}/details', method='get')
    def test_private_details_forbidden_and_public_details_anonymous(self):
        ''' Private data stays protected; public models need no key. '''
        self.executeForbidden(item=self.private.pk)
        self.client.credentials()
        self.client.force_authenticate(user=None)
        self.executeOK(item=self.model_id)

    @decl_endpoint('/api/agents/models/{item}/details', method='get')
    def test_details_rejects_schema_id(self):
        ''' A conceptual schema id is not a model id. '''
        self.executeNotFound(item=self.schema.model.pk)

    @decl_endpoint('/api/agents/models/{item}/set-value', method='post')
    def test_set_value_upserts_and_logs(self):
        ''' A second write replaces the binding and both calls are logged. '''
        payload = [{
            'target': self.x1.pk,
            'type': 'basic',
            'data': {'1': 'Петя', '2': 'Вася'},
        }]
        response = self.executeOK(item=self.model_id, data=payload)
        self.assertEqual(response.data['items'], [{
            'id': self.x1.pk,
            'type': 'basic',
            'value': {'1': 'Петя', '2': 'Вася'},
        }])
        stored = ConstituentData.objects.get(model=self.model.model, constituent=self.x1)
        self.assertEqual(stored.data, {'1': 'Петя', '2': 'Вася'})

        updated = self.executeOK(item=self.model_id, data=[{
            'target': self.x1.pk,
            'type': 'basic',
            'data': {'1': 'Коля'},
        }])
        self.assertEqual(updated.data['items'][0]['value'], {'1': 'Коля'})
        logged = AgentActionLog.objects.filter(action='model.set_value', item_id=self.model_id)
        self.assertEqual(logged.count(), 2)
        self.assertEqual(logged.first().status_code, status.HTTP_200_OK)

    @decl_endpoint('/api/agents/models/{item}/set-value', method='post')
    def test_set_value_rejects_foreign_constituent_and_logs(self):
        ''' A constituent from another schema is rejected and nothing is stored. '''
        other = RSForm.create(title='Other', alias='O1', owner=self.user)
        foreign = other.insert_last(alias='X9')
        self.executeBadData(item=self.model_id, data=[{
            'target': foreign.pk,
            'type': 'basic',
            'data': {'1': 'нет'},
        }])
        self.assertFalse(ConstituentData.objects.filter(model=self.model.model).exists())
        logged = AgentActionLog.objects.get(action='model.set_value')
        self.assertEqual(logged.status_code, status.HTTP_400_BAD_REQUEST)

    @decl_endpoint('/api/agents/models/{item}/set-value', method='post')
    def test_set_value_rejects_null_schema(self):
        ''' A model that is not linked to a schema cannot take values. '''
        bare = LibraryItem.objects.create(
            item_type='rsmodel',
            title='Bare',
            alias='BARE',
            owner=self.user,
        )
        RSModel.objects.create(model=bare, schema=None)
        self.executeBadData(item=bare.pk, data=[{
            'target': self.x1.pk,
            'type': 'basic',
            'data': {'1': 'нет'},
        }])

    @decl_endpoint('/api/agents/models/{item}/set-value', method='post')
    def test_set_value_access(self):
        ''' A public model is not editable, a shared one is, and read-only is not. '''
        public = RSModel.create(
            self.schema.model,
            title='Public',
            alias='PUB',
            owner=self.user2,
            access_policy=AccessPolicy.PUBLIC,
        )
        payload = [{
            'target': self.x1.pk,
            'type': 'basic',
            'data': {'1': 'чужая'},
        }]
        self.executeForbidden(item=public.pk, data=payload)

        protected = RSModel.create(
            self.schema.model,
            title='Shared',
            alias='SHR',
            owner=self.user2,
            access_policy=AccessPolicy.PROTECTED,
        )
        Editor.add(protected.model.pk, self.user.pk)
        response = self.executeOK(item=protected.pk, data=payload)
        self.assertEqual(response.data['items'][0]['value'], {'1': 'чужая'})

        self.model.model.read_only = True
        self.model.model.save(update_fields=['read_only'])
        self.executeForbidden(item=self.model_id, data=payload)

    @decl_endpoint('/api/agents/models/{item}/set-value', method='post')
    def test_set_value_rejects_stale_concurrency_token(self):
        ''' A stale update time leaves the previous value in place. '''
        self.model.model.refresh_from_db()
        stale = self.model.model.time_update.isoformat().replace('+00:00', 'Z')
        first = self.executeOK(item=self.model_id, data=[{
            'target': self.x1.pk,
            'type': 'basic',
            'data': {'1': 'a'},
        }])
        self.executeConflict(
            item=self.model_id,
            data=[{
                'target': self.x1.pk,
                'type': 'basic',
                'data': {'1': 'b'},
            }],
            headers={EXPECTED_TIME_UPDATE_HEADER: stale},
        )
        stored = ConstituentData.objects.get(model=self.model.model, constituent=self.x1)
        self.assertEqual(stored.data, {'1': 'a'})
        second = self.executeOK(
            item=self.model_id,
            data=[{
                'target': self.x1.pk,
                'type': 'basic',
                'data': {'1': 'c'},
            }],
            headers={EXPECTED_TIME_UPDATE_HEADER: first.data['time_update']},
        )
        self.assertEqual(second.data['items'][0]['value'], {'1': 'c'})
        self.assertTrue(
            AgentActionLog.objects.filter(
                action='model.set_value',
                status_code=status.HTTP_409_CONFLICT,
            ).exists()
        )

    @decl_endpoint('/api/agents/models/{item}/clear-values', method='post')
    def test_clear_values_keeps_the_rest(self):
        ''' Clearing one constituent leaves the other bindings. '''
        self._bind(self.x1, {'v': 1})
        self._bind(self.x2, {'v': 2})
        response = self.executeOK(item=self.model_id, data={'items': [self.x1.pk]})
        self.assertEqual(len(response.data['items']), 1)
        self.assertEqual(response.data['items'][0]['id'], self.x2.pk)
        self.assertTrue(
            AgentActionLog.objects.filter(action='model.clear_values', item_alias='M1').exists()
        )

    @decl_endpoint('/api/agents/models/{item}/reset-all', method='post')
    def test_reset_all(self):
        ''' Reset removes every binding, and a schema id is not a model. '''
        self._bind(self.x1, {'v': 1})
        self._bind(self.x2, {'v': 2})
        response = self.executeOK(item=self.model_id)
        self.assertEqual(response.data['items'], [])
        self.assertFalse(ConstituentData.objects.filter(model=self.model.model).exists())
        self.assertTrue(
            AgentActionLog.objects.filter(action='model.reset_all', status_code=200).exists()
        )
        self.executeNotFound(item=self.schema.model.pk)
