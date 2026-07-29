''' Application: Agent API keys and agent-facing routes. '''
from django.apps import AppConfig


class AgentsConfig(AppConfig):
    ''' Application config. '''
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.agents'
    verbose_name = 'Agents'
