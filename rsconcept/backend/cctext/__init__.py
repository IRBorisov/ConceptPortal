'''Concept core text processing library'''
from .syntax import RuSyntax, Capitalization
from .rumodel import Morphology, SemanticRole, NamedEntityRole, WordTag, morpho
from .ruparser import RuParser, WordToken, Collation

from .conceptapi import (
    parse, normalize,
    get_all_forms, inflect, inflect_context, inflect_substitute, inflect_dependant,
    match_all_morpho, find_substr,
    split_tags
)
