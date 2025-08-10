''' Models: RSForm semantic information. '''
from typing import cast

from .api_RSLanguage import (
    infer_template,
    is_base_set,
    is_functional,
    is_simple_expression,
    split_template
)
from .Constituenta import Constituenta, CstType, extract_globals
from .RSForm import RSForm
from .RSFormCached import RSFormCached


class SemanticInfo:
    ''' Semantic information derived from constituents. '''

    def __init__(self, schema: RSFormCached):
        schema.cache.ensure_loaded()
        self._items = schema.cache.constituents
        self._cst_by_ID = schema.cache.by_id
        self._cst_by_alias = schema.cache.by_alias
        self.graph = RSForm.graph_formal(schema.cache.constituents, schema.cache.by_alias)
        self.info = {
            cst.pk: {
                'is_simple': False,
                'is_template': False,
                'parent': cst.pk,
                'children': []
            }
            for cst in schema.cache.constituents
        }
        self._calculate_attributes()

    def __getitem__(self, key: int) -> dict:
        return self.info[key]

    def is_simple_expression(self, target: int) -> bool:
        ''' Access "is_simple" attribute. '''
        return cast(bool, self.info[target]['is_simple'])

    def is_template(self, target: int) -> bool:
        ''' Access "is_template" attribute. '''
        return cast(bool, self.info[target]['is_template'])

    def parent(self, target: int) -> int:
        ''' Access "parent" attribute. '''
        return cast(int, self.info[target]['parent'])

    def children(self, target: int) -> list[int]:
        ''' Access "children" attribute. '''
        return cast(list[int], self.info[target]['children'])

    def _calculate_attributes(self) -> None:
        for cst_id in self.graph.topological_order():
            cst = self._cst_by_ID[cst_id]
            self.info[cst_id]['is_template'] = infer_template(cst.definition_formal)
            self.info[cst_id]['is_simple'] = self._infer_simple_expression(cst)
            if not self.info[cst_id]['is_simple'] or cst.cst_type == CstType.STRUCTURED:
                continue
            parent = self._infer_parent(cst)
            self.info[cst_id]['parent'] = parent
            if parent != cst_id:
                cast(list[int], self.info[parent]['children']).append(cst_id)

    def _infer_simple_expression(self, target: Constituenta) -> bool:
        if target.cst_type == CstType.STRUCTURED or is_base_set(target.cst_type):
            return False

        dependencies = self.graph.inputs[target.pk]
        has_complex_dependency = any(
            self.is_template(cst_id) and
            not self.is_simple_expression(cst_id) for cst_id in dependencies
        )
        if has_complex_dependency:
            return False

        if is_functional(target.cst_type):
            return is_simple_expression(split_template(target.definition_formal)['body'])
        else:
            return is_simple_expression(target.definition_formal)

    def _infer_parent(self, target: Constituenta) -> int:
        sources = self._extract_sources(target)
        if len(sources) != 1:
            return target.pk

        parent_id = next(iter(sources))
        parent = self._cst_by_ID[parent_id]
        if is_base_set(parent.cst_type):
            return target.pk
        return parent_id

    def _extract_sources(self, target: Constituenta) -> set[int]:
        sources: set[int] = set()
        if not is_functional(target.cst_type):
            for parent_id in self.graph.inputs[target.pk]:
                parent_info = self[parent_id]
                if not parent_info['is_template'] or not parent_info['is_simple']:
                    sources.add(parent_info['parent'])
            return sources

        expression = split_template(target.definition_formal)
        body_dependencies = extract_globals(expression['body'])
        for alias in body_dependencies:
            parent = self._cst_by_alias.get(alias)
            if not parent:
                continue

            parent_info = self[parent.pk]
            if not parent_info['is_template'] or not parent_info['is_simple']:
                sources.add(parent_info['parent'])

        if self._need_check_head(sources, expression['head']):
            head_dependencies = extract_globals(expression['head'])
            for alias in head_dependencies:
                parent = self._cst_by_alias.get(alias)
                if not parent:
                    continue

                parent_info = self[parent.pk]
                if not is_base_set(parent.cst_type) and \
                        (not parent_info['is_template'] or not parent_info['is_simple']):
                    sources.add(parent_info['parent'])
        return sources

    def _need_check_head(self, sources: set[int], head: str) -> bool:
        if not sources:
            return True
        elif len(sources) != 1:
            return False
        else:
            base = self._cst_by_ID[next(iter(sources))]
            return not is_functional(base.cst_type) or \
                split_template(base.definition_formal)['head'] != head
