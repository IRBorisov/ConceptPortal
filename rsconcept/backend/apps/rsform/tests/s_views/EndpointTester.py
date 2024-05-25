''' Utils: base tester class for endpoints. '''
from rest_framework import status
from rest_framework.test import APIClient, APIRequestFactory, APITestCase

from apps.users.models import User


def decl_endpoint(endpoint: str, method: str):
    ''' Decorator for EndpointTester methods to provide API attributes. '''
    def set_endpoint_inner(function):
        def wrapper(*args, **kwargs):
            if '{' in endpoint:
                args[0].endpoint = 'UNRESOLVED'
                args[0].endpoint_mask = endpoint
            else:
                args[0].endpoint_mask = None
                args[0].endpoint = endpoint
            args[0].method = method
            return function(*args, **kwargs)
        return wrapper
    return set_endpoint_inner


class EndpointTester(APITestCase):
    ''' Abstract base class for Testing endpoints. '''

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.create(username='UserTest')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def toggle_admin(self, value: bool = True):
        self.user.is_staff = value
        self.user.save()

    def login(self):
        self.client.force_authenticate(user=self.user)

    def logout(self):
        self.client.logout()

    def set_params(self, **kwargs):
        ''' Given named argument values resolve current endpoint_mask. '''
        if self.endpoint_mask and len(kwargs) > 0:
            self.endpoint = _resolve_url(self.endpoint_mask, **kwargs)

    def get(self, endpoint: str = '', **kwargs):
        if endpoint != '':
            return self.client.get(endpoint)
        else:
            self.set_params(**kwargs)
            return self.client.get(self.endpoint)

    def post(self, data=None, **kwargs):
        self.set_params(**kwargs)
        if not data is None:
            return self.client.post(self.endpoint, data=data, format='json')
        else:
            return self.client.post(self.endpoint)

    def patch(self, data=None, **kwargs):
        self.set_params(**kwargs)
        if not data is None:
            return self.client.patch(self.endpoint, data=data, format='json')
        else:
            return self.client.patch(self.endpoint)

    def put(self, data, **kwargs):
        self.set_params(**kwargs)
        return self.client.get(self.endpoint, data=data, format='json')

    def delete(self, data=None, **kwargs):
        self.set_params(**kwargs)
        if not data is None:
            return self.client.delete(self.endpoint, data=data, format='json')
        else:
            return self.client.delete(self.endpoint)

    def assertOK(self, data=None, **kwargs):
        response = self.execute(data, **kwargs)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def assertCreated(self, data=None, **kwargs):
        response = self.execute(data, **kwargs)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def assertBadData(self, data=None, **kwargs):
        response = self.execute(data, **kwargs)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def assertForbidden(self, data=None, **kwargs):
        response = self.execute(data, **kwargs)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def assertNotModified(self, data=None, **kwargs):
        response = self.execute(data, **kwargs)
        self.assertEqual(response.status_code, status.HTTP_304_NOT_MODIFIED)

    def assertNotFound(self, data=None, **kwargs):
        response = self.execute(data, **kwargs)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def execute(self, data=None, **kwargs):
        if self.method == 'get':
            return self.get(**kwargs)
        if self.method == 'post':
            return self.post(data, **kwargs)
        if self.method == 'put':
            return self.put(data, **kwargs)
        if self.method == 'patch':
            return self.patch(data, **kwargs)
        if self.method == 'delete':
            return self.delete(data, **kwargs)
        return None


def _resolve_url(url: str, **kwargs) -> str:
    if url == '' or len(kwargs) == 0:
        return url
    pos_input: int = 0
    pos_start: int = 0
    pos_end: int = 0
    arg_names = set()
    output: str = ''
    while True:
        pos_start = url.find('{', pos_input)
        if pos_start == -1:
            break
        pos_end = url.find('}', pos_start)
        if pos_end == -1:
            break
        name = url[(pos_start + 1): pos_end]
        arg_names.add(name)
        if not name in kwargs:
            raise KeyError(f'Missing argument: {name} | Mask: {url}')
        output += url[pos_input: pos_start]
        output += str(kwargs[name])
        pos_input = pos_end + 1
    if pos_input < len(url):
        output += url[pos_input: len(url)]
    for (key, _) in kwargs.items():
        if key not in arg_names:
            raise KeyError(f'Unused argument: {name} | Mask: {url}')
    return output
