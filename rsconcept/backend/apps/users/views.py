''' REST API: User profile and Authorization. '''
from django.contrib.auth import login, logout
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import generics, permissions
from rest_framework import status as c
from rest_framework import views
from rest_framework.response import Response

from . import models as m
from . import serializers as s


class LoginAPIView(views.APIView):
    ''' Endpoint: Login via username + password. '''
    permission_classes = (permissions.AllowAny,)

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
    serializer_class = s.UserSerializer

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
        serializer = s.ChangePasswordSerializer(data=request.data)
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
