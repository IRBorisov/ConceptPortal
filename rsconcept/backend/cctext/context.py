''' Term context for reference resolution. '''
from typing import Iterable, Dict, Optional
from dataclasses import dataclass

from .conceptapi import inflect


@dataclass
class TermForm:
    ''' Term in a specific form. '''
    text: str
    form: str


def _search_form(query: str, data: Iterable[TermForm]) -> Optional[str]:
    for tf in data:
        if tf.form == query:
            return tf.text
    return None


class Entity:
    ''' Text entity. '''
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

    def get_form(self, form: str) -> str:
        ''' Get specific term form. '''
        if form == '':
            return self._nominal
        text = _search_form(form, self.manual)
        if text is None:
            text = _search_form(form, self._cached)
            if text is None:
                try:
                    text = inflect(self._nominal, form)
                except ValueError as error:
                    text = f'!{error}!'.replace('Unknown grammeme', 'Неизвестная граммема')
                self._cached.append(TermForm(text=text, form=form))
        return text

# Term context for resolving entity references.
TermContext = Dict[str, Entity]
