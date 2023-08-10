from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from . import models


class LoginSerializer(serializers.Serializer):
    ''' User authentification by login/password. '''
    username = serializers.CharField(
        label='Имя пользователя',
        write_only=True
    )
    password = serializers.CharField(
        label='Пароль',
        style={'input_type': 'password'},
        trim_whitespace=False,
        write_only=True
    )

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        user = authenticate(
            request=self.context.get('request'),
            username=username,
            password=password
        )
        if not user:
            msg = 'Неправильное сочетание имени пользователя и пароля.'
            raise serializers.ValidationError(msg, code='authorization')
        attrs['user'] = user
        return attrs


class AuthSerializer(serializers.ModelSerializer):
    ''' Authentication data serializaer '''
    class Meta:
        model = models.User
        fields = [
            'id',
            'username',
            'is_staff'
        ]


class UserInfoSerializer(serializers.ModelSerializer):
    ''' User data serializaer '''
    class Meta:
        model = models.User
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
        ]


class UserSerializer(serializers.ModelSerializer):
    ''' User data serializaer '''
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = models.User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
        ]

class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for password change endpoint.
    """
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    # def validate(self, attrs):
    #     if attrs['new_password'] != "123":
    #         raise serializers.ValidationError({"password": r"Пароль не '123'"})
    #     return attrs

class SignupSerializer(serializers.ModelSerializer):
    ''' User profile create '''
    id = serializers.IntegerField(read_only=True)
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = models.User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'password',
            'password2'
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Введенные пароли не совпадают"})
        return attrs

    def create(self, validated_data):
        user = models.User.objects.create_user(
            validated_data['username'],  validated_data['email'],  validated_data['password']
        )
        user.first_name = validated_data['first_name']
        user.last_name = validated_data['last_name']
        user.save()
        return user
