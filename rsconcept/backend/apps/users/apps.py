''' Application: User profile and Authorization. '''
from django.apps import AppConfig


class UsersConfig(AppConfig):
    ''' Application config. '''
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.users'

    def ready(self):
        import apps.users.signals # pylint: disable=unused-import,import-outside-toplevel
