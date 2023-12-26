''' Application: User profile and Authorization. '''
from django.apps import AppConfig


class UsersConfig(AppConfig):
    ''' Application config. '''
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.users'
