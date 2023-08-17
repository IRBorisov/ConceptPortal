''' Test russian language parsing. '''
import unittest

from typing import Iterable, Optional
from cctext import PhraseParser

parser = PhraseParser()


class TestRuParser(unittest.TestCase):
    ''' Test class for russian parsing. '''

    def _assert_parse(self, text: str, expected: list[str],
                      require_index: int = -1,
                      require_tags: Optional[Iterable[str]] = None):
        phrase = parser.parse(text, require_index, require_tags)
        self.assertIsNotNone(phrase)
        if phrase:
            self.assertEqual(phrase.get_morpho().tag.grammemes, set(expected))

    def _assert_inflect(self, text: str, tags: list[str], expected: str):
        model = parser.parse(text)
        if not model:
            result = text
        else:
            result = model.inflect(frozenset(tags))
        self.assertEqual(result, expected)

    def test_parse_word(self):
        ''' Test parse for single word. '''
        self._assert_parse('1',          ['NUMB', 'intg'])
        self._assert_parse('пять',       ['NUMR', 'nomn'])
        self._assert_parse('трёх',       ['NUMR', 'gent'])
        self._assert_parse('трех',       ['NUMR', 'gent'])
        self._assert_parse('круча',      ['NOUN', 'femn', 'sing', 'nomn', 'inan'])
        self._assert_parse('круть',      ['NOUN', 'femn', 'sing', 'nomn', 'inan', 'Sgtm', 'Geox'])
        self._assert_parse('ПВО',        ['NOUN', 'femn', 'sing', 'nomn', 'inan', 'Sgtm', 'Abbr', 'Fixd'])
        self._assert_parse('СМИ',        ['NOUN',         'plur', 'nomn', 'inan', 'Pltm', 'Abbr', 'Fixd', 'GNdr'])
        self._assert_parse('ему',        ['NPRO', 'masc', 'sing', 'datv', '3per', 'Anph'])
        self._assert_parse('крутит',     ['VERB',         'sing',         '3per', 'pres', 'impf', 'tran', 'indc'])
        self._assert_parse('смеркалось', ['VERB', 'neut', 'sing',         'Impe', 'past', 'impf', 'intr', 'indc'])
        self._assert_parse('крутить',    ['INFN',                                         'impf', 'tran'])
        self._assert_parse('крученый',   ['ADJF', 'masc', 'sing', 'nomn'])
        self._assert_parse('крут',       ['ADJS', 'masc', 'sing',         'Qual'])
        self._assert_parse('крутящего',  ['PRTF', 'masc', 'sing', 'gent',         'pres', 'impf', 'tran', 'actv'])
        self._assert_parse('откручен',   ['PRTS', 'masc', 'sing',                 'past', 'perf',         'pssv'])
        self._assert_parse('крутя',      ['GRND',                                 'pres', 'impf', 'tran'])
        self._assert_parse('круто',      ['ADVB'])
        self._assert_parse('круче',      ['COMP', 'Qual'])
        self._assert_parse(',', ['PNCT'])
        self._assert_parse('32-', ['intg', 'NUMB'])

        self._assert_parse('слон', ['NOUN', 'anim', 'masc', 'sing', 'nomn'], require_index=0)
        self._assert_parse('слон', ['NOUN', 'anim', 'masc', 'sing', 'nomn'], require_tags=['masc'])
        self._assert_parse('прямой', ['ADJF', 'gent', 'sing', 'femn', 'Qual'], require_index=0)
        self._assert_parse('прямой', ['ADJF', 'datv', 'Qual', 'sing', 'femn'], require_index=1)
        self._assert_parse('прямой', ['NOUN', 'sing', 'inan', 'femn', 'gent'], require_tags=['NOUN'])

        self._assert_parse('консистенции', ['NOUN', 'inan', 'femn', 'plur', 'nomn'])
        self._assert_parse('тест', ['NOUN', 'sing', 'masc', 'inan', 'nomn'])
        self._assert_parse('петля', ['NOUN', 'inan', 'femn', 'sing', 'nomn'])

        self._assert_parse('Слон', ['NOUN', 'anim', 'masc', 'sing', 'nomn'])
        self._assert_parse('СМИ', ['NOUN', 'Pltm', 'GNdr', 'Fixd', 'inan', 'Abbr', 'plur', 'nomn'])
        self.assertEqual(parser.parse('КАиП'), None)
        self.assertEqual(parser.parse('СЛОН'), None)
        self.assertEqual(parser.parse(''), None)
        self.assertEqual(parser.parse('слон', require_tags=set(['femn'])), None)
        self.assertEqual(parser.parse('32', require_tags=set(['NOUN'])), None)
        self.assertEqual(parser.parse('32-', require_tags=set(['NOUN'])), None)
        self.assertEqual(parser.parse('слон', require_index=42), None)

    def test_parse_text(self):
        ''' Test parse for multiword sequences. '''
        self._assert_parse(', ,', ['PNCT'])
        self._assert_parse('слон,', ['NOUN', 'anim', 'masc', 'sing', 'nomn'])

        self._assert_parse('синий слон', ['NOUN', 'anim', 'masc', 'sing', 'nomn'])
        self._assert_parse('слон синий', ['NOUN', 'anim', 'masc', 'sing', 'nomn'])
        self._assert_parse('тихий Дон', ['NOUN', 'anim', 'masc', 'sing', 'nomn'])
        self._assert_parse('слон, лежащий на траве', ['NOUN', 'anim', 'masc', 'sing', 'nomn'])
        self._assert_parse('лежащий на траве слон', ['NOUN', 'anim', 'masc', 'sing', 'nomn'])
        self._assert_parse('города улиц', ['NOUN', 'nomn', 'plur', 'masc', 'inan'])
        self._assert_parse('первый дом улиц города', ['NOUN', 'inan', 'masc', 'nomn', 'sing'])
        self._assert_parse('быстро едет', ['VERB', 'intr', 'impf', '3per', 'sing', 'indc', 'pres'])
        self._assert_parse('летучий 1-2-пептид', ['NOUN', 'masc', 'nomn', 'sing', 'inan'])

        self._assert_parse('прямой угол', ['NOUN', 'masc', 'nomn', 'inan', 'sing'])
        self._assert_parse('прямого угла', ['NOUN', 'sing', 'inan', 'masc', 'gent'])
        self._assert_parse('угла прямой', ['NOUN', 'sing', 'inan', 'masc', 'gent'])
        self._assert_parse('бесконечной прямой', ['NOUN', 'gent', 'femn', 'sing', 'inan'])
        self._assert_parse('складские операции', ['NOUN', 'femn', 'plur', 'inan', 'nomn'])
        self._assert_parse('незначительному воздействию хозяйственной деятельности',
                           ['NOUN', 'datv', 'sing', 'neut', 'inan'])

        self._assert_parse('варить овсянку', ['INFN', 'tran', 'impf'])
        self._assert_parse('варить рис', ['INFN', 'tran', 'impf'])

        self._assert_parse('нарочито сложный', ['ADJF', 'sing', 'masc', 'nomn', 'Qual'])
        self._assert_parse('части программы', ['NOUN', 'femn', 'plur', 'nomn', 'inan'])
        self._assert_parse('летучий 1-2-фторметил', ['NOUN', 'nomn', 'sing', 'masc', 'inan'])
        self._assert_parse('отрезок времени', ['NOUN', 'nomn', 'sing', 'masc', 'inan'])
        self._assert_parse('портки сушить', ['INFN', 'impf', 'tran'])
        self._assert_parse('портки вешай', ['VERB', 'tran', 'impr', 'impf', 'sing', 'excl'])
        self._assert_parse('Анализирует состояние организации.',
                           ['VERB', 'sing', 'tran', 'pres', '3per', 'impf', 'indc'])
        self._assert_parse('Во взаимодействии с подразделениями Генеральной прокуратуры формирует перечень показателей',
                           ['VERB', 'sing', 'tran', 'pres', '3per', 'impf', 'indc'])

    def test_parse_coordination(self):
        ''' Test parse coordination info. '''
        self.assertEqual(parser.parse('говорить').coordination, [-1, 1])
        self.assertEqual(parser.parse('ворчливая карга').coordination, [2, -1, 0])
        self.assertEqual(parser.parse('страна, объятая пожаром').coordination, [-1, -1, 2, -1, 2])
        self.assertEqual(parser.parse('тихо говорил').coordination, [-1, -1, 2])

    def test_normalize_word(self):
        ''' Test normalize for single word. '''
        self.assertEqual(parser.normalize(''), '')
        self.assertEqual(parser.normalize('123'), '123')
        self.assertEqual(parser.normalize('test'), 'test')
        self.assertEqual(parser.normalize('первого'), 'первый')
        self.assertEqual(parser.normalize('слону'), 'слон')
        self.assertEqual(parser.normalize('слонам'), 'слон')
        self.assertEqual(parser.normalize('обеспечил'), 'обеспечить')
        self.assertEqual(parser.normalize('сильную'), 'сильный')
        self.assertEqual(parser.normalize('бежавший'), 'бежать')
        self.assertEqual(parser.normalize('1 2 3'), '1 2 3')

    def test_normalize_text(self):
        ''' Test normalize for multiword collation. '''
        self.assertEqual(parser.normalize('синего слона'), 'синий слон')
        self.assertEqual(parser.normalize('тихо говоривший'), 'тихо говорить')
        self.assertEqual(parser.normalize('канавой квартала'), 'канава квартала')

    def test_inflect_word(self):
        ''' Test inflection for single word. '''
        self._assert_inflect('', [], '')
        self._assert_inflect('invalid', [], 'invalid')
        self._assert_inflect('invalid', ['nomn'], 'invalid')
        self._assert_inflect('', ['nomn'], '')
        self._assert_inflect('123', ['nomn'], '123')
        self._assert_inflect('слона', [], 'слона')
        self._assert_inflect('слона', ['ADJF'], 'слона')

        self._assert_inflect('слона', ['nomn'], 'слон')
        self._assert_inflect('объектоид', ['datv'], 'объектоиду')
        self._assert_inflect('терм-функция', ['datv'], 'терм-функции')

        self._assert_inflect('Слона', ['nomn'], 'Слон')
        self._assert_inflect('СМИ', ['datv'], 'СМИ')
        self._assert_inflect('КАНС', ['datv'], 'КАНС')
        self._assert_inflect('КАиП', ['datv'], 'КАиП')
        self._assert_inflect('АТ', ['datv'], 'АТ')
        self._assert_inflect('А-проекция', ['datv'], 'А-проекции')

    def test_inflect_noun(self):
        ''' Test inflection for single noun. '''
        self._assert_inflect('книга', ['nomn'], 'книга')
        self._assert_inflect('книга', ['gent'], 'книги')
        self._assert_inflect('книга', ['datv'], 'книге')
        self._assert_inflect('книга', ['accs'], 'книгу')
        self._assert_inflect('книга', ['ablt'], 'книгой')
        self._assert_inflect('книга', ['loct'], 'книге')
        self._assert_inflect('люди', ['loct'], 'людях')

        self._assert_inflect('книга', ['plur'], 'книги')
        self._assert_inflect('люди', ['sing'], 'человек')
        self._assert_inflect('человек', ['plur'], 'люди')
        self._assert_inflect('человек', ['plur', 'loct'], 'людях')

        self._assert_inflect('человеку', ['masc'], 'человеку')
        self._assert_inflect('человеку', ['neut'], 'человеку')
        self._assert_inflect('человека', ['femn'], 'человека')
        self._assert_inflect('человека', ['past'], 'человека')

    def test_inflect_npro(self):
        ''' Test inflection for single pronoun. '''
        self._assert_inflect('меня', ['nomn'], 'я')
        self._assert_inflect('я', ['gent'], 'меня')
        self._assert_inflect('я', ['datv'], 'мне')
        self._assert_inflect('я', ['accs'], 'меня')
        self._assert_inflect('я', ['ablt'], 'мной')
        self._assert_inflect('я', ['loct'], 'мне')

        self._assert_inflect('я', ['ADJF'], 'я')
        self._assert_inflect('я', ['NOUN'], 'я')
        self._assert_inflect('я', ['2per'], 'я')
        self._assert_inflect('я', ['past'], 'я')

    def test_inflect_numr(self):
        ''' Test inflection for single numeric. '''
        self._assert_inflect('трёх', ['nomn'], 'три')
        self._assert_inflect('три', ['gent'], 'трёх')
        self._assert_inflect('три', ['datv'], 'трём')
        self._assert_inflect('три', ['accs', 'inan'], 'три')
        self._assert_inflect('три', ['accs', 'anim'], 'трёх')
        self._assert_inflect('три', ['ablt'], 'тремя')
        self._assert_inflect('три', ['loct'], 'трёх')

    def test_inflect_adjf(self):
        ''' Test inflection for single adjectif. '''
        self._assert_inflect('хороший', ['nomn'], 'хороший')
        self._assert_inflect('хороший', ['gent'], 'хорошего')
        self._assert_inflect('хороший', ['datv'], 'хорошему')
        self._assert_inflect('хороший', ['accs'], 'хорошего')
        self._assert_inflect('хороший', ['ablt'], 'хорошим')
        self._assert_inflect('хороший', ['loct'], 'хорошем')

        self._assert_inflect('хороший', ['plur'], 'хорошие')
        self._assert_inflect('хорошие', ['sing'], 'хороший')
        self._assert_inflect('хорошие', ['sing', 'datv'], 'хорошему')
        self._assert_inflect('хорошие', ['plur', 'masc', 'datv'], 'хорошим')

        self._assert_inflect('хорошая', ['masc'], 'хороший')
        self._assert_inflect('перепончатокрылое', ['masc'], 'перепончатокрылый')
        self._assert_inflect('хороший', ['neut'], 'хорошее')
        self._assert_inflect('хорошая', ['neut'], 'хорошее')
        self._assert_inflect('хороший', ['femn'], 'хорошая')
        self._assert_inflect('перепончатокрылое', ['femn'], 'перепончатокрылая')

        self._assert_inflect('хороший', ['masc', 'femn'], 'хороший')
        self._assert_inflect('хороший', ['plur', 'femn'], 'хорошие')
        self._assert_inflect('хороший', ['past'], 'хороший')

    def test_inflect_prtf(self):
        ''' Test inflection for single participle. '''
        self._assert_inflect('бегущего', ['nomn'], 'бегущий')
        self._assert_inflect('бегущий', ['gent'], 'бегущего')
        self._assert_inflect('бегущий', ['datv'], 'бегущему')
        self._assert_inflect('бегущий', ['accs'], 'бегущего')
        self._assert_inflect('бегущий', ['ablt'], 'бегущим')
        self._assert_inflect('бегущий', ['loct'], 'бегущем')
        self._assert_inflect('бегущая', ['loct'], 'бегущей')
        self._assert_inflect('бежавшая', ['loct'], 'бежавшей')

        self._assert_inflect('бегущий', ['plur'], 'бегущие')
        self._assert_inflect('бегущие', ['sing'], 'бегущий')
        self._assert_inflect('бегущие', ['sing', 'datv'], 'бегущему')

        self._assert_inflect('бегущий', ['femn'], 'бегущая')
        self._assert_inflect('бегущий', ['neut'], 'бегущее')
        self._assert_inflect('бегущая', ['masc'], 'бегущий')

        self._assert_inflect('бегущий', ['past'], 'бежавший')
        self._assert_inflect('бежавших', ['pres'], 'бегущих')

        self._assert_inflect('бегущий', ['masc', 'femn'], 'бегущий')
        self._assert_inflect('бегущий', ['plur', 'femn'], 'бегущие')

    def test_inflect_verb(self):
        ''' Test inflection for single verb. '''
        self._assert_inflect('говорить', ['1per'], 'говорю')
        self._assert_inflect('говорить', ['2per'], 'говоришь')
        self._assert_inflect('говорить', ['2per', 'plur'], 'говорите')
        self._assert_inflect('говорить', ['3per'], 'говорит')

        self._assert_inflect('говорите', ['1per'], 'говорим')
        self._assert_inflect('говорите', ['3per'], 'говорят')

        self._assert_inflect('говорит', ['plur'], 'говорят')
        self._assert_inflect('говорят', ['sing'], 'говорит')

        self._assert_inflect('говорит', ['past'], 'говорил')
        self._assert_inflect('говорил', ['pres'], 'говорю')

        self._assert_inflect('говорили', ['sing'], 'говорил')
        self._assert_inflect('говорил', ['plur'], 'говорили')

        self._assert_inflect('говорила', ['masc'], 'говорил')
        self._assert_inflect('говорили', ['masc'], 'говорил')
        self._assert_inflect('говорил', ['neut'], 'говорило')
        self._assert_inflect('говорил', ['femn'], 'говорила')

        self._assert_inflect('говорить', ['datv'], 'говорить')

    def test_inflect_text_nominal(self):
        ''' Test inflection for multiword text in nominal form. '''
        self._assert_inflect('синий короткий', ['accs', 'sing', 'femn'], 'синюю короткую')
        self._assert_inflect('красивые слоны', ['accs', 'sing'], 'красивого слона')
        self._assert_inflect('вход процесса', ['loct', 'plur'], 'входах процесса')
        self._assert_inflect('нарочито сложный тест', ['datv', 'sing'], 'нарочито сложному тесту')
        self._assert_inflect('первый дом улиц города', ['loct', 'plur'], 'первых домах улиц города')
        self._assert_inflect('шкала оценок', ['loct', 'plur'], 'шкалах оценок')
        self._assert_inflect('складские операции', ['sing', 'datv'], 'складской операции')
        self._assert_inflect('стороны конфликтного перехода', ['loct', 'sing'], 'стороне конфликтного перехода')
        self._assert_inflect('уникомплексные тектологические переходы', ['loct', 'sing'],
                             'уникомплексном тектологическом переходе')

        self._assert_inflect('слабый НИР', ['datv', 'sing'], 'слабому НИР')
        self._assert_inflect('слабый НИР', ['accs', 'plur'], 'слабых НИР')
        self._assert_inflect('летучий 1-2-бутан', ['ablt', 'sing'], 'летучим 1-2-бутаном')
        self._assert_inflect('летучий 1-2-фторметил', ['ablt', 'sing'], 'летучим 1-2-фторметилом')

        self._assert_inflect('красивые процессы', ['accs', 'sing'], 'красивого процесс')
        self._assert_inflect('красивые процессы', ['gent', 'sing'], 'красивого процесса')
        self._assert_inflect('части программы', ['ablt', 'sing'], 'части программой')
        self._assert_inflect('первые здания', ['ablt', 'sing'], 'первым зданием')
        self._assert_inflect('прямой слон', ['ablt', 'sing'], 'прямым слоном')

        self._assert_inflect('тихо говорить', ['past', 'masc'], 'тихо говорил')
        self._assert_inflect('быть готовым', ['past', 'masc'], 'был готовым')
        self._assert_inflect('уметь готовить', ['pres', '2per'], 'умеешь готовить')
        self._assert_inflect('готовить рис', ['pres', '1per'], 'готовлю рис')

        # self._assert_inflect('десять миллионов', ['datv'], 'десяти миллионам')
        # self._assert_inflect('десять апельсинов', ['datv'], 'десяти апельсинов')
        # self._assert_inflect('два миллиона', ['datv'], 'двум миллионам')

        self._assert_inflect('техногенема n-го порядка', ['datv'], 'техногенеме n-го порядка')
        self._assert_inflect('Положение об органе АБВ', ['datv'], 'Положению об органе АБВ')

    def test_inflect_text_cross(self):
        ''' Test inflection for multiword text in multiple forms. '''
        self._assert_inflect('слона кота', ['nomn'], 'слон кота')
        self._assert_inflect('готовкой риса', ['nomn'], 'готовка риса')

        # self._assert_inflect('реципиенту воздействия', ['nomn'], 'реципиент воздействия')

    def test_inflect_complex_mainword(self):
        ''' Test inflection of mainword conmprised of multiple words. '''
        # Do not parse complex main words
        self._assert_inflect('слона и кота', ['nomn'], 'слон и кота')
        self._assert_inflect('сказал и поехал', ['INFN'], 'сказать и поехал')

    def test_inflect_word_pos(self):
        ''' Test inflection for word changing pars of speech. '''
        self._assert_inflect('обеспечит', ['INFN'], 'обеспечить')
        self._assert_inflect('обеспечить', ['VERB', '1per'], 'обеспечу')
        # self._assert_inflect('обеспечить', ['NOUN', 'sing','nomn'], 'обеспечение')
        # self._assert_inflect('обеспечить', ['NOUN', 'plur','datv'], 'обеспечениям')
        # self._assert_inflect('синеть', ['NOUN'], 'синь')
        # self._assert_inflect('готовить', ['NOUN', 'sing'], 'готовка')
        # self._assert_inflect('обеспечить', ['ADJF'], '???')
        # self._assert_inflect('обеспечить', ['ADJS'], '???')
        # self._assert_inflect('синеть', ['ADJF'], 'синий')
        # self._assert_inflect('готовить', ['ADJF', 'sing', 'femn'], 'готовая')
        self._assert_inflect('обеспечить', ['PRTF', 'plur', 'past'], 'обеспечившие')
        self._assert_inflect('обеспечить', ['PRTS', 'plur'], 'обеспечены')
        self._assert_inflect('обеспечить', ['GRND', 'past'], 'обеспечив')
        # self._assert_inflect('обеспечить', ['ADVB'], 'обеспечённо')
        # self._assert_inflect('обеспечить', ['COMP'], 'обеспеченнее')

        # self._assert_inflect('обеспечение', ['INFN'], 'обеспечить')
        # self._assert_inflect('обеспечение', ['VERB','1per'], 'обеспечу')
        self._assert_inflect('обеспечение', ['NOUN', 'plur', 'nomn'], 'обеспечения')
        self._assert_inflect('обеспечение', ['NOUN', 'plur', 'datv'], 'обеспечениям')
        # self._assert_inflect('синь', ['ADJF'], 'синий')
        # self._assert_inflect('обеспечение', ['PRTF', 'plur', 'past'], 'обеспечившие')
        # self._assert_inflect('обеспечение', ['PRTS', 'plur'], 'обеспечены')
        # self._assert_inflect('обеспечение', ['GRND', 'past'], 'обеспечив')
        # self._assert_inflect('обеспечение', ['ADVB'], 'обеспечённо')
        #  self._assert_inflect('обеспечение', ['COMP'], 'обеспеченнее')

        # self._assert_inflect('синий', ['INFN'], 'синеть')
        # self._assert_inflect('синий', ['VERB','1per'], 'синею')
        # self._assert_inflect('синий', ['NOUN', 'plur','nomn'], 'синьки')
        # self._assert_inflect('синий', ['NOUN', 'plur','datv'], 'синькам')
        self._assert_inflect('синий', ['ADJS'], 'синь')
        self._assert_inflect('хороший', ['ADJS'], 'хорош')
        # self._assert_inflect('синий', ['PRTF', 'plur', 'past'], 'синевшие')
        # self._assert_inflect('синий', ['PRTS', 'plur'], '??')
        # self._assert_inflect('синий', ['GRND', 'past'], 'синев')
        # self._assert_inflect('хороший', ['ADVB'], 'хорошо')
        self._assert_inflect('синий', ['COMP'], 'синее')

        self._assert_inflect('обеспечащий', ['INFN'], 'обеспечить')
        self._assert_inflect('обеспечивающий', ['INFN'], 'обеспечивать')
        self._assert_inflect('бегущий', ['INFN'], 'бежать')
        self._assert_inflect('бегущий', ['VERB'], 'бегу')
        self._assert_inflect('бежавшего', ['VERB'], 'бежал')
        # self._assert_inflect('обеспечащий', ['NOUN', 'plur','datv'], 'обеспечениям')
        # self._assert_inflect('синеющий', ['NOUN'], 'синь')
        # self._assert_inflect('готовящий', ['NOUN', 'sing'], 'готовка')
        # self._assert_inflect('синеющий', ['ADJF'], 'синий')
        self._assert_inflect('обеспечащий', ['PRTF', 'plur', 'past'], 'обеспечившие')
        self._assert_inflect('обеспечащий', ['PRTS', 'plur'], 'обеспечимы')
        self._assert_inflect('обеспечащий', ['GRND', 'past'], 'обеспечив')
        # self._assert_inflect('обеспечащий', ['ADVB'], 'обеспечённо')
        # self._assert_inflect('обеспечащий', ['COMP'], 'обеспеченнее')

    def test_inflect_text_pos(self):
        ''' Test inflection for multiword text changing parts of speech. '''
        # self._assert_inflect('готовить еду', ['NOUN', 'sing'], 'готовка еды')
        # self._assert_inflect('обеспечение безопасности', ['INFN'], 'обеспечить безопасность')
        # self._assert_inflect('сильный удар по мячу', ['INFN'], 'сильно ударить по мячу')
        self._assert_inflect('сильно обиженный', ['INFN'], 'сильно обидеть')
        # self._assert_inflect('сильно обиженный', ['NOUN'], 'сильная обида')
        # self._assert_inflect('надежно обеспечить', ['NOUN'], 'надежное обеспечение')

    def test_inflect_invalid_text(self):
        ''' Test inflection for multiword not coordinated text. '''
        self._assert_inflect('синими слоны', ['nomn', 'sing'], 'синими слон')

    def test_inflect_context(self):
        ''' Test content inflection. '''
        self.assertEqual(parser.inflect_context('', '', ''), '')
        self.assertEqual(parser.inflect_context('', 'красивый', ''), '')
        self.assertEqual(parser.inflect_context('', '', 'в'), '')
        self.assertEqual(parser.inflect_context('слон', '', ''), 'слон')

        self.assertEqual(parser.inflect_context('красивый', '', 'чашка'), 'красивая')
        self.assertEqual(parser.inflect_context('красивый', '', 'черного'), 'красивого')
        self.assertEqual(parser.inflect_context('слон', '', 'черного'), 'слона')
        self.assertEqual(parser.inflect_context('слоны', 'сильный', 'черную'), 'слон')
        self.assertEqual(parser.inflect_context('город', 'огня', ''), 'города')
        # self.assertEqual(parser.inflect_context('улица', 'дом', ''), 'улицы')

        self.assertEqual(parser.inflect_context('большой город', 'стильного', 'необъятной страны'), 'большого города')
        self.assertEqual(parser.inflect_context('город', '', ', расположенного неподалеку'), 'города')

    def test_inflect_substitute(self):
        ''' Test substitute inflection. '''
        self.assertEqual(parser.inflect_substitute('', ''), '')
        self.assertEqual(parser.inflect_substitute('123', '123'), '123')
        self.assertEqual(parser.inflect_substitute('', 'слон'), '')
        self.assertEqual(parser.inflect_substitute('слон', ''), 'слон')
        self.assertEqual(parser.inflect_substitute('слон', 'слон'), 'слон')
        self.assertEqual(parser.inflect_substitute('слон', 'слоны'), 'слоны')
        self.assertEqual(parser.inflect_substitute('слон', 'кошкой'), 'слоном')
        self.assertEqual(parser.inflect_substitute('синий слон', 'стильного чайника'), 'синего слона')
        self.assertEqual(parser.inflect_substitute('варить клюкву', 'осуществляет'), 'варит клюкву')

    def test_inflect_dependant(self):
        ''' Test coordination inflection. '''
        self.assertEqual(parser.inflect_dependant('', ''), '')
        self.assertEqual(parser.inflect_dependant('', 'слон'), '')
        self.assertEqual(parser.inflect_dependant('слон', ''), 'слон')
        self.assertEqual(parser.inflect_dependant('общий', 'мать'), 'общая')
        self.assertEqual(parser.inflect_dependant('синий', 'слонов'), 'синих')
        self.assertEqual(parser.inflect_dependant('белый длинный', 'столами'), 'белыми длинными')

    def test_find_substr(self):
        ''' Test substring search. '''
        self.assertEqual(parser.find_substr('', ''), (0, 0))
        self.assertEqual(parser.find_substr('слон', ''), (0, 0))
        self.assertEqual(parser.find_substr('', 'слон'), (0, 0))
        self.assertEqual(parser.find_substr('слон', 'слон'), (0, 4))
        self.assertEqual(parser.find_substr('сложного слона', 'слон'), (9, 14))
        self.assertEqual(parser.find_substr('сложного слона', 'слоном'), (9, 14))
        self.assertEqual(parser.find_substr('сложного красивого слона', 'красивые слоном'), (9, 24))
        self.assertEqual(parser.find_substr('человек', 'люди'), (0, 7))


if __name__ == '__main__':
    unittest.main()
