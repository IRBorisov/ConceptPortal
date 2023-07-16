''' Main URL router '''
from rest_framework.documentation import include_docs_urls
from django.contrib import admin
from django.shortcuts import redirect
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', lambda request: redirect('docs/', permanent=True)),
    path('docs/', include_docs_urls(title='ConceptPortal API'),
         name='docs'),
    path('api/', include('apps.rsform.urls')),
    path('users/', include('apps.users.urls')),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
