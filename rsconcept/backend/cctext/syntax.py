''' Russian language synthax incapsulation. '''
from __future__ import annotations
from enum import Enum, unique

from razdel import tokenize


@unique
class Capitalization(Enum):
    ''' Enumerating capitalization types. '''
    unknwn = 0
    lower_case = 1
    upper_case = 2
    first_capital = 3
    mixed = 4

    @staticmethod
    def from_text(text: str) -> Capitalization:
        ''' Fabric method to identify capitalization in text. '''
        if len(text) == 0:
            return Capitalization.unknwn
        first_capital = Capitalization._is_capital(text[0])
        has_mid_capital = False
        has_lower = not first_capital
        for symbol in text[1:]:
            if Capitalization._is_capital(symbol):
                if has_lower:
                    return Capitalization.mixed
                has_mid_capital = True
            else:
                if has_mid_capital:
                    return Capitalization.mixed
                else:
                    has_lower = True
        if has_mid_capital:
            return Capitalization.upper_case
        elif first_capital:
            return Capitalization.first_capital
        else:
            return Capitalization.lower_case

    def apply_to(self, text: str) -> str:
        ''' Apply capitalization to text. '''
        if not text or self in [Capitalization.unknwn, Capitalization.mixed]:
            return text
        elif self == Capitalization.lower_case:
            return text.lower()
        elif self == Capitalization.upper_case:
            return text.upper()
        else:
            return text[0].upper() + text[1:]

    @staticmethod
    def _is_capital(symbol: str) -> bool:
        return 'А' <= symbol <= 'Я' or 'A' <= symbol <= 'Z'


class RuSyntax:
    ''' Russian language synthax parser. '''
    def __init__(self):
        pass

    def __del__(self):
        pass

    @staticmethod
    def is_single_word(text: str) -> bool:
        ''' Test if text is a single word. '''
        try:
            gen = tokenize(text)
            return next(gen) == '' or next(gen) == ''
        except StopIteration:
            return True

    @staticmethod
    def tokenize(text: str):
        ''' Split text into words. Returns list[(start, stop, text)]. '''
        return tokenize(text)

    @staticmethod
    def split_words(text: str) -> list[str]:
        ''' Split text into words. '''
        return [elem.text for elem in tokenize(text)]
