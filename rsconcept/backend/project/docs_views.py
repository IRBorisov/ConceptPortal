'''API docs views with safe HTTP method handling.'''
from drf_spectacular.views import SpectacularRedocView, SpectacularSwaggerView


class SafeSwaggerView(SpectacularSwaggerView):
    '''Swagger UI that rejects OPTIONS (avoids TemplateDoesNotExist on empty include).'''

    http_method_names = ['get', 'head']


class SafeRedocView(SpectacularRedocView):
    '''ReDoc UI that rejects OPTIONS (same TemplateHTMLRenderer pitfall as Swagger).'''

    http_method_names = ['get', 'head']
