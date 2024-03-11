''' Testing views '''
import os
import io
from zipfile import ZipFile
from rest_framework.test import APITestCase, APIRequestFactory, APIClient
from rest_framework.exceptions import ErrorDetail
from rest_framework import status

from cctext import ReferenceType, split_grams

from apps.users.models import User
from apps.rsform.models import (
  RSForm, Constituenta, CstType,
  LibraryItem, LibraryItemType, Subscription, LibraryTemplate
)
from apps.rsform.views import (
    convert_to_ascii,
    convert_to_math,
    parse_expression,
    inflect,
    parse_text,
    generate_lexeme
)


class TestNaturalLanguageViews(APITestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.client = APIClient()

    def _assert_tags(self, actual: str, expected: str):
        self.assertEqual(set(split_grams(actual)), set(split_grams(expected)))

    def test_parse_text(self):
        data = {'text': 'синим слонам'}
        request = self.factory.post(
            '/api/cctext/parse',
            data=data, format='json'
        )
        response = parse_text(request)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self._assert_tags(response.data['result'], 'datv,NOUN,plur,anim,masc')

    def test_inflect(self):
        data = {'text': 'синий слон', 'grams': 'plur,datv'}
        request = self.factory.post(
            '/api/cctext/inflect',
            data=data, format='json'
        )
        response = inflect(request)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['result'], 'синим слонам')

    def test_generate_lexeme(self):
        data = {'text': 'синий слон'}
        request = self.factory.post(
            '/api/cctext/generate-lexeme',
            data=data, format='json'
        )
        response = generate_lexeme(request)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['items']), 12)
        self.assertEqual(response.data['items'][0]['text'], 'синий слон')
