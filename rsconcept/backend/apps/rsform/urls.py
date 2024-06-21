''' Routing: RSForms for conceptual schemas. '''
from django.urls import include, path
from rest_framework import routers

from . import views

library_router = routers.SimpleRouter(trailing_slash=False)
library_router.register('library', views.LibraryViewSet, 'Library')
library_router.register('rsforms', views.RSFormViewSet, 'RSForm')
library_router.register('versions', views.VersionViewset, 'Version')

urlpatterns = [
    path('library/active', views.LibraryActiveView.as_view()),
    path('library/all', views.LibraryAdminView.as_view()),
    path('library/templates', views.LibraryTemplatesView.as_view(), name='templates'),
    path('constituents/<int:pk>', views.ConstituentAPIView.as_view(), name='constituenta-detail'),
    path('rsforms/import-trs', views.TrsImportView.as_view()),
    path('rsforms/create-detailed', views.create_rsform),

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
    path('synthesis/run_single', views.run_synthesis_view),
    path('synthesis/run_all', views.run_sythesis_graph_view),
    path('synthesis/save', views.save_synthesis_graph),
    path('synthesis/<int:pk_item>', views.get_synthesis_graph),
    path('', include(library_router.urls)),
]
