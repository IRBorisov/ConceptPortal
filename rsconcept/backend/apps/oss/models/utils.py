''' Utils for OSS models. '''

from typing import Optional

from cctext import extract_entities

from apps.rsform.models import (
    DELETED_ALIAS,
    Constituenta,
    RSFormCached,
    extract_globals,
    replace_entities,
    replace_globals
)

CstMapping = dict[str, Optional[Constituenta]]
CstSubstitution = list[tuple[Constituenta, Constituenta]]


def cst_mapping_to_alias(mapping: CstMapping) -> dict[str, str]:
    ''' Convert constituenta mapping to alias mapping. '''
    result: dict[str, str] = {}
    for alias, cst in mapping.items():
        if cst is None:
            result[alias] = DELETED_ALIAS
        else:
            result[alias] = cst.alias
    return result


def map_cst_update_data(cst: Constituenta, data: dict, old_data: dict, mapping: dict[str, str]) -> dict:
    ''' Map data for constituenta update. '''
    new_data = {}
    if 'term_forms' in data:
        if old_data['term_forms'] == cst.term_forms:
            new_data['term_forms'] = data['term_forms']
    if 'convention' in data:
        new_data['convention'] = data['convention']
    if 'definition_formal' in data:
        new_data['definition_formal'] = replace_globals(data['definition_formal'], mapping)
    if 'term_raw' in data:
        if replace_entities(old_data['term_raw'], mapping) == cst.term_raw:
            new_data['term_raw'] = replace_entities(data['term_raw'], mapping)
    if 'definition_raw' in data:
        if replace_entities(old_data['definition_raw'], mapping) == cst.definition_raw:
            new_data['definition_raw'] = replace_entities(data['definition_raw'], mapping)
    return new_data


def extract_data_references(data: dict, old_data: dict) -> set[str]:
    ''' Extract references from data. '''
    result: set[str] = set()
    if 'definition_formal' in data:
        result.update(extract_globals(data['definition_formal']))
        result.update(extract_globals(old_data['definition_formal']))
    if 'term_raw' in data:
        result.update(extract_entities(data['term_raw']))
        result.update(extract_entities(old_data['term_raw']))
    if 'definition_raw' in data:
        result.update(extract_entities(data['definition_raw']))
        result.update(extract_entities(old_data['definition_raw']))
    return result


def create_dependant_mapping(source: RSFormCached, cst_list: list[Constituenta]) -> CstMapping:
    ''' Create mapping for dependant Constituents. '''
    if len(cst_list) == len(source.cache.constituents):
        return {c.alias: c for c in source.cache.constituents}
    inserted_aliases = [cst.alias for cst in cst_list]
    depend_aliases: set[str] = set()
    for item in cst_list:
        depend_aliases.update(item.extract_references())
    depend_aliases.difference_update(inserted_aliases)
    alias_mapping: CstMapping = {}
    for alias in depend_aliases:
        cst = source.cache.by_alias.get(alias)
        if cst is not None:
            alias_mapping[alias] = cst
    return alias_mapping
