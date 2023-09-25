''' Unit tests: utils. '''
import unittest
import re

from apps.rsform.utils import apply_pattern, fix_old_references


class TestUtils(unittest.TestCase):
    ''' Test various utilitiy functions. '''
    def test_apply_mapping_patter(self):
        mapping = {'X101': 'X20'}
        pattern = re.compile(r'(X[0-9]+)')
        self.assertEqual(apply_pattern('', mapping, pattern), '')
        self.assertEqual(apply_pattern('X20', mapping, pattern), 'X20')
        self.assertEqual(apply_pattern('X101', mapping, pattern), 'X20')
        self.assertEqual(apply_pattern('asdf X101 asdf', mapping, pattern), 'asdf X20 asdf')

    def test_fix_old_references(self):
        self.assertEqual(fix_old_references(''), '')
        self.assertEqual(fix_old_references('X20'), 'X20')
        self.assertEqual(fix_old_references('@{X1|nomn,sing}'), '@{X1|nomn,sing}')
        self.assertEqual(fix_old_references('@{X1|sing,ablt} @{X1|sing,ablt}'), '@{X1|sing,ablt} @{X1|sing,ablt}')
        self.assertEqual(fix_old_references('@{X1|nomn|sing}'), '@{X1|nomn,sing}')
