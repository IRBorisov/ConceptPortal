''' Reference resolution API. '''
import re
from typing import cast, Optional
from dataclasses import dataclass

from .conceptapi import inflect_dependant
from .context import TermContext
from .reference import EntityReference, SyntacticReference, parse_reference, Reference


def resolve_entity(ref: EntityReference, context: TermContext) -> str:
    ''' Resolve entity reference. '''
    alias = ref.entity
    if alias not in context:
        return f'!Неизвестная сущность: {alias}!'
    resolved = context[alias].get_form(ref.form)
    if resolved == '':
        return f'!Отсутствует термин: {alias}!'
    else:
        return resolved


def resolve_syntactic(ref: SyntacticReference, index: int, allrefs: list['ResolvedReference']) -> str:
    ''' Resolve syntactic reference. '''
    offset = ref.offset
    mainref: Optional['ResolvedReference'] = None
    if offset > 0:
        index += 1
        while index < len(allrefs):
            if isinstance(allrefs[index].ref, EntityReference):
                if offset == 1:
                    mainref = allrefs[index]
                else:
                    offset -= 1
            index += 1
    else:
        index -= 1
        while index >= 0:
            if isinstance(allrefs[index].ref, EntityReference):
                if offset == -1:
                    mainref = allrefs[index]
                else:
                    offset += 1
            index -= 1
    if mainref is None:
        return f'!Некорректное смещение: {ref.offset}!'
    return inflect_dependant(ref.nominal, mainref.resolved)


@dataclass
class Position:
    ''' 0-indexed contiguous segment position in text. '''
    start: int = 0
    finish: int = 0


@dataclass
class ResolvedReference:
    ''' Resolved reference data '''
    ref: Reference
    resolved: str = ''
    pos_input: Position = Position()
    pos_output: Position = Position()


class Resolver:
    ''' Text reference resolver '''
    REFERENCE_PATTERN = re.compile(r'@{.*?}')

    def __init__(self, context: TermContext):
        self.context = context
        self.refs = cast(list[ResolvedReference], [])
        self.input = ''
        self.output = ''

    def resolve(self, text: str) -> str:
        ''' Resolve references in input text.
            Note: data on references positions is accessed through class attributes '''
        self._reset(text)
        self._parse_refs()
        if len(self.refs) == 0:
            self.output = self.input
            return self.output
        else:
            self._resolve_refs()
            self._combine_output()
            return self.output

    def _reset(self, input_text: str):
        self.refs = cast(list[ResolvedReference], [])
        self.input = input_text
        self.output = ''

    def _parse_refs(self):
        for segment in re.finditer(Resolver.REFERENCE_PATTERN, self.input):
            parse = parse_reference(segment[0])
            if parse is not None:
                ref_info = ResolvedReference(ref=parse,
                                             resolved='',
                                             pos_input=Position(segment.start(0), segment.end(0)))
                self.refs.append(ref_info)

    def _resolve_refs(self):
        for ref in self.refs:
            if isinstance(ref.ref, EntityReference):
                ref.resolved = resolve_entity(ref.ref, self.context)
        for (index, ref) in enumerate(self.refs):
            if isinstance(ref.ref, SyntacticReference):
                ref.resolved = resolve_syntactic(ref.ref, index, self.refs)

    def _combine_output(self):
        pos_in = 0
        for ref in self.refs:
            self.output += self.input[pos_in : ref.pos_input.start]
            self.output += ref.resolved
            ref.pos_output = Position(len(self.output) - len(ref.resolved), len(self.output))
            pos_in = ref.pos_input.finish
        self.output += self.input[pos_in : len(self.input)]
