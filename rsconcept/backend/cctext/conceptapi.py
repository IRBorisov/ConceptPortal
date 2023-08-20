'''
Concept API Python functions.

::guarantee:: doesnt raise exceptions and returns workable outputs
'''
from cctext.rumodel import Morphology
from .syntax import RuSyntax
from .ruparser import PhraseParser
from .rumodel import split_grams

parser = PhraseParser()


def parse(text: str, require_grams: str = '') -> str:
    ''' Determine morpho tags for input text.
    ::returns:: string of comma separated grammar tags or empty string '''
    model = parser.parse(text, require_grams=split_grams(require_grams))
    if model is None:
        return ''
    result = model.get_morpho().to_text()
    return result if result != 'UNKN' else ''


def get_all_forms(text_normal: str) -> list[tuple[str, str]]:
    ''' Get all infeclted forms. '''
    model = parser.parse(text_normal)
    if not model:
        return []
    result = []
    for form in model.get_form().lexeme:
        result.append((form.word, Morphology(form.tag).to_text()))
    return result


def normalize(text: str) -> str:
    ''' Generate normal form.
    ::returns:: normal form of input text or text itself if no parse is available '''
    model = parser.parse(text)
    if model is None:
        return text
    return model.normal_form()


def inflect(text: str, target_grams: str) -> str:
    ''' Inflect text to match required tags.
    ::returns:: infected text or initial text if infection failed '''
    target_set = split_grams(target_grams)
    model = parser.parse(text)
    if model is None:
        return text
    return model.inflect(target_set)


def inflect_context(target: str, cntxt_before: str = '', cntxt_after: str = '') -> str:
    ''' Inflect text in accordance to context before and after. '''
    return parser.inflect_context(target, cntxt_before, cntxt_after)


def inflect_substitute(substitute_normal: str, original: str) -> str:
    ''' Inflect substitute to match original form. '''
    return parser.inflect_substitute(substitute_normal, original)


def inflect_dependant(dependant_normal: str, master: str) -> str:
    ''' Inflect dependant to coordinate with master text. '''
    return parser.inflect_dependant(dependant_normal, master)


def match_all_morpho(text: str, filter_grams: str) -> list[list[int]]:
    ''' Search for all words corresponding to tags. '''
    target_set = split_grams(filter_grams)
    if len(target_set) == 0:
        return []

    result = []
    for elem in RuSyntax.tokenize(text):
        model = parser.parse(elem.text, require_grams=target_set)
        if model:
            result.append([elem.start, elem.stop])
    return result


def find_substr(text: str, sub: str) -> tuple[int, int]:
    ''' Search for substring position in text regardless of morphology. '''
    return parser.find_substr(text, sub)
