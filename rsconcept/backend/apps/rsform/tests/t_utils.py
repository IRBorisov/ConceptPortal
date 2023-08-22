''' Unit tests: utils. '''
import unittest
import re

from apps.rsform.utils import apply_mapping_pattern


class TestUtils(unittest.TestCase):
    ''' Test various utilitiy functions. '''
    def test_apply_mapping_patter(self):
        mapping = {'X101': 'X20'}
        pattern = re.compile(r'(X[0-9]+)')
        self.assertEqual(apply_mapping_pattern('', mapping, pattern), '')
        self.assertEqual(apply_mapping_pattern('X20', mapping, pattern), 'X20')
        self.assertEqual(apply_mapping_pattern('X101', mapping, pattern), 'X20')
        self.assertEqual(apply_mapping_pattern('asdf X101 asdf', mapping, pattern), 'asdf X20 asdf')
