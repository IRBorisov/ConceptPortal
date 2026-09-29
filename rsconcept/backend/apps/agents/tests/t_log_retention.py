''' Agent log retention, cleanup interval, and stored request text. '''
from datetime import timedelta

from django.core.management import call_command
from django.test.utils import override_settings
from django.utils import timezone

from apps.agents.models import AgentActionLog, AgentLogCleanup, ApiKey
from apps.agents.services.audit import log_agent_action, request_text_from_request
from apps.agents.services.retention import maybe_prune_agent_logs
from apps.rsform.models import CstType, RSForm
from shared.EndpointTester import EndpointTester


class _Body:
    def __init__(self, data):
        self.data = data


class TestAgentLogRetention(EndpointTester):
    ''' Rows older than the retention window are deleted, and not more often than the interval. '''

    def _row(self, action: str, days_ago: int) -> AgentActionLog:
        row = AgentActionLog.objects.create(user=self.user, action=action, summary='row')
        row.created_at = timezone.now() - timedelta(days=days_ago)
        row.save(update_fields=['created_at'])
        return row

    @override_settings(AGENT_LOG_RETENTION_DAYS=30, AGENT_LOG_CLEANUP_INTERVAL_DAYS=7)
    def test_prune_drops_rows_older_than_retention(self):
        fresh = self._row('rsform.create', 1)
        expired = self._row('rsform.replace', 40)
        deleted = maybe_prune_agent_logs()
        self.assertEqual(deleted, 1)
        self.assertTrue(AgentActionLog.objects.filter(pk=fresh.pk).exists())
        self.assertFalse(AgentActionLog.objects.filter(pk=expired.pk).exists())

    @override_settings(AGENT_LOG_RETENTION_DAYS=30, AGENT_LOG_CLEANUP_INTERVAL_DAYS=7)
    def test_cleanup_waits_for_the_interval(self):
        self._row('rsform.create', 40)
        self.assertEqual(maybe_prune_agent_logs(), 1)
        kept = self._row('rsform.replace', 40)
        self.assertEqual(maybe_prune_agent_logs(), 0)
        self.assertTrue(AgentActionLog.objects.filter(pk=kept.pk).exists())

        state = AgentLogCleanup.objects.get(pk=1)
        state.last_run_at = timezone.now() - timedelta(days=8)
        state.save(update_fields=['last_run_at'])
        self.assertEqual(maybe_prune_agent_logs(), 1)
        self.assertFalse(AgentActionLog.objects.filter(pk=kept.pk).exists())

    @override_settings(AGENT_LOG_RETENTION_DAYS=30)
    def test_management_command_deletes_expired_rows(self):
        self._row('rsform.create', 40)
        call_command('prune_agent_logs')
        self.assertEqual(AgentActionLog.objects.count(), 0)
        self.assertIsNotNone(AgentLogCleanup.objects.get(pk=1).last_run_at)

    @override_settings(AGENT_LOG_REQUEST_MAX_LENGTH=12)
    def test_request_text_is_cut_to_the_configured_length(self):
        text = request_text_from_request(_Body({'alias': 'X1', 'blob': 'a' * 100}))
        self.assertEqual(len(text), 12)

    def test_logged_mutation_keeps_the_request_body(self):
        owned = RSForm.create(title='Owned', alias='OWN', owner=self.user)
        _key, secret = ApiKey.create_for_user(self.user, 'LogBody')
        self.client.force_authenticate(user=None)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {secret}')
        response = self.client.post(
            f'/api/agents/rsforms/{owned.model.pk}/constituents',
            {'alias': 'X1', 'cst_type': CstType.BASE, 'term_raw': 'вещь'},
            format='json',
        )
        self.assertEqual(response.status_code, 201)
        row = AgentActionLog.objects.get(action='rsform.create_cst')
        self.assertIn('X1', row.request_text)
        self.assertIn('вещь', row.request_text)
        self.assertNotIn(secret, row.request_text)

    def test_log_helper_stores_request_text(self):
        row = log_agent_action(
            user=self.user,
            api_key=None,
            action='rsform.update_cst',
            status_code=200,
            request=_Body({'target': 3}),
        )
        self.assertEqual(row.request_text, '{"target":3}')
