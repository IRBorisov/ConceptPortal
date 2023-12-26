''' Serializers: User profile and Authorization. '''
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from apps.rsform.models import Subscription
from . import models


class NonFieldErrorSerializer(serializers.Serializer):
    ''' Serializer: list of non-field errors. '''
    non_field_errors = serializers.ListField(
        child=serializers.CharField()
    )


class LoginSerializer(serializers.Serializer):
    ''' Serializer: User authentication by login/password. '''
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

    def create(self, validated_data):
        raise NotImplementedError('unexpected `create()` call')

    def update(self, instance, validated_data):
        raise NotImplementedError('unexpected `update()` call')


class AuthSerializer(serializers.Serializer):
    ''' Serializer: Authorization data. '''
    id = serializers.IntegerField()
    username = serializers.CharField()
    is_staff = serializers.BooleanField()
    subscriptions = serializers.ListField(
        child=serializers.IntegerField()
    )

    def to_representation(self, instance: models.User) -> dict:
        if instance.is_anonymous:
            return {
                'id': None,
                'username': '',
                'is_staff': False,
                'subscriptions': []
            }
        else:
            return {
                'id': instance.pk,
                'username': instance.username,
                'is_staff': instance.is_staff,
                'subscriptions': [sub.item.pk for sub in Subscription.objects.filter(user=instance)]
            }


class UserInfoSerializer(serializers.ModelSerializer):
    ''' Serializer: User data. '''
    class Meta:
        ''' serializer metadata. '''
        model = models.User
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
        ]


class UserSerializer(serializers.ModelSerializer):
    ''' Serializer: User data. '''
    id = serializers.IntegerField(read_only=True)

    class Meta:
        ''' serializer metadata. '''
        model = models.User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
        ]


class ChangePasswordSerializer(serializers.Serializer):
    ''' Serializer: Change password. '''
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def create(self, validated_data):
        raise NotImplementedError('unexpected `create()` call')

    def update(self, instance, validated_data):
        raise NotImplementedError('unexpected `update()` call')


class SignupSerializer(serializers.ModelSerializer):
    ''' Serializer: Create user profile. '''
    id = serializers.IntegerField(read_only=True)
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        ''' serializer metadata. '''
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
