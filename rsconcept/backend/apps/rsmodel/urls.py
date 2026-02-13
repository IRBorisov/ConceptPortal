''' Routing: RSModel. '''
from django.urls import include, path
from rest_framework import routers

from . import views

router = routers.SimpleRouter(trailing_slash=False)
router.register('models', views.RSModelViewSet, 'RSModel')

urlpatterns = [
    path('', include(router.urls)),
]
