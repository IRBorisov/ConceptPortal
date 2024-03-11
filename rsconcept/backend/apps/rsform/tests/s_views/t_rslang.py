''' Testing views '''
import os
from rest_framework.test import APITestCase, APIRequestFactory, APIClient
from rest_framework.exceptions import ErrorDetail
from rest_framework import status

from apps.users.models import User
from apps.rsform.models import RSForm
from apps.rsform.views import (
    convert_to_ascii,
    convert_to_math,
    parse_expression
)


class TestRSLanguageViews(APITestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.create(username='UserTest')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_create_rsform(self):
        work_dir = os.path.dirname(os.path.abspath(__file__))
        with open(f'{work_dir}/data/sample-rsform.trs', 'rb') as file:
            data = {'file': file, 'title': 'Test123', 'comment': '123', 'alias': 'ks1'}
            response = self.client.post(
                '/api/rsforms/create-detailed',
                data=data, format='multipart'
            )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['owner'], self.user.pk)
        self.assertEqual(response.data['title'], 'Test123')
        self.assertEqual(response.data['alias'], 'ks1')
        self.assertEqual(response.data['comment'], '123')

    def test_create_rsform_fallback(self):
        data = {'title': 'Test123', 'comment': '123', 'alias': 'ks1'}
        response = self.client.post(
            '/api/rsforms/create-detailed',
            data=data, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['owner'], self.user.pk)
        self.assertEqual(response.data['title'], 'Test123')
        self.assertEqual(response.data['alias'], 'ks1')
        self.assertEqual(response.data['comment'], '123')

    def test_convert_to_ascii(self):
        data = {'expression': '1=1'}
        request = self.factory.post(
            '/api/rslang/to-ascii',
            data=data, format='json'
        )
        response = convert_to_ascii(request)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['result'], r'1 \eq 1')

    def test_convert_to_ascii_missing_data(self):
        data = {'data': '1=1'}
        request = self.factory.post(
            '/api/rslang/to-ascii',
            data=data, format='json'
        )
        response = convert_to_ascii(request)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIsInstance(response.data['expression'][0], ErrorDetail)

    def test_convert_to_math(self):
        data = {'expression': r'1 \eq 1'}
        request = self.factory.post(
            '/api/rslang/to-math',
            data=data, format='json'
        )
        response = convert_to_math(request)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['result'], r'1=1')

    def test_convert_to_math_missing_data(self):
        data = {'data': r'1 \eq 1'}
        request = self.factory.post(
            '/api/rslang/to-math',
            data=data, format='json'
        )
        response = convert_to_math(request)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIsInstance(response.data['expression'][0], ErrorDetail)

    def test_parse_expression(self):
        data = {'expression': r'1=1'}
        request = self.factory.post(
            '/api/rslang/parse-expression',
            data=data, format='json'
        )
        response = parse_expression(request)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['parseResult'], True)
        self.assertEqual(response.data['syntax'], 'math')
        self.assertEqual(response.data['astText'], '[=[1][1]]')

    def test_parse_expression_missing_data(self):
        data = {'data': r'1=1'}
        request = self.factory.post(
            '/api/rslang/parse-expression',
            data=data, format='json'
        )
        response = parse_expression(request)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIsInstance(response.data['expression'][0], ErrorDetail)
