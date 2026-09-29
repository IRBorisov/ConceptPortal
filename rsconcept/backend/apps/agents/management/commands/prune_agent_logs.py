''' Delete agent action logs older than AGENT_LOG_RETENTION_DAYS. '''
from django.core.management.base import BaseCommand

from apps.agents.services.retention import prune_agent_logs


class Command(BaseCommand):
    ''' Run agent log retention immediately, ignoring the weekly interval. '''
    help = 'Delete agent action logs older than AGENT_LOG_RETENTION_DAYS.'

    def handle(self, *args, **options):
        deleted = prune_agent_logs(force=True)
        self.stdout.write(f'Deleted {deleted} agent log rows.')
