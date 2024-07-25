''' Routing: Operation Schema. '''
from django.urls import include, path
from rest_framework import routers

from . import views

library_router = routers.SimpleRouter(trailing_slash=False)
library_router.register('library', views.LibraryViewSet, 'Library')
library_router.register('versions', views.VersionViewset, 'Version')

urlpatterns = [
    path('library/active', views.LibraryActiveView.as_view()),
    path('library/all', views.LibraryAdminView.as_view()),
    path('library/templates', views.LibraryTemplatesView.as_view(), name='templates'),
    path('library/<int:pk_item>/create-version', views.create_version),
    path('library/<int:pk_item>/versions/<int:pk_version>', views.retrieve_version),

    path('versions/<int:pk>/export-file', views.export_file),

    path('', include(library_router.urls)),
]
