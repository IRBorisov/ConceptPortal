''' Routing: RSForms for conceptual schemas. '''
from django.urls import path, include
from rest_framework import routers
from . import views

library_router = routers.SimpleRouter(trailing_slash=False)
library_router.register('library', views.LibraryViewSet, 'Library')
library_router.register('rsforms', views.RSFormViewSet, 'RSForm')

urlpatterns = [
    path('library/active', views.LibraryActiveView.as_view(), name='library'),
    path('library/templates', views.LibraryTemplatesView.as_view(), name='templates'),
    path('constituents/<int:pk>', views.ConstituentAPIView.as_view(), name='constituenta-detail'),
    path('rsforms/import-trs', views.TrsImportView.as_view()),
    path('rsforms/create-detailed', views.create_rsform),

    path('versions/<int:pk>', views.VersionAPIView.as_view()),
    path('versions/<int:pk>/export-file', views.export_file),
    path('rsforms/<int:pk_item>/versions/create', views.create_version),
    path('rsforms/<int:pk_item>/versions/<int:pk_version>', views.retrieve_version),

    path('operations/inline-synthesis', views.inline_synthesis),

    path('rslang/parse-expression', views.parse_expression),
    path('rslang/to-ascii', views.convert_to_ascii),
    path('rslang/to-math', views.convert_to_math),

    path('cctext/inflect', views.inflect),
    path('cctext/generate-lexeme', views.generate_lexeme),
    path('cctext/parse', views.parse_text),

    path('', include(library_router.urls)),
]
