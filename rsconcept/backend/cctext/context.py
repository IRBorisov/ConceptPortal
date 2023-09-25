''' Term context for reference resolution. '''
from typing import Iterable, Dict, Optional, TypedDict

from .ruparser import PhraseParser
from .rumodel import WordTag


parser = PhraseParser()


class TermForm(TypedDict):
    ''' Represents term in a specific form. '''
    text: str
    grams: Iterable[str]


def _match_grams(query: Iterable[str], test: Iterable[str]) -> bool:
    ''' Check if grams from test fit query. '''
    for gram in test:
        if not gram in query:
            if not gram in WordTag.PARTS_OF_SPEECH:
                return False
            for pos in WordTag.PARTS_OF_SPEECH:
                if pos in query:
                    return False
    return True


def _search_form(query: Iterable[str], data: Iterable[TermForm]) -> Optional[str]:
    for form in data:
        if _match_grams(query, form['grams']):
            return form['text']
    return None


class Entity:
    ''' Represents text entity. '''
    def __init__(self, alias: str, nominal: str, manual_forms: Optional[Iterable[TermForm]]=None):
        if manual_forms is None:
            self.manual = []
        else:
            self.manual = list(manual_forms)
        self.alias = alias
        self._nominal = nominal
        self._cached: list[TermForm] = []

    def get_nominal(self) -> str:
        ''' Getter for _nominal. '''
        return self._nominal

    def set_nominal(self, new_text: str):
        ''' Setter for _nominal.
            Note: clears manual and cached forms. '''
        if self._nominal == new_text:
            return
        self._nominal = new_text
        self.manual = []
        self._cached = []

    def get_form(self, grams: Iterable[str]) -> str:
        ''' Get specific term form. '''
        if all(False for _ in grams):
            return self._nominal
        text = _search_form(grams, self.manual)
        if text is not None:
            return text
        text = _search_form(grams, self._cached)
        if text is not None:
            return text

        model = parser.parse(self._nominal)
        if model is None:
            text = self._nominal
        else:
            try:
                text = model.inflect(grams)
            except ValueError as error:
                text = f'!{error}!'.replace('Unknown grammeme', 'Неизвестная граммема')
        self._cached.append({'text': text, 'grams': grams})
        return text


# Represents term context for resolving entity references.
TermContext = Dict[str, Entity]
