''' Routing: RSModel. '''
from django.urls import include, path
from rest_framework import routers

from . import views

router = routers.SimpleRouter(trailing_slash=False)
router.register('models', views.RSModelViewSet, 'RSModel')

urlpatterns = [
    path('models/create-from-sandbox', views.create_rsmodel_from_sandbox),
    path('', include(router.urls)),
]
