''' Testing imported pyconcept functionality '''
from unittest import TestCase

import pyconcept as pc
import json


class TestIntegrations(TestCase):
    def test_convert_to_ascii(self):
        ''' Test converting to ASCII syntax '''
        self.assertEqual(pc.convert_to_ascii(''), '')
        self.assertEqual(pc.convert_to_ascii('\u212c(X1)'), r'B(X1)')

    def test_convert_to_math(self):
        ''' Test converting to MATH syntax '''
        self.assertEqual(pc.convert_to_math(''), '')
        self.assertEqual(pc.convert_to_math(r'B(X1)'), '\u212c(X1)')

    def test_parse_expression(self):
        ''' Test parsing expression '''
        out = json.loads(pc.parse_expression('X1=X2'))
        self.assertEqual(out['parseResult'], True)
        self.assertEqual(out['syntax'], 'math')

    def test_empty_schema(self):
        with self.assertRaises(RuntimeError):
            pc.check_schema('')

    def test_check_schema(self):
        schema = self._default_schema()
        self.assertTrue(pc.check_schema(schema) != '')

    def test_check_expression(self):
        schema = self._default_schema()
        out1 = json.loads(pc.check_expression(schema, 'X1=X1'))
        self.assertTrue(out1['parseResult'])

        out2 = json.loads(pc.check_expression(schema, 'X1=X2'))
        self.assertFalse(out2['parseResult'])

    def test_reset_aliases(self):
        ''' Test reset aliases in schema '''
        schema = self._default_schema()
        fixedSchema = json.loads(pc.reset_aliases(schema))
        self.assertTrue(len(fixedSchema['items']) > 2)
        self.assertEqual(fixedSchema['items'][2]['alias'], 'S1')

    def _default_schema(self):
        return '''{
    "type": "rsform",
    "title": "default",
    "alias": "default",
    "comment": "",
    "items": [
        {
            "entityUID": 1023383816,
            "type": "constituenta",
            "cstType": "basic",
            "alias": "X1",
            "convention": "",
            "term": {
                "raw": "",
                "resolved": "",
                "forms": []
            },
            "definition": {
                "formal": "",
                "text": {
                    "raw": "",
                    "resolved": ""
                }
            }
        },
        {
            "entityUID": 1877659352,
            "type": "constituenta",
            "cstType": "basic",
            "alias": "X2",
            "convention": "",
            "term": {
                "raw": "",
                "resolved": "",
                "forms": []
            },
            "definition": {
                "formal": "",
                "text": {
                    "raw": "",
                    "resolved": ""
                }
            }
        },
        {
            "entityUID": 1115937389,
            "type": "constituenta",
            "cstType": "structure",
            "alias": "S2",
            "convention": "",
            "term": {
                "raw": "",
                "resolved": "",
                "forms": []
            },
            "definition": {
                "formal": "ℬ(X1×X1)",
                "text": {
                    "raw": "",
                    "resolved": ""
                }
            }
        },
        {
            "entityUID": 94433573,
            "type": "constituenta",
            "cstType": "structure",
            "alias": "S3",
            "convention": "",
            "term": {
                "raw": "",
                "resolved": "",
                "forms": []
            },
            "definition": {
                "formal": "ℬ(X1×X2)",
                "text": {
                    "raw": "",
                    "resolved": ""
                }
            }
        }
    ]
}'''
