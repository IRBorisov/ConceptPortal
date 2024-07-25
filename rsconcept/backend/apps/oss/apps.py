''' Application: Operation Schema. '''
from django.apps import AppConfig


class OssConfig(AppConfig):
    ''' Application config. '''
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.oss'
