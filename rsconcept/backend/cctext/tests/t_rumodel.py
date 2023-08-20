''' Unit tests: rumodel. '''
import unittest

from cctext import split_tags, combine_tags


class TestTags(unittest.TestCase):
    '''Test tags manipulation.'''

    def test_split_tags(self):
        self.assertEqual(split_tags(''), [])
        self.assertEqual(split_tags('NOUN'), ['NOUN'])
        self.assertEqual(split_tags('NOUN,plur,sing'), ['NOUN','plur','sing'])

    def test_combine_tags(self):
        self.assertEqual(combine_tags([]), '')
        self.assertEqual(combine_tags(['NOUN']), 'NOUN')
        self.assertEqual(combine_tags(['NOUN','plur','sing']), 'NOUN,plur,sing')
