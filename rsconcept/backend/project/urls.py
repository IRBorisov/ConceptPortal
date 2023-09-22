''' Main URL router '''
from django.contrib import admin
from django.shortcuts import redirect
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView


urlpatterns = [
    path('admin', admin.site.urls),
    path('api/', include('apps.rsform.urls')),
    path('users/', include('apps.users.urls')),
    path('docs/', SpectacularSwaggerView.as_view(), name='docs'),
    path('schema', SpectacularAPIView.as_view(), name='schema'),
    path('redoc', SpectacularRedocView.as_view()),
    path('', lambda: redirect('docs/', permanent=True)),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
