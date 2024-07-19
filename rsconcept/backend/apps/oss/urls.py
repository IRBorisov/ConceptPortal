''' Routing: Operation Schema. '''
from django.urls import include, path
from rest_framework import routers

from . import views

library_router = routers.SimpleRouter(trailing_slash=False)
library_router.register('oss', views.OssViewSet, 'OSS')

urlpatterns = [
    path('', include(library_router.urls)),
]
