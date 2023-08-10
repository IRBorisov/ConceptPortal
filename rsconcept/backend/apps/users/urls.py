''' Routing for users management '''
from django.urls import path
from . import views


urlpatterns = [
    path('api/auth', views.AuthAPIView.as_view()),
    path('api/active-users', views.ActiveUsersView.as_view()),
    path('api/profile', views.UserProfileAPIView.as_view()),
    path('api/signup', views.SignupAPIView.as_view()),
    path('api/login', views.LoginAPIView.as_view()),
    path('api/logout', views.LogoutAPIView.as_view()),
    path('api/change-password', views.UpdatePassword.as_view()),
]
