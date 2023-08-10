''' Testing views '''
import json
from rest_framework.test import APITestCase, APIClient

from apps.users.models import User


# TODO: test AUTH and ATIVE_USERS
class TestUserAPIViews(APITestCase):
    def setUp(self):
        self.username = 'UserTest'
        self.email = 'test@test.com'
        self.password = 'password'
        self.user = User.objects.create_user(
            self.username, self.email, self.password
        )
        self.client = APIClient()

    def test_login(self):
        data = json.dumps({'username': self.username, 'password': self.password})
        response = self.client.post('/users/api/login', data=data, content_type='application/json')
        self.assertEqual(response.status_code, 202)

    def test_logout(self):
        self.assertEqual(self.client.post('/users/api/logout').status_code, 403)

        self.client.force_login(user=self.user)
        self.assertEqual(self.client.get('/users/api/logout').status_code, 405)
        self.assertEqual(self.client.post('/users/api/logout').status_code, 204)

        self.assertEqual(self.client.post('/users/api/logout').status_code, 403)


class TestUserUserProfileAPIView(APITestCase):
    def setUp(self):
        self.username = 'UserTest'
        self.email = 'test@test.com'
        self.password = 'password'
        self.first_name = 'John'
        self.user = User.objects.create_user(
            self.username, self.email, self.password
        )
        self.user.first_name = self.first_name
        self.user.save()
        self.client = APIClient()

    def test_read_profile(self):
        self.assertEqual(self.client.get('/users/api/profile').status_code, 403)
        self.client.force_login(user=self.user)
        response = self.client.get('/users/api/profile')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['username'], self.username)
        self.assertEqual(response.data['email'], self.email)
        self.assertEqual(response.data['first_name'], self.first_name)
        self.assertEqual(response.data['last_name'], '')

    def test_patch_profile(self):
        self.client.force_login(user=self.user)
        data = json.dumps({
            'email': '123@mail.ru',
            'first_name': 'firstName',
            'last_name': 'lastName',
        })
        response = self.client.patch('/users/api/profile', data=data, content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['email'], '123@mail.ru')
        self.assertEqual(response.data['first_name'], 'firstName')
        self.assertEqual(response.data['last_name'], 'lastName')

    def test_edit_profile(self):
        newmail = 'newmail@gmail.com'
        data = json.dumps({'email': newmail})
        response = self.client.patch('/users/api/profile', data, content_type='application/json')
        self.assertEqual(response.status_code, 403)

        self.client.force_login(user=self.user)
        response = self.client.patch('/users/api/profile', data, content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['username'], self.username)
        self.assertEqual(response.data['email'], newmail)

    def test_change_password(self):
        newpassword = 'pw2'
        data = json.dumps({'old_password': self.password, 'new_password': newpassword})
        response = self.client.patch('/users/api/change-password', data, content_type='application/json')
        self.assertEqual(response.status_code, 403)
        self.assertFalse(self.client.login(username=self.user.username, password=newpassword))
        self.assertTrue(self.client.login(username=self.user.username, password=self.password))

        invalid = json.dumps({'old_password': 'invalid', 'new_password': newpassword})
        response = self.client.patch('/users/api/change-password', invalid, content_type='application/json')
        self.assertEqual(response.status_code, 400)

        oldHash = self.user.password
        self.client.force_login(user=self.user)
        response = self.client.patch('/users/api/change-password', data, content_type='application/json')
        self.user.refresh_from_db()
        self.assertEqual(response.status_code, 204)
        self.assertNotEqual(self.user.password, oldHash)
        self.assertTrue(self.client.login(username=self.user.username, password=newpassword))
        self.assertFalse(self.client.login(username=self.user.username, password=self.password))


class TestSignupAPIView(APITestCase):
    def setUp(self):
        self.client = APIClient()

    def test_signup(self):
        data = json.dumps({
            'username': 'TestUser',
            'email': 'email@mail.ru',
            'password': 'Test@@123',
            'password2': 'Test@@123',
            'first_name': 'firstName',
            'last_name': 'lastName',
        })
        response = self.client.post('/users/api/signup', data, content_type='application/json')
        self.assertEqual(response.status_code, 201)
        self.assertTrue('id' in response.data)
        self.assertEqual(response.data['username'], 'TestUser')
        self.assertEqual(response.data['email'], 'email@mail.ru')
        self.assertEqual(response.data['first_name'], 'firstName')
        self.assertEqual(response.data['last_name'], 'lastName')
