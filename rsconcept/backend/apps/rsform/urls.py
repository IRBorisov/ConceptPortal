''' Routing: RSForms for conceptual schemas. '''
from django.urls import include, path
from rest_framework import routers

from . import views

library_router = routers.SimpleRouter(trailing_slash=False)
library_router.register('rsforms', views.RSFormViewSet, 'RSForm')


urlpatterns = [
    path('constituents/<int:pk>', views.ConstituentAPIView.as_view(), name='constituenta-detail'),
    path('rsforms/import-trs', views.TrsImportView.as_view()),
    path('rsforms/create-detailed', views.create_rsform),

    path('operations/inline-synthesis', views.inline_synthesis),

    path('rslang/parse-expression', views.parse_expression),
    path('rslang/to-ascii', views.convert_to_ascii),
    path('rslang/to-math', views.convert_to_math),

    path('cctext/inflect', views.inflect),
    path('cctext/generate-lexeme', views.generate_lexeme),
    path('cctext/parse', views.parse_text),

    path('', include(library_router.urls)),
]
