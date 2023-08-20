''' Unit tests: rumodel. '''
import unittest

from cctext import split_grams, combine_grams


class TestTags(unittest.TestCase):
    '''Test tags manipulation.'''

    def test_split_tags(self):
        self.assertEqual(split_grams(''), [])
        self.assertEqual(split_grams('NOUN'), ['NOUN'])
        self.assertEqual(split_grams('NOUN,plur,sing'), ['NOUN','plur','sing'])

    def test_combine_tags(self):
        self.assertEqual(combine_grams([]), '')
        self.assertEqual(combine_grams(['NOUN']), 'NOUN')
        self.assertEqual(combine_grams(['NOUN','plur','sing']), 'NOUN,plur,sing')
