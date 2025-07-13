''' Main URL router '''
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from django.views.generic.base import TemplateView
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

urlpatterns = [
    path('admin', admin.site.urls),
    path('api/', include('apps.library.urls')),
    path('api/', include('apps.rsform.urls')),
    path('api/', include('apps.oss.urls')),
    path('api/', include('apps.prompt.urls')),
    path('users/', include('apps.users.urls')),
    path('schema', SpectacularAPIView.as_view(), name='schema'),
    path('redoc', SpectacularRedocView.as_view()),
    path(
        'robots.txt',
        TemplateView.as_view(template_name='robots.txt', content_type='text/plain'),
    ),
    path('', SpectacularSwaggerView.as_view(), name='home'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
