''' Models: Definitions and utility function for RSLanguage. '''
import re
from enum import IntEnum, unique
from typing import cast

from .Constituenta import CstType

_RE_TEMPLATE = r'R\d+'
_RE_COMPLEX_SYMBOLS = r'[∀∃×ℬ;|:]'


@unique
class TokenType(IntEnum):
    ''' Some of grammar token types. Full list seek in frontend '''
    ID_GLOBAL = 259
    ID_RADICAL = 262
    DECART = 287
    BOOLEAN = 292
    BIGPR = 293
    SMALLPR = 294
    REDUCE = 299


def get_type_prefix(cst_type: str) -> str:
    ''' Get alias prefix. '''
    match cst_type:
        case CstType.BASE: return 'X'
        case CstType.CONSTANT: return 'C'
        case CstType.STRUCTURED: return 'S'
        case CstType.AXIOM: return 'A'
        case CstType.TERM: return 'D'
        case CstType.FUNCTION: return 'F'
        case CstType.PREDICATE: return 'P'
        case CstType.THEOREM: return 'T'
        case CstType.NOMINAL: return 'N'
    return 'X'


def is_basic_concept(cst_type: str) -> bool:
    ''' Evaluate if CstType is basic concept.'''
    return cst_type in [
        CstType.BASE,
        CstType.CONSTANT,
        CstType.STRUCTURED,
        CstType.AXIOM
    ]


def is_base_set(cst_type: str) -> bool:
    ''' Evaluate if CstType is base set or constant set.'''
    return cst_type in [
        CstType.BASE,
        CstType.CONSTANT
    ]


def is_functional(cst_type: str) -> bool:
    ''' Evaluate if CstType is function.'''
    return cst_type in [
        CstType.FUNCTION,
        CstType.PREDICATE
    ]


def guess_type(alias: str) -> CstType:
    ''' Get CstType for alias. '''
    prefix = alias[0]
    for (value, _) in CstType.choices:
        if prefix == get_type_prefix(value):
            return cast(CstType, value)
    return CstType.BASE


def infer_template(expression: str) -> bool:
    ''' Checks if given expression is a template. '''
    return bool(re.search(_RE_TEMPLATE, expression))


def is_simple_expression(expression: str) -> bool:
    ''' Checks if given expression is "simple". '''
    return not bool(re.search(_RE_COMPLEX_SYMBOLS, expression))


def split_template(expression: str):
    ''' Splits a string containing a template definition into its head and body parts. '''
    start = 0
    for index, char in enumerate(expression):
        start = index
        if char == '[':
            break
    if start < len(expression):
        counter = 0
        for end in range(start + 1, len(expression)):
            if expression[end] == '[':
                counter += 1
            elif expression[end] == ']':
                if counter != 0:
                    counter -= 1
                else:
                    return {
                        'head': expression[start + 1:end].strip(),
                        'body': expression[end + 1:].strip()
                    }
    return {
        'head': '',
        'body': expression
    }
