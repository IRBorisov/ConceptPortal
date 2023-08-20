''' Text reference API. '''
from enum import Enum, unique
from typing import Optional, Union


@unique
class ReferenceType(Enum):
    ''' Text reference types. '''
    entity = 'entity'
    syntactic = 'syntax'


class EntityReference:
    ''' Reference to entity. '''

    def __init__(self, identifier: str, form: str):
        self.entity = identifier
        self.form = form

    def get_type(self) -> ReferenceType:
        return ReferenceType.entity

    def to_text(self) -> str:
        return f'@{{{self.entity}|{self.form}}}'


class SyntacticReference:
    ''' Reference to syntactic dependcy on EntityReference. '''

    def __init__(self, referal_offset: int, text: str):
        self.nominal = text
        self.offset = referal_offset

    def get_type(self) -> ReferenceType:
        return ReferenceType.syntactic

    def to_text(self) -> str:
        return f'@{{{self.offset}|{self.nominal}}}'


Reference = Union[EntityReference, SyntacticReference]


def parse_reference(text: str) -> Optional[Reference]:
    if len(text) < 4 or text[-1] != '}' or text[0:2] != '@{':
        return None
    blocks: list[str] = [block.strip() for block in text[2:-1].split('|')]
    if len(blocks) != 2 or blocks[0] == '' or blocks[0][0] in '0':
        return None
    if blocks[0][0] in '-123456789':
        if blocks[1] == '':
            return None
        try:
            offset = int(blocks[0])
            return SyntacticReference(offset, blocks[1])
        except ValueError:
            return None
    else:
        form = blocks[1].replace(' ', '')
        return EntityReference(blocks[0], form)
