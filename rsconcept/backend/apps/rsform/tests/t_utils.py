''' Unit tests: utils. '''
import re
import unittest

from apps.rsform.utils import apply_pattern, filename_for_schema, fix_old_references


class TestUtils(unittest.TestCase):
    ''' Test various utility functions. '''


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


    def test_filename_for_schema_sanitizes_alias(self):
        self.assertEqual(filename_for_schema('Safe_Name-1'), 'Safe_Name-1.trs')
        self.assertEqual(filename_for_schema('bad"name\r\n'), 'bad_name__.trs')
        self.assertEqual(filename_for_schema('Схема'), 'Schema.trs')
