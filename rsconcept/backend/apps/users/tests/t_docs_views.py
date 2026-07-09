'''Regression: docs HTML views must not 500 on OPTIONS.'''
from rest_framework import status
from rest_framework.test import APITestCase


class TestDocsViews(APITestCase):
    '''Swagger/ReDoc must reject OPTIONS instead of rendering empty template includes.'''

    def test_options_home_returns_method_not_allowed(self):
        response = self.client.options('/')
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_options_redoc_returns_method_not_allowed(self):
        response = self.client.options('/redoc')
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_get_home_ok(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
