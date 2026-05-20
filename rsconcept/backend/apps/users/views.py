''' REST API: User profile and Authorization. '''
from datetime import timedelta

from django.conf import settings
from django.contrib.auth import login, logout
from django.contrib.auth.password_validation import get_password_validators, validate_password
from django.core.exceptions import ValidationError
from django.db import transaction
from django.http import Http404
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django_rest_passwordreset.models import ResetPasswordToken, get_password_reset_token_expiry_time
from django_rest_passwordreset.serializers import PasswordTokenSerializer
from django_rest_passwordreset.signals import post_password_reset, pre_password_reset
from django_rest_passwordreset.views import ResetPasswordRequestToken  # type: ignore
from django_rest_passwordreset.views import ResetPasswordValidateToken  # type: ignore
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import exceptions, generics, permissions
from rest_framework import status as c
from rest_framework import views
from rest_framework.response import Response

from shared.throttling import LoginRateThrottle, PasswordResetRateThrottle, SignupRateThrottle

from . import models as m
from . import serializers as s


class LoginAPIView(views.APIView):
    ''' Endpoint: Login via username + password. '''
    permission_classes = (permissions.AllowAny,)
    throttle_classes = (LoginRateThrottle,)

    @extend_schema(
        summary='login user',
        tags=['Auth'],
        request=s.LoginSerializer,
        responses={
            c.HTTP_202_ACCEPTED: None,
            c.HTTP_400_BAD_REQUEST: s.NonFieldErrorSerializer
        }
    )
    def post(self, request):
        serializer = s.LoginSerializer(
            data=self.request.data,
            context={'request': self.request}
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        login(request, user)
        return Response(None, status=c.HTTP_202_ACCEPTED)


class LogoutAPIView(views.APIView):
    ''' Endpoint: Logout. '''
    permission_classes = (permissions.IsAuthenticated,)

    @extend_schema(
        summary='logout current user',
        tags=['Auth'],
        request=None,
        responses={c.HTTP_204_NO_CONTENT: None}
    )
    def post(self, request):
        logout(request)
        return Response(None, status=c.HTTP_204_NO_CONTENT)


@extend_schema(tags=['User'])
@extend_schema_view()
class SignupAPIView(generics.CreateAPIView):
    ''' Endpoint: Register user. '''
    permission_classes = (permissions.AllowAny, )
    throttle_classes = (SignupRateThrottle,)
    serializer_class = s.SignupSerializer


@extend_schema(tags=['Auth'])
@extend_schema_view()
class AuthAPIView(generics.RetrieveAPIView):
    ''' Endpoint: Current user info. '''
    permission_classes = (permissions.AllowAny,)
    serializer_class = s.AuthSerializer

    def get_object(self):
        return self.request.user


@extend_schema(tags=['User'])
@extend_schema_view()
class ActiveUsersView(generics.ListAPIView):
    ''' Endpoint: Get list of active users. '''
    permission_classes = (permissions.AllowAny,)
    serializer_class = s.UserInfoSerializer

    def get_queryset(self):
        return m.User.objects.filter(is_active=True)


@extend_schema(tags=['User'])
@extend_schema_view()
class UserProfileAPIView(generics.RetrieveUpdateAPIView):
    ''' Endpoint: User profile. '''
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = s.UserSerializer

    def get_object(self):
        return self.request.user


class UpdatePassword(views.APIView):
    ''' Endpoint: Change password for current user. '''
    permission_classes = (permissions.IsAuthenticated, )

    def get_object(self, queryset=None):
        return self.request.user

    @extend_schema(
        description='change current user password',
        tags=['Auth'],
        request=s.ChangePasswordSerializer,
        responses={
            c.HTTP_204_NO_CONTENT: None,
            c.HTTP_400_BAD_REQUEST: None
        }
    )
    def patch(self, request, *args, **kwargs):
        self.object = self.get_object()
        serializer = s.ChangePasswordSerializer(data=request.data, context={'user': self.object})
        if serializer.is_valid():
            old_password = serializer.data.get("old_password")
            if not self.object.check_password(old_password):
                return Response(
                    {"old_password": ["Wrong password."]},
                    status=c.HTTP_400_BAD_REQUEST
                )
            # Note: set_password also hashes the password that the user will get
            self.object.set_password(serializer.data.get("new_password"))
            self.object.save()
            return Response(status=c.HTTP_204_NO_CONTENT)
        return Response(serializer.errors, status=c.HTTP_400_BAD_REQUEST)


class PasswordResetRequestAPIView(ResetPasswordRequestToken):
    ''' Throttled password reset request endpoint. '''
    throttle_classes = (PasswordResetRateThrottle,)


class PasswordResetValidateAPIView(ResetPasswordValidateToken):
    ''' Throttled password reset token validation endpoint. '''
    throttle_classes = (PasswordResetRateThrottle,)


class PasswordResetConfirmAPIView(generics.GenericAPIView):
    '''
    Throttled password reset confirm endpoint.

    Base behaviour aligns with django-rest-passwordreset ResetPasswordConfirm, but confirms the
    token under ``select_for_update()`` so concurrent double-submits cannot both apply.
    '''

    throttle_classes = (PasswordResetRateThrottle,)
    permission_classes = ()
    serializer_class = PasswordTokenSerializer
    authentication_classes = ()

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        password = serializer.validated_data['password']
        token_key = serializer.validated_data['token']

        with transaction.atomic():
            reset_password_token = (
                ResetPasswordToken.objects.select_for_update().filter(key=token_key).first()
            )
            if not reset_password_token:
                raise Http404(_('The OTP password entered is not valid. Please check and try again.'))

            expiry_date = reset_password_token.created_at + timedelta(
                hours=get_password_reset_token_expiry_time()
            )

            if timezone.now() > expiry_date:
                reset_password_token.delete()
                raise Http404(_('The token has expired'))

            if reset_password_token.user.eligible_for_reset():
                pre_password_reset.send(
                    sender=self.__class__,
                    user=reset_password_token.user,
                    reset_password_token=reset_password_token,
                )
                try:
                    validate_password(
                        password,
                        user=reset_password_token.user,
                        password_validators=get_password_validators(settings.AUTH_PASSWORD_VALIDATORS),
                    )
                except ValidationError as errors:
                    raise exceptions.ValidationError({'password': errors.messages}) from errors

                reset_password_token.user.set_password(password)
                reset_password_token.user.save()

                post_password_reset.send(
                    sender=self.__class__,
                    user=reset_password_token.user,
                    reset_password_token=reset_password_token,
                )

            ResetPasswordToken.objects.filter(user=reset_password_token.user).delete()

        return Response({'status': 'OK'})
