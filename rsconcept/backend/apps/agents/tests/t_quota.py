''' Quotas: shared budget, audit bounds, last-used write throttle. '''
from unittest.mock import patch

from django.core.cache import cache
from django.db import connection
from django.test.utils import CaptureQueriesContext
from rest_framework import status

from apps.agents.models import AgentActionLog, ApiKey
from apps.rsform.models import Constituenta, CstType, RSForm
from shared.EndpointTester import EndpointTester


class TestAgentQuota(EndpointTester):
    ''' API keys must not be able to flood schema tables or the action log. '''

    def setUp(self):
        super().setUp()
        cache.clear()
        self.owned = RSForm.create(title='Owned', alias='OWN', owner=self.user)
        self.owned_id = self.owned.model.pk
        _key, self.secret = ApiKey.create_for_user(self.user, 'Quota')
        self.client.force_authenticate(user=None)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.secret}')

    def _create_cst(self, alias: str):
        return self.client.post(
            f'/api/agents/rsforms/{self.owned_id}/constituents',
            {'alias': alias, 'cst_type': CstType.BASE, 'term_raw': alias},
            format='json',
        )

    def test_write_quota_stops_further_mutations_without_extra_log_rows(self):
        with (
            patch('apps.agents.services.quota.WRITE_PER_MINUTE', 2),
            patch('apps.agents.services.quota.WRITE_PER_HOUR', 100),
        ):
            self.assertEqual(self._create_cst('X1').status_code, status.HTTP_201_CREATED)
            self.assertEqual(self._create_cst('X2').status_code, status.HTTP_201_CREATED)
            denied = self._create_cst('X3')

        self.assertEqual(denied.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        self.assertEqual(AgentActionLog.objects.filter(action='rsform.create_cst').count(), 2)
        self.assertFalse(Constituenta.objects.filter(schema_id=self.owned_id, alias='X3').exists())

    def test_keys_of_one_user_share_the_write_budget(self):
        _key2, secret2 = ApiKey.create_for_user(self.user, 'Second')
        with patch('apps.agents.services.quota.WRITE_PER_MINUTE', 1):
            self.assertEqual(self._create_cst('X1').status_code, status.HTTP_201_CREATED)
            self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {secret2}')
            denied = self._create_cst('X2')

        self.assertEqual(denied.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        self.assertFalse(Constituenta.objects.filter(schema_id=self.owned_id, alias='X2').exists())

    def test_schema_create_has_a_tighter_hourly_cap(self):
        with (
            patch('apps.agents.services.quota.HEAVY_PER_HOUR', 1),
            patch('apps.agents.services.quota.WRITE_PER_MINUTE', 50),
            patch('apps.agents.services.quota.WRITE_PER_HOUR', 50),
        ):
            created = self.client.post(
                '/api/agents/rsforms',
                {'title': 'First', 'alias': 'A1'},
                format='json',
            )
            denied = self.client.post(
                '/api/agents/rsforms',
                {'title': 'Second', 'alias': 'A2'},
                format='json',
            )

        self.assertEqual(created.status_code, status.HTTP_201_CREATED)
        self.assertEqual(denied.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        self.assertEqual(AgentActionLog.objects.filter(action='rsform.create').count(), 1)

    def test_invalid_mutation_is_logged_and_counts_toward_the_quota(self):
        with patch('apps.agents.services.quota.WRITE_PER_MINUTE', 1):
            invalid = self._create_cst_raw({})
            denied = self._create_cst('X1')

        self.assertEqual(invalid.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(denied.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        self.assertTrue(
            AgentActionLog.objects.filter(action='rsform.create_cst', status_code=400).exists()
        )

    def test_reads_are_capped_and_do_not_fill_the_action_log(self):
        with patch('apps.agents.services.quota.READ_PER_MINUTE', 2):
            first = self.client.get(f'/api/agents/rsforms/{self.owned_id}/details')
            second = self.client.get(f'/api/agents/rsforms/{self.owned_id}/details')
            denied = self.client.get(f'/api/agents/rsforms/{self.owned_id}/details')

        self.assertEqual(first.status_code, status.HTTP_200_OK)
        self.assertEqual(second.status_code, status.HTTP_200_OK)
        self.assertEqual(denied.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        self.assertEqual(AgentActionLog.objects.count(), 0)

    def test_last_used_is_not_rewritten_on_every_call(self):
        self.client.get(f'/api/agents/rsforms/{self.owned_id}/details')
        key = ApiKey.objects.get(owner=self.user)
        key.refresh_from_db()
        stamped = key.last_used_at
        self.assertIsNotNone(stamped)

        with CaptureQueriesContext(connection) as ctx:
            self.client.get(f'/api/agents/rsforms/{self.owned_id}/details')
        updates = [
            query for query in ctx.captured_queries
            if 'UPDATE' in query['sql'] and 'agents_apikey' in query['sql']
        ]
        self.assertEqual(updates, [])
        key.refresh_from_db()
        self.assertEqual(key.last_used_at, stamped)

    def _create_cst_raw(self, payload: dict):
        return self.client.post(
            f'/api/agents/rsforms/{self.owned_id}/constituents',
            payload,
            format='json',
        )
