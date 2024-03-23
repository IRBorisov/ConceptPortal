''' Models: Definitions and utility function for RSLanguage. '''
import json
from typing import Tuple, cast
from enum import IntEnum , unique

from django.db.models import TextChoices

import pyconcept

from .. import messages as msg


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


class CstType(TextChoices):
    ''' Type of constituenta '''
    BASE = 'basic'
    CONSTANT = 'constant'
    STRUCTURED = 'structure'
    AXIOM = 'axiom'
    TERM = 'term'
    FUNCTION = 'function'
    PREDICATE = 'predicate'
    THEOREM = 'theorem'


def get_type_prefix(cst_type: CstType) -> str:
    ''' Get alias prefix. '''
    if cst_type == CstType.BASE:
        return 'X'
    if cst_type == CstType.CONSTANT:
        return 'C'
    if cst_type == CstType.STRUCTURED:
        return 'S'
    if cst_type == CstType.AXIOM:
        return 'A'
    if cst_type == CstType.TERM:
        return 'D'
    if cst_type == CstType.FUNCTION:
        return 'F'
    if cst_type == CstType.PREDICATE:
        return 'P'
    if cst_type == CstType.THEOREM:
        return 'T'
    return 'X'

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
                'text': link, # generated text
                'operation': None, # applied operation. None if text should be skipped
                'is_boolean': False # is the result of operation has an additional boolean
            })
            continue

        parent_index = item['parent']
        parent_type = ast[parent_index]['typeID']
        parent_text = generated[parent_index]['text']
        parent_is_boolean = generated[parent_index]['is_boolean']
        assert(parent_type in [TokenType.BOOLEAN, TokenType.DECART])

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
