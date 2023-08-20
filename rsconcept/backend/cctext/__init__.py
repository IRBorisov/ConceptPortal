''' Concept core text processing library. '''
# pylint: skip-file
from .syntax import RuSyntax, Capitalization
from .rumodel import Morphology, SemanticRole, WordTag, morpho, split_grams, combine_grams
from .ruparser import PhraseParser, WordToken, Collation
from .reference import EntityReference, ReferenceType, SyntacticReference, parse_reference
from .context import TermForm, Entity, TermContext
from .resolver import Position, Resolver, ResolvedReference, resolve_entity, resolve_syntactic

from .conceptapi import (
    parse, normalize,
    get_all_forms, inflect, inflect_context, inflect_substitute, inflect_dependant,
    match_all_morpho, find_substr
)

# TODO: implement Part of speech transition for VERB <-> NOUN
