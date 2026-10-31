''' Testing serializers '''
from django.core.exceptions import ValidationError
from rest_framework.test import APIClient, APIRequestFactory, APITestCase

from apps.users.admin import CustomUserAdmin, PortalAdminPasswordChangeForm
from apps.users.models import User
from apps.users.serializers import LoginSerializer


class TestLoginSerializer(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='UserTest', password='123')
        self.factory = APIRequestFactory()
        self.client = APIClient()

    def test_validate(self):
        data = {'username': 'UserTest', 'password': '123'}
        request = self.factory.post('/users/api/login', data)
        serializer = LoginSerializer(data=data, context={'request': request})
        self.assertTrue(serializer.is_valid(raise_exception=True))
        self.assertEqual(serializer.validated_data['user'], self.user)

    def test_validate_invalid_password(self):
        data = {'username': 'UserTest', 'password': 'invalid'}
        request = self.factory.post('/users/api/login', data)
        serializer = LoginSerializer(data=data, context={'request': request})
        self.assertFalse(serializer.is_valid(raise_exception=False))

    def test_validate_invalid_request(self):
        data = {'username': 'UserTest', 'auth': 'invalid'}
        request = self.factory.post('/users/api/login', data)
        serializer = LoginSerializer(data=data, context={'request': request})
        self.assertFalse(serializer.is_valid(raise_exception=False))

    def test_validate_empty_username(self):
        data = {'username': '', 'auth': 'invalid'}
        request = self.factory.post('/users/api/login', data)
        serializer = LoginSerializer(data=data, context={'request': request})
        self.assertFalse(serializer.is_valid(raise_exception=False))

    def test_username_field_rejects_at_sign(self):
        with self.assertRaises(ValidationError):
            User._meta.get_field('username').run_validators('at@sign')

    def test_admin_forms_reject_at_sign_and_trailing_password_space(self):
        creation = CustomUserAdmin.add_form(data={
            'username': 'at@sign',
            'password1': 'StrongPass@@123',
            'password2': 'StrongPass@@123',
            'usable_password': 'true',
        })
        self.assertFalse(creation.is_valid())
        self.assertIn('username', creation.errors)

        creation = CustomUserAdmin.add_form(data={
            'username': 'SpacedUser',
            'password1': 'StrongPass@@123 ',
            'password2': 'StrongPass@@123 ',
            'usable_password': 'true',
        })
        self.assertFalse(creation.is_valid())
        self.assertIn('password1', creation.errors)

        change = PortalAdminPasswordChangeForm(self.user, data={
            'password1': 'StrongPass@@123 ',
            'password2': 'StrongPass@@123 ',
            'usable_password': 'true',
        })
        self.assertFalse(change.is_valid())
        self.assertIn('password1', change.errors)
