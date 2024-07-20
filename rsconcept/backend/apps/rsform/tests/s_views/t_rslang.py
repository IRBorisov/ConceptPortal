''' Testing views '''
from shared.EndpointTester import EndpointTester, decl_endpoint


class TestRSLanguageViews(EndpointTester):
    ''' Test RS language endpoints. '''

    @decl_endpoint('/api/rslang/to-ascii', method='post')
    def test_convert_to_ascii(self):
        data = {'data': '1=1'}
        self.executeBadData(data=data)

        data = {'expression': '1=1'}
        response = self.executeOK(data=data)
        self.assertEqual(response.data['result'], r'1 \eq 1')


    @decl_endpoint('/api/rslang/to-math', method='post')
    def test_convert_to_math(self):
        data = {'data': r'1 \eq 1'}
        self.executeBadData(data=data)

        data = {'expression': r'1 \eq 1'}
        response = self.executeOK(data=data)
        self.assertEqual(response.data['result'], r'1=1')


    @decl_endpoint('/api/rslang/parse-expression', method='post')
    def test_parse_expression(self):
        data = {'data': r'1=1'}
        self.executeBadData(data=data)

        data = {'expression': r'1=1'}
        response = self.executeOK(data=data)
        self.assertEqual(response.data['parseResult'], True)
        self.assertEqual(response.data['syntax'], 'math')
        self.assertEqual(response.data['astText'], '[=[1][1]]')
