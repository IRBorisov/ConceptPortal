''' Testing serializers '''
from rest_framework.test import APITestCase, APIRequestFactory, APIClient

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
