''' Testing views '''
from cctext import split_grams

from shared.EndpointTester import EndpointTester, decl_endpoint


class TestNaturalLanguageViews(EndpointTester):
    ''' Test natural language endpoints. '''

    def _assert_tags(self, actual: str, expected: str):
        self.assertEqual(set(split_grams(actual)), set(split_grams(expected)))


    @decl_endpoint(endpoint='/api/cctext/parse', method='post')
    def test_parse_text(self):
        data = {'text': 'синим слонам'}
        response = self.executeOK(data)
        self._assert_tags(response.data['result'], 'datv,NOUN,plur,anim,masc')


    @decl_endpoint(endpoint='/api/cctext/inflect', method='post')
    def test_inflect(self):
        data = {'text': 'синий слон', 'grams': 'plur,datv'}
        response = self.executeOK(data)
        self.assertEqual(response.data['result'], 'синим слонам')


    @decl_endpoint(endpoint='/api/cctext/generate-lexeme', method='post')
    def test_generate_lexeme(self):
        data = {'text': 'синий слон'}
        response = self.executeOK(data)
        self.assertEqual(len(response.data['items']), 12)
        self.assertEqual(response.data['items'][0]['text'], 'синий слон')
