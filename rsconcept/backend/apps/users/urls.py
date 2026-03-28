''' Routing: User profile and Authorization. '''
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
    # django_rest_passwordreset APIs see https://pypi.org/project/django-rest-passwordreset/
    path('api/password-reset', views.PasswordResetRequestAPIView.as_view(), name='reset-password-request'),
    path('api/password-reset/validate', views.PasswordResetValidateAPIView.as_view(), name='reset-password-validate'),
    path('api/password-reset/confirm', views.PasswordResetConfirmAPIView.as_view(), name='reset-password-confirm')
]
