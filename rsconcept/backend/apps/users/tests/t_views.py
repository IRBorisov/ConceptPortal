''' Testing API: users. '''
from django.core.cache import cache
from rest_framework import status

from shared.EndpointTester import EndpointTester, decl_endpoint


class TestUserAPIViews(EndpointTester):
    ''' Testing Authentication views. '''

    def setUp(self):
        super().setUpFullUsers()


    @decl_endpoint('/users/api/login', method='post')
    def test_login(self):
        self.logout()
        data = {'username': self.user.username, 'password': 'invalid'}
        self.executeBadData(data)

        data = {'username': self.user.username, 'password': 'password'}
        self.executeAccepted(data)
        self.executeAccepted(data)

        self.logout()
        data = {'username': self.user.email, 'password': 'password'}
        self.executeAccepted(data)


    @decl_endpoint('/users/api/login', method='post')
    def test_login_throttling(self):
        cache.clear()
        self.logout()

        data = {'username': self.user.username, 'password': 'password'}
        for _ in range(5):
            self.executeAccepted(data)
        response = self.execute(data)
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)


    @decl_endpoint('/users/api/logout', method='post')
    def test_logout(self):
        self.logout()
        self.executeForbidden()

        self.login()
        self.executeNoContent()
        self.executeNoContent()


    @decl_endpoint('/users/api/auth', method='get')
    def test_auth(self):
        response = self.executeOK()
        self.assertEqual(response.data['id'], self.user.pk)
        self.assertEqual(response.data['username'], self.user.username)
        self.assertEqual(response.data['is_staff'], self.user.is_staff)
        self.assertEqual(response.data['editor'], [])

        self.logout()
        response = self.executeOK()
        self.assertEqual(response.data['id'], None)
        self.assertEqual(response.data['username'], '')
        self.assertEqual(response.data['is_staff'], False)
        self.assertEqual(response.data['editor'], [])


class TestUserUserProfileAPIView(EndpointTester):
    ''' Testing User profile views. '''

    def setUp(self):
        super().setUpFullUsers()
        self.user.first_name = 'John'
        self.user.second_name = 'Smith'
        self.user.save()


    @decl_endpoint('/users/api/profile', method='get')
    def test_read_profile(self):
        response = self.executeOK()
        self.assertEqual(response.data['username'], self.user.username)
        self.assertEqual(response.data['email'], self.user.email)
        self.assertEqual(response.data['first_name'], self.user.first_name)
        self.assertEqual(response.data['last_name'], self.user.last_name)

        self.logout()
        self.executeForbidden()


    @decl_endpoint('/users/api/profile', method='patch')
    def test_edit_profile(self):
        data = {
            'email': '123@mail.ru',
            'first_name': 'firstName',
            'last_name': 'lastName',
        }
        response = self.executeOK(data)
        self.user.refresh_from_db()
        self.assertEqual(response.data['email'], '123@mail.ru')
        self.assertEqual(self.user.email, '123@mail.ru')
        self.assertEqual(response.data['first_name'], 'firstName')
        self.assertEqual(self.user.first_name, 'firstName')
        self.assertEqual(response.data['last_name'], 'lastName')
        self.assertEqual(self.user.last_name, 'lastName')

        data = {
            'email': data['email'],
            'first_name': 'new',
            'last_name': 'new2',
        }
        self.executeOK(data)

        data = {'email': self.user2.email}
        self.executeBadData(data)

        data = {'username': 'new_username'}
        response = self.executeOK(data)
        self.assertNotEqual(response.data['username'], data['username'])

        self.logout()
        self.executeForbidden()


    @decl_endpoint('/users/api/change-password', method='patch')
    def test_change_password(self):
        data = {
            'old_password': 'invalid',
            'new_password': 'StrongPass@@123'
        }
        self.executeBadData(data)

        data = {
            'old_password': 'password',
            'new_password': 'password'
        }
        self.executeBadData(data)

        data = {
            'old_password': 'password',
            'new_password': 'StrongPass@@123'
        }
        oldHash = self.user.password
        response = self.executeNoContent(data)
        self.user.refresh_from_db()
        self.assertNotEqual(self.user.password, oldHash)
        self.assertTrue(self.client.login(username=self.user.username, password='StrongPass@@123'))
        self.assertFalse(self.client.login(username=self.user.username, password='password'))

        self.logout()
        self.executeForbidden()


    @decl_endpoint('/users/api/password-reset', method='post')
    def test_password_reset_request(self):
        cache.clear()
        self.executeBadData({'email': 'invalid@mail.ru'})
        self.executeOK({'email': self.user.email})


    @decl_endpoint('/users/api/password-reset', method='post')
    def test_password_reset_request_throttling(self):
        cache.clear()
        for _ in range(5):
            self.executeOK({'email': self.user.email})
        response = self.execute({'email': self.user.email})
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)


class TestSignupAPIView(EndpointTester):
    ''' Testing signup. '''

    def setUp(self):
        super().setUp()


    @decl_endpoint('/users/api/signup', method='post')
    def test_signup(self):
        cache.clear()
        data = {
            'username': 'NewUser',
            'email': 'newMail@mail.ru',
            'password': 'Test@@123',
            'password2': 'Test@@123456',
            'first_name': 'firstName',
            'last_name': 'lastName'
        }
        self.executeBadData(data)

        data = {
            'username': 'NewUser',
            'email': 'weakMail@mail.ru',
            'password': 'password',
            'password2': 'password',
            'first_name': 'firstName',
            'last_name': 'lastName'
        }
        self.executeBadData(data)

        cache.clear()

        data = {
            'username': 'NewUser',
            'email': 'newMail@mail.ru',
            'password': 'Test@@123',
            'password2': 'Test@@123',
            'first_name': 'firstName',
            'last_name': 'lastName'
        }
        response = self.executeCreated(data)
        self.assertTrue('id' in response.data)
        self.assertEqual(response.data['username'], data['username'])
        self.assertEqual(response.data['email'], data['email'])
        self.assertEqual(response.data['first_name'], data['first_name'])
        self.assertEqual(response.data['last_name'], data['last_name'])

        data = {
            'username': 'NewUser',
            'email': 'newMail2@mail.ru',
            'password': 'Test@@123',
            'password2': 'Test@@123',
            'first_name': 'firstName',
            'last_name': 'lastName'
        }
        self.executeBadData(data)

    @decl_endpoint('/users/api/signup', method='post')
    def test_signup_throttling(self):
        cache.clear()
        for idx in range(3):
            data = {
                'username': f'NewUser{idx}',
                'email': f'newMail{idx}@mail.ru',
                'password': 'Test@@123',
                'password2': 'Test@@123',
                'first_name': 'firstName',
                'last_name': 'lastName'
            }
            self.executeCreated(data)

        data = {
            'username': 'AnotherUser',
            'email': 'anotherMail@mail.ru',
            'password': 'Test@@123',
            'password2': 'Test@@123',
            'first_name': 'firstName',
            'last_name': 'lastName'
        }
        response = self.execute(data)
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
