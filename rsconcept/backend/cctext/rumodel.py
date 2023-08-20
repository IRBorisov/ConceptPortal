''' Russian language models. '''
from __future__ import annotations
from enum import Enum, unique
from typing import Iterable, Optional

from pymorphy2 import MorphAnalyzer
from pymorphy2.tagset import OpencorporaTag as WordTag

# ''' Morphology parser. '''
morpho = MorphAnalyzer()


def split_tags(text: str) -> list[str]:
    ''' Split grammemes string into set of items. '''
    return [tag.strip() for tag in filter(None, text.split(','))]


def combine_tags(tags: Iterable[str]) -> str:
    ''' Combine grammemes into string. '''
    return ','.join(tags)


@unique
class SemanticRole(Enum):
    ''' Enumerating semantic types for different parse patterns. '''
    unknwn = 0
    term = 1
    action = 2
    definition = 3

    @staticmethod
    def from_POS(pos: Optional[str]) -> SemanticRole:
        ''' Production method: types from part of speech. '''
        if pos in ['NOUN', 'NPRO']:
            return SemanticRole.term
        elif pos in ['VERB', 'INFN', 'PRTF', 'PRTS']:
            return SemanticRole.action
        elif pos in ['ADJF', 'ADJS']:
            return SemanticRole.definition
        return SemanticRole.unknwn


class Morphology:
    ''' Wrapper for OpencorporaTag expanding functionality for multiword.
        Full morphology tags see http://opencorpora.org/dict.php?act=gram
    '''
    def __init__(self, tag: WordTag, semantic=SemanticRole.unknwn):
        self.tag = tag
        self.semantic = semantic if semantic != SemanticRole.unknwn else SemanticRole.from_POS(tag.POS)

    _TAGS_IMMUTABLE = frozenset(['INFN', 'ADVB', 'COMP', 'PNCT', 'PREP', 'CONJ', 'PRCL', 'INTJ'])

    _TAGS_NO_TENSE = frozenset(['NOUN', 'NPRO', 'ADJF', 'ADJS'])
    _TAGS_NO_CASE = frozenset(['GRND', 'VERB', 'ADJS', 'PRTS'])
    _TAGS_NO_NUMBER = frozenset(['GRND'])
    _TAGS_NO_GENDER = frozenset(['GRND', 'NOUN', 'NPRO', 'plur'])
    _TAGS_NO_PERSON = frozenset(['GRND', 'NOUN', 'ADJF', 'ADJS', 'PRTF', 'PRTS', 'past'])

    @property
    def can_coordinate(self) -> bool:
        ''' Check if coordination can change text. '''
        return self.tag.POS in ['NOUN', 'NPRO', 'NUMR', 'ADJF', 'ADJS', 'PRTF', 'PRTS']

    @staticmethod
    def is_dependable(pos: str):
        ''' Check if this morphology can be dependant. '''
        return pos in ['ADJF', 'ADJS', 'PRTF', 'PRTS']

    @property
    def effective_POS(self) -> Optional[str]:
        ''' Access part of speech. Pronouns are considered as nouns '''
        pos: Optional[str] = self.tag.POS
        if pos and self.tag.POS == 'NPRO':
            return 'NOUN'
        return pos

    def complete_tags(self, tags: Iterable[str]) -> set[str]:
        ''' Add missing tags before inflection. '''
        result = set(tags)
        pos = self.tag.POS
        if pos and result.isdisjoint(WordTag.PARTS_OF_SPEECH):
            result.add(pos if pos != 'INFN' or len(result) == 0 else 'VERB')
        if not result.isdisjoint(self._TAGS_IMMUTABLE):
            return result
        if self.tag.case and result.isdisjoint(WordTag.CASES) and result.isdisjoint(self._TAGS_NO_CASE):
            result.add(self.tag.case)
        if self.tag.tense and result.isdisjoint(WordTag.TENSES) and result.isdisjoint(self._TAGS_NO_TENSE):
            if (self.tag.tense != 'past' or result.isdisjoint(WordTag.PERSONS)) \
                    and (self.tag.tense != 'pres' or result.isdisjoint(WordTag.GENDERS)):
                result.add(self.tag.tense)
        if self.tag.number and result.isdisjoint(WordTag.NUMBERS) and result.isdisjoint(self._TAGS_NO_NUMBER):
            if self.tag.number != 'plur' or result.isdisjoint(WordTag.GENDERS):
                result.add(self.tag.number)
        if self.tag.gender and result.isdisjoint(WordTag.GENDERS) and result.isdisjoint(self._TAGS_NO_GENDER):
            if 'PRTF' in result or 'pres' not in result:
                result.add(self.tag.gender)
        if self.tag.person and result.isdisjoint(WordTag.PERSONS) and result.isdisjoint(self._TAGS_NO_PERSON):
            result.add(self.tag.person)
        if 'plur' in result and not result.isdisjoint(WordTag.GENDERS):
            result = result.difference(WordTag.GENDERS)
        return result

    def coordination_tags(self) -> set[str]:
        ''' Return set of grammemes for inflection to keep coordination . '''
        result = set()
        if self.tag.case:
            result.add(self.tag.case)
        if self.tag:
            number = self.tag.number
            result.add(number)
        if self.tag.gender and 'plur' not in result:
            result.add(self.tag.gender)
        return result

    def to_text(self) -> str:
        ''' Produce string of all grammemes. '''
        return combine_tags(self.tag.grammemes)
