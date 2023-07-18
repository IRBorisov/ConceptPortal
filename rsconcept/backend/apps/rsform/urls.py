''' Routing for rsform api '''
from django.urls import path, include
from rest_framework import routers
from . import views

rsform_router = routers.SimpleRouter()
rsform_router.register(r'rsforms', views.RSFormViewSet)

urlpatterns = [
    path('constituents/<int:pk>/', views.ConstituentAPIView.as_view()),
    path('rsforms/import-trs/', views.TrsImportView.as_view()),
    path('rsforms/create-detailed/', views.create_rsform),
    path('func/parse-expression/', views.parse_expression),
    path('func/to-ascii/', views.convert_to_ascii),
    path('func/to-math/', views.convert_to_math),
    path('', include(rsform_router.urls)),
]
