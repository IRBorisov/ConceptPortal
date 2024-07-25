''' Routing: Operation Schema. '''
from django.urls import include, path
from rest_framework import routers

from . import views

oss_router = routers.SimpleRouter(trailing_slash=False)
oss_router.register('oss', views.OssViewSet, 'OSS')

urlpatterns = [
    path('', include(oss_router.urls)),
]
