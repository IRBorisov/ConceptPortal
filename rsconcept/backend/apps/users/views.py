''' REST API: User profile and Authentification. '''
from django.contrib.auth import login, logout

from rest_framework import status, permissions, views, generics
from rest_framework.response import Response

from . import serializers
from . import models

class LoginAPIView(views.APIView):
    '''
    Endpoint: Login user via username + password.
    '''
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


class LogoutAPIView(views.APIView):
    '''
    Endpoint: Logout current user.
    '''
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
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
    Endpoint: Get list of active users.
    '''
    permission_classes = (permissions.AllowAny,)
    serializer_class = serializers.UserSerializer

    def get_queryset(self):
        return models.User.objects.filter(is_active=True)


class UserProfileAPIView(generics.RetrieveUpdateAPIView):
    '''
    Endpoint: User profile info.
    '''
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = serializers.UserSerializer

    def get_object(self):
        return self.request.user


class UpdatePassword(views.APIView):
    '''
    Endpoint: Change password for current user.
    '''
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
