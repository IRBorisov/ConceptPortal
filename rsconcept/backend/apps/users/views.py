from django.contrib.auth import login, logout

from rest_framework import status, permissions, views, generics
from rest_framework.response import Response

from . import serializers
from . import models


class LoginAPIView(views.APIView):
    '''
    Login user via username + password.
    '''
    permission_classes = (permissions.AllowAny,)

    def post(self, request, format=None):
        serializer = serializers.LoginSerializer(
            data=self.request.data,
            context={'request': self.request}
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        login(request, user)
        return Response(None, status=status.HTTP_202_ACCEPTED)


class LogoutAPIView(views.APIView):
    '''
    Logout current user.
    '''
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, format=None):
        logout(request)
        return Response(None, status=status.HTTP_204_NO_CONTENT)


class SignupAPIView(generics.CreateAPIView):
    '''
    Register user.
    '''
    permission_classes = (permissions.AllowAny, )
    serializer_class = serializers.SignupSerializer


class AuthAPIView(generics.RetrieveAPIView):
    '''
    Get current user authentification ID.
    '''
    permission_classes = (permissions.AllowAny,)
    serializer_class = serializers.AuthSerializer

    def get_object(self):
        return self.request.user


class ActiveUsersView(generics.ListAPIView):
    '''
    Get list of active user.
    '''
    permission_classes = (permissions.AllowAny,)
    serializer_class = serializers.UserSerializer

    def get_queryset(self):
        return models.User.objects.filter(is_active=True)


class UserProfileAPIView(generics.RetrieveUpdateAPIView):
    '''
    User profile info.
    '''
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = serializers.UserSerializer

    def get_object(self):
        return self.request.user
