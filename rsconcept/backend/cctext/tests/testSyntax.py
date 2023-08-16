'''Test module for Russian syntax'''
import unittest

from cctext import RuSyntax, Capitalization


class TestRusParser(unittest.TestCase):
    ''' Test class for russian syntax. '''

    def test_capitalization(self):
        ''' Testing capitalization. '''
        self.assertEqual(Capitalization.from_text(''), Capitalization.unknwn)
        self.assertEqual(Capitalization.from_text('Альфа'), Capitalization.first_capital)
        self.assertEqual(Capitalization.from_text('АЛЬФА'), Capitalization.upper_case)
        self.assertEqual(Capitalization.from_text('альфа'), Capitalization.lower_case)
        self.assertEqual(Capitalization.from_text('альФа'), Capitalization.mixed)
        self.assertEqual(Capitalization.from_text('альфА'), Capitalization.mixed)
        self.assertEqual(Capitalization.from_text('КАиП'), Capitalization.mixed)

        self.assertEqual(Capitalization.upper_case.apply_to('альфа'), 'АЛЬФА')
        self.assertEqual(Capitalization.lower_case.apply_to('АльФа'), 'альфа')
        self.assertEqual(Capitalization.first_capital.apply_to('альфа'), 'Альфа')
        self.assertEqual(Capitalization.first_capital.apply_to('АльФа'), 'АльФа')
        self.assertEqual(Capitalization.unknwn.apply_to('АльФа'), 'АльФа')
        self.assertEqual(Capitalization.mixed.apply_to('АльФа'), 'АльФа')

    def test_is_single_word(self):
        ''' Testing single word identification. '''
        self.assertTrue(RuSyntax.is_single_word(''))
        self.assertTrue(RuSyntax.is_single_word('word'))
        self.assertTrue(RuSyntax.is_single_word('слово'))
        self.assertTrue(RuSyntax.is_single_word(' word '), 'Whitespace doesnt count')
        self.assertTrue(RuSyntax.is_single_word('1001'), 'Numbers are words')
        self.assertTrue(RuSyntax.is_single_word('кое-как'), 'Hyphen doesnt break work')
        self.assertTrue(RuSyntax.is_single_word('1-2-метилбутан'), 'Complex words')
        self.assertFalse(RuSyntax.is_single_word('one two'))
        self.assertFalse(RuSyntax.is_single_word('синий слон'))

    def test_tokenize(self):
        ''' Testing tokenization. '''
        self.assertEqual(list(RuSyntax.tokenize('')), [])
        self.assertEqual(list(RuSyntax.tokenize(' ')), [])
        self.assertEqual(self._list_tokenize('test'), [(0, 4, 'test')])
        self.assertEqual(self._list_tokenize(' test '), [(1, 5, 'test')])
        self.assertEqual(self._list_tokenize('синий слон'), [(0, 5, 'синий'), (6, 10, 'слон')])

    def test_split_words(self):
        ''' Testing splitting text into words. '''
        self.assertEqual([], list(RuSyntax.split_words('')))
        self.assertEqual([], list(RuSyntax.split_words(' ')))
        self.assertEqual(RuSyntax.split_words('test'), ['test'])
        self.assertEqual(RuSyntax.split_words(' test '), ['test'])
        self.assertEqual(RuSyntax.split_words('синий слон'), ['синий', 'слон'])
        self.assertEqual(RuSyntax.split_words('синий, большой слон'), ['синий', ',', 'большой', 'слон'])

    @staticmethod
    def _list_tokenize(text: str):
        return [(token.start, token.stop, token.text) for token in RuSyntax.tokenize(text)]


if __name__ == '__main__':
    unittest.main()
