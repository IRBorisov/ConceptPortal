''' REST API: User profile and Authentification. '''
from django.contrib.auth import login, logout

from rest_framework import status, permissions, views, generics
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, extend_schema_view

from . import serializers
from . import models


@extend_schema(tags=['Auth'])
@extend_schema_view()
class LoginAPIView(views.APIView):
    ''' Endpoint: Login via username + password. '''
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = serializers.LoginSerializer(
            data=self.request.data,
            context={'request': self.request}
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        login(request, user)
        return Response(None, status=status.HTTP_202_ACCEPTED)


@extend_schema(tags=['Auth'])
@extend_schema_view()
class LogoutAPIView(views.APIView):
    ''' Endpoint: Logout. '''
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        logout(request)
        return Response(None, status=status.HTTP_204_NO_CONTENT)


@extend_schema(tags=['User'])
@extend_schema_view()
class SignupAPIView(generics.CreateAPIView):
    ''' Endpoint: Register user. '''
    permission_classes = (permissions.AllowAny, )
    serializer_class = serializers.SignupSerializer


@extend_schema(tags=['Auth'])
@extend_schema_view()
class AuthAPIView(generics.RetrieveAPIView):
    ''' Endpoint: Current user info. '''
    permission_classes = (permissions.AllowAny,)
    serializer_class = serializers.AuthSerializer

    def get_object(self):
        return self.request.user


@extend_schema(tags=['User'])
@extend_schema_view()
class ActiveUsersView(generics.ListAPIView):
    ''' Endpoint: Get list of active users. '''
    permission_classes = (permissions.AllowAny,)
    serializer_class = serializers.UserSerializer

    def get_queryset(self):
        return models.User.objects.filter(is_active=True)


@extend_schema(tags=['User'])
@extend_schema_view()
class UserProfileAPIView(generics.RetrieveUpdateAPIView):
    ''' Endpoint: User profile. '''
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = serializers.UserSerializer

    def get_object(self):
        return self.request.user


@extend_schema(tags=['Auth'])
@extend_schema_view()
class UpdatePassword(views.APIView):
    ''' Endpoint: Change password for current user. '''
    permission_classes = (permissions.IsAuthenticated, )

    def get_object(self, queryset=None):
        return self.request.user

    def patch(self, request, *args, **kwargs):
        self.object = self.get_object()
        serializer = serializers.ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            old_password = serializer.data.get("old_password")
            if not self.object.check_password(old_password):
                return Response({"old_password": ["Wrong password."]},
                                status=status.HTTP_400_BAD_REQUEST)
            # Note: set_password also hashes the password that the user will get
            self.object.set_password(serializer.data.get("new_password"))
            self.object.save()
            return Response(status=status.HTTP_204_NO_CONTENT)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
