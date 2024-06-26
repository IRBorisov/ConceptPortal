''' Routing: User profile and Authorization. '''
from django.urls import path
from django_rest_passwordreset.views import reset_password_confirm  # type: ignore
from django_rest_passwordreset.views import reset_password_request_token  # type: ignore
from django_rest_passwordreset.views import reset_password_validate_token  # type: ignore

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
    path('api/password-reset', reset_password_request_token, name='reset-password-request'),
    path('api/password-reset/validate', reset_password_validate_token, name='reset-password-validate'),
    path('api/password-reset/confirm', reset_password_confirm, name='reset-password-confirm')
]
