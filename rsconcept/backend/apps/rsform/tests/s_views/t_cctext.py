''' Testing views '''
from rest_framework import status

from cctext import split_grams

from .EndpointTester import decl_endpoint, EndpointTester


class TestNaturalLanguageViews(EndpointTester):
    ''' Test natural language endpoints. '''
    def _assert_tags(self, actual: str, expected: str):
        self.assertEqual(set(split_grams(actual)), set(split_grams(expected)))

    @decl_endpoint(endpoint='/api/cctext/parse', method='post')
    def test_parse_text(self):
        data = {'text': 'синим слонам'}
        response = self.execute(data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self._assert_tags(response.data['result'], 'datv,NOUN,plur,anim,masc')

    @decl_endpoint(endpoint='/api/cctext/inflect', method='post')
    def test_inflect(self):
        data = {'text': 'синий слон', 'grams': 'plur,datv'}
        response = self.execute(data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['result'], 'синим слонам')

    @decl_endpoint(endpoint='/api/cctext/generate-lexeme', method='post')
    def test_generate_lexeme(self):
        data = {'text': 'синий слон'}
        response = self.execute(data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['items']), 12)
        self.assertEqual(response.data['items'][0]['text'], 'синий слон')
