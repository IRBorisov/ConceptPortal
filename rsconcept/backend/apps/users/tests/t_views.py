''' Testing views '''
from rest_framework.test import APITestCase, APIClient

from apps.users.models import User
from apps.rsform.models import LibraryItem, LibraryItemType


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
        data = {'username': self.username, 'password': self.password}
        response = self.client.post(
            '/users/api/login',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, 202)

    def test_logout(self):
        self.assertEqual(self.client.post('/users/api/logout').status_code, 403)

        self.client.force_login(user=self.user)
        self.assertEqual(self.client.get('/users/api/logout').status_code, 405)
        self.assertEqual(self.client.post('/users/api/logout').status_code, 204)

        self.assertEqual(self.client.post('/users/api/logout').status_code, 403)

    def test_auth(self):
        LibraryItem.objects.create(item_type=LibraryItemType.RSFORM, title='T1')
        item = LibraryItem.objects.create(
            item_type=LibraryItemType.RSFORM,
            title='Test',
            alias='T1',
            is_common=True,
            owner=self.user
        )
        response = self.client.get('/users/api/auth')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['id'], None)
        self.assertEqual(response.data['username'], '')
        self.assertEqual(response.data['is_staff'], False)
        self.assertEqual(response.data['subscriptions'], [])

        self.client.force_login(self.user)
        response = self.client.get('/users/api/auth')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['id'], self.user.pk)
        self.assertEqual(response.data['username'], self.user.username)
        self.assertEqual(response.data['is_staff'], self.user.is_staff)
        self.assertEqual(response.data['subscriptions'], [item.pk])


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
        data = {
            'email': '123@mail.ru',
            'first_name': 'firstName',
            'last_name': 'lastName',
        }
        response = self.client.patch(
            '/users/api/profile',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['email'], '123@mail.ru')
        self.assertEqual(response.data['first_name'], 'firstName')
        self.assertEqual(response.data['last_name'], 'lastName')

    def test_edit_profile(self):
        newmail = 'newmail@gmail.com'
        data = {'email': newmail}
        response = self.client.patch(
            '/users/api/profile',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, 403)

        self.client.force_login(user=self.user)
        response = self.client.patch(
            '/users/api/profile',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['username'], self.username)
        self.assertEqual(response.data['email'], newmail)

    def test_change_password(self):
        newpassword = 'pw2'
        data = {
            'old_password': self.password,
            'new_password': newpassword
        }
        response = self.client.patch(
            '/users/api/change-password',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, 403)
        self.assertFalse(self.client.login(username=self.user.username, password=newpassword))
        self.assertTrue(self.client.login(username=self.user.username, password=self.password))

        invalid = {
            'old_password': 'invalid',
            'new_password': newpassword
        }
        response = self.client.patch(
            '/users/api/change-password',
            data=invalid, format='json'
        )
        self.assertEqual(response.status_code, 400)

        oldHash = self.user.password
        self.client.force_login(user=self.user)
        response = self.client.patch(
            '/users/api/change-password',
            data=data, format='json'
        )
        self.user.refresh_from_db()
        self.assertEqual(response.status_code, 204)
        self.assertNotEqual(self.user.password, oldHash)
        self.assertTrue(self.client.login(username=self.user.username, password=newpassword))
        self.assertFalse(self.client.login(username=self.user.username, password=self.password))


class TestSignupAPIView(APITestCase):
    def setUp(self):
        self.client = APIClient()

    def test_signup(self):
        data = {
            'username': 'TestUser',
            'email': 'email@mail.ru',
            'password': 'Test@@123',
            'password2': 'Test@@123',
            'first_name': 'firstName',
            'last_name': 'lastName',
        }
        response = self.client.post(
            '/users/api/signup',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, 201)
        self.assertTrue('id' in response.data)
        self.assertEqual(response.data['username'], 'TestUser')
        self.assertEqual(response.data['email'], 'email@mail.ru')
        self.assertEqual(response.data['first_name'], 'firstName')
        self.assertEqual(response.data['last_name'], 'lastName')
