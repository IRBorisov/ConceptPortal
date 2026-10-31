''' Application: User profile and Authorization. '''
from django.apps import AppConfig


class UsersConfig(AppConfig):
    ''' Application config. '''
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.users'

    def ready(self):
        from django.contrib.auth import get_user_model  # pylint: disable=import-outside-toplevel

        from apps.users.validators import forbid_at_in_username  # pylint: disable=import-outside-toplevel

        username = get_user_model()._meta.get_field('username')  # pylint: disable=protected-access
        if forbid_at_in_username not in username.validators:
            username.validators.append(forbid_at_in_username)
        import apps.users.signals  # pylint: disable=unused-import,import-outside-toplevel
