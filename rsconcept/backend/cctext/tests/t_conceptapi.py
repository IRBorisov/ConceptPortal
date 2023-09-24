''' Unit tests: conceptapi. '''
import unittest

import cctext as cc


class TestConceptAPI(unittest.TestCase):
    '''Test class for Concept API.'''
    def _assert_tags(self, actual: str, expected: str):
        self.assertEqual(set(cc.split_grams(actual)), set(cc.split_grams(expected)))
        
    def test_parse(self):
        ''' Test parsing. '''
        self._assert_tags(cc.parse(''), '')
        self._assert_tags(cc.parse('1'), 'NUMB,intg')
        self._assert_tags(cc.parse('слон', require_grams='masc'), 'NOUN,anim,masc,sing,nomn')

    def test_normalize_word(self):
        ''' Test normalize for single word. '''
        self.assertEqual(cc.normalize(''), '')
        self.assertEqual(cc.normalize('первого'), 'первый')
        self.assertEqual(cc.normalize('диких людей'), 'дикий человек')

    def test_generate_lexeme(self):
        ''' Test all lexical forms. '''
        self.assertEqual(cc.generate_lexeme(''), [])

        forms = cc.generate_lexeme('наверное')
        self.assertEqual(len(forms), 1)
        self.assertEqual(forms[0][0], 'наверное')
        self._assert_tags(forms[0][1], 'CONJ,Prnt')

        forms = cc.generate_lexeme('молодой человек')
        self.assertEqual(len(forms), 19)
        self.assertEqual(forms[0][0], 'молодой человек')
        self._assert_tags(forms[0][1], 'nomn,masc,sing,anim,NOUN')

    def test_inflect(self):
        ''' Test inflection. '''
        self.assertEqual(cc.inflect('', ''), '')
        self.assertEqual(cc.inflect('слона', 'nomn'), 'слон')
        self.assertEqual(cc.inflect('слона', 'ADJF'), 'слона')
        self.assertEqual(cc.inflect('слона', 'nomn,plur'), 'слоны')
        self.assertEqual(cc.inflect('слона', 'nomn, plur'), 'слоны')
        self.assertEqual(cc.inflect('шкала оценок', 'loct,plur'), 'шкалах оценок')

    def test_find_substr(self):
        '''Test substring search'''
        self.assertEqual(cc.find_substr('', ''), (0, 0))
        self.assertEqual(cc.find_substr('сложного красивого слона', 'красивые слоном'), (9, 24))

    def test_inflect_context(self):
        '''Test contex inflection'''
        self.assertEqual(cc.inflect_context('', '', ''), '')
        self.assertEqual(cc.inflect_context('красивый', '', 'чашка'), 'красивая')

    def test_inflect_substitute(self):
        '''Test substitute inflection'''
        self.assertEqual(cc.inflect_substitute('', ''), '')
        self.assertEqual(cc.inflect_substitute('', 'слон'), '')
        self.assertEqual(cc.inflect_substitute('слон', ''), 'слон')
        self.assertEqual(cc.inflect_substitute('красивый бантик', 'кошкой'), 'красивым бантиком')

    def test_inflect_dependant(self):
        ''' Test coordination inflection. '''
        self.assertEqual(cc.inflect_dependant('', ''), '')
        self.assertEqual(cc.inflect_dependant('', 'слон'), '')
        self.assertEqual(cc.inflect_dependant('слон', ''), 'слон')
        self.assertEqual(cc.inflect_dependant('общий', 'мать'), 'общая')
        self.assertEqual(cc.inflect_dependant('синий', 'слонов'), 'синих')

    def test_match_all_morpho(self):
        ''' Test extracting matching morpho. '''
        self.assertEqual(cc.match_all_morpho('', ''), [])
        self.assertEqual(cc.match_all_morpho('горит город', ''), [])
        self.assertEqual(cc.match_all_morpho('горит город', 'NOUN'), [[6, 11]])
        self.assertEqual(cc.match_all_morpho('горит город', 'VERB'), [[0, 5]])
        self.assertEqual(cc.match_all_morpho('столица страны', 'NOUN'), [[0, 7], [8, 14]])
        self.assertEqual(cc.match_all_morpho('столица страны', 'NOUN,sing,nomn'), [[0, 7]])


if __name__ == '__main__':
    unittest.main()
