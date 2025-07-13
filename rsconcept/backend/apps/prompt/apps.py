''' Application: Prompts for AI helper. '''
from django.apps import AppConfig


class PromptConfig(AppConfig):
    ''' Application config. '''
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.prompt'
