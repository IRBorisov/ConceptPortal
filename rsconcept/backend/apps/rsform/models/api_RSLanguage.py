''' Models: Definitions and utility function for RSLanguage. '''
import json
import re
from enum import IntEnum, unique
from typing import Set, Tuple, cast

import pyconcept

from shared import messages as msg

from .Constituenta import CstType

_RE_GLOBALS = r'[XCSADFPT]\d+'  # cspell:disable-line
_RE_TEMPLATE = r'R\d+'
_RE_COMPLEX_SYMBOLS = r'[∀∃×ℬ;|:]'


@unique
class TokenType(IntEnum):
    ''' Some of grammar token types. Full list seek in frontend / pyconcept '''
    ID_GLOBAL = 259
    ID_RADICAL = 262
    DECART = 287
    BOOLEAN = 292
    BIGPR = 293
    SMALLPR = 294
    REDUCE = 299


def get_type_prefix(cst_type: CstType) -> str:
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
    return 'X'


def is_basic_concept(cst_type: CstType) -> bool:
    ''' Evaluate if CstType is basic concept.'''
    return cst_type in [
        CstType.BASE,
        CstType.CONSTANT,
        CstType.STRUCTURED,
        CstType.AXIOM
    ]


def is_base_set(cst_type: CstType) -> bool:
    ''' Evaluate if CstType is base set or constant set.'''
    return cst_type in [
        CstType.BASE,
        CstType.CONSTANT
    ]


def is_functional(cst_type: CstType) -> bool:
    ''' Evaluate if CstType is function.'''
    return cst_type in [
        CstType.FUNCTION,
        CstType.PREDICATE
    ]


def extract_globals(expression: str) -> Set[str]:
    ''' Extract all global aliases from expression. '''
    return set(re.findall(_RE_GLOBALS, expression))


def guess_type(alias: str) -> CstType:
    ''' Get CstType for alias. '''
    prefix = alias[0]
    for (value, _) in CstType.choices:
        if prefix == get_type_prefix(cast(CstType, value)):
            return cast(CstType, value)
    return CstType.BASE


def _get_structure_prefix(alias: str, expression: str, parse: dict) -> Tuple[str, str]:
    ''' Generate prefix and alias for structure generation. '''
    args = parse['args']
    if len(args) == 0:
        return (alias, '')
    prefix = expression[0:expression.find(']')] + '] '
    newAlias = alias + '[' + ','.join([arg['alias'] for arg in args]) + ']'
    return (newAlias, prefix)


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


def generate_structure(alias: str, expression: str, parse: dict) -> list:
    ''' Generate list of expressions for target structure. '''
    ast = json.loads(pyconcept.parse_expression(parse['typification']))['ast']
    if len(ast) == 0:
        raise ValueError(msg.typificationInvalidStr())
    if len(ast) == 1:
        return []
    (link, prefix) = _get_structure_prefix(alias, expression, parse)

    generated: list = []
    arity: list = [1] * len(ast)
    for (n, item) in enumerate(ast):
        if n == 0:
            generated.append({
                'text': link,  # generated text
                'operation': None,  # applied operation. None if text should be skipped
                'is_boolean': False  # is the result of operation has an additional boolean
            })
            continue

        parent_index = item['parent']
        parent_type = ast[parent_index]['typeID']
        parent_text = generated[parent_index]['text']
        parent_is_boolean = generated[parent_index]['is_boolean']
        assert parent_type in [TokenType.BOOLEAN, TokenType.DECART]

        if parent_is_boolean:
            if parent_type == TokenType.BOOLEAN:
                generated.append({
                    'text': f'red({parent_text})',
                    'operation': TokenType.REDUCE,
                    'is_boolean': True
                })
            if parent_type == TokenType.DECART:
                generated.append({
                    'text': f'Pr{arity[parent_index]}({parent_text})',
                    'operation': TokenType.BIGPR,
                    'is_boolean': True
                })
                arity[parent_index] = arity[parent_index] + 1
        else:
            if parent_type == TokenType.BOOLEAN:
                generated.append({
                    'text': parent_text,
                    'operation': None,
                    'is_boolean': True
                })
            if parent_type == TokenType.DECART:
                generated.append({
                    'text': f'pr{arity[parent_index]}({parent_text})',
                    'operation': TokenType.SMALLPR,
                    'is_boolean': False
                })
                arity[parent_index] = arity[parent_index] + 1
    return [prefix + item['text'] for item in generated if item['operation'] is not None]
