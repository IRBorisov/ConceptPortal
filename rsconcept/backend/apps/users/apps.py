''' Application: User profile and Authentification. '''
from django.apps import AppConfig


class UsersConfig(AppConfig):
    ''' Application config. '''
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.users'
