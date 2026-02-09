''' Routing: RSForms for conceptual schemas. '''
from django.urls import include, path
from rest_framework import routers

from . import views

library_router = routers.SimpleRouter(trailing_slash=False)
library_router.register('rsforms', views.RSFormViewSet, 'RSForm')


urlpatterns = [
    path('rsforms/import-trs', views.TrsImportView.as_view()),
    path('rsforms/create-detailed', views.create_rsform),
    path('rsforms/inline-synthesis', views.inline_synthesis),

    path('cctext/inflect', views.inflect),
    path('cctext/generate-lexeme', views.generate_lexeme),
    path('cctext/parse', views.parse_text),

    path('', include(library_router.urls)),
]
