''' Routing: RSForms for conceptual schemas. '''
from django.urls import path, include
from rest_framework import routers
from . import views

library_router = routers.SimpleRouter()
library_router.register('library', views.LibraryViewSet)
library_router.register('rsforms', views.RSFormViewSet)

urlpatterns = [
    path('library/active/', views.LibraryActiveView.as_view(), name='library'),
    path('constituents/<int:pk>/', views.ConstituentAPIView.as_view(), name='constituenta-detail'),
    path('rsforms/import-trs/', views.TrsImportView.as_view()),
    path('rsforms/create-detailed/', views.create_rsform),
    path('func/parse-expression/', views.parse_expression),
    path('func/to-ascii/', views.convert_to_ascii),
    path('func/to-math/', views.convert_to_math),
    path('', include(library_router.urls)),
]
