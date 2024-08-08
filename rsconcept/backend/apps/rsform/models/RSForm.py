''' Models: RSForm API. '''
from copy import deepcopy
from typing import Iterable, Optional, cast

from cctext import Entity, Resolver, TermForm, extract_entities, split_grams
from django.core.exceptions import ValidationError
from django.db.models import QuerySet

from apps.library.models import LibraryItem, LibraryItemType, Version
from shared import messages as msg

from ..graph import Graph
from .api_RSLanguage import (
    extract_globals,
    generate_structure,
    get_type_prefix,
    guess_type,
    infer_template,
    is_base_set,
    is_functional,
    is_simple_expression,
    split_template
)
from .Constituenta import Constituenta, CstType

_INSERT_LAST: int = -1


class RSForm:
    ''' RSForm is math form of conceptual schema. '''

    class Cache:
        ''' Cache for RSForm constituents. '''

        def __init__(self, schema: 'RSForm'):
            self._schema = schema
            self.constituents: list[Constituenta] = []
            self.by_id: dict[int, Constituenta] = {}
            self.by_alias: dict[str, Constituenta] = {}
            self.is_loaded = False

        def reload(self) -> None:
            self.constituents = list(
                self._schema.constituents().only(
                    'order',
                    'alias',
                    'cst_type',
                    'definition_formal',
                    'term_raw',
                    'definition_raw'
                ).order_by('order')
            )
            self.by_id = {cst.pk: cst for cst in self.constituents}
            self.by_alias = {cst.alias: cst for cst in self.constituents}
            self.is_loaded = True

        def ensure(self) -> None:
            if not self.is_loaded:
                self.reload()

        def clear(self) -> None:
            self.constituents = []
            self.by_id = {}
            self.by_alias = {}
            self.is_loaded = False

        def insert(self, cst: Constituenta) -> None:
            if self.is_loaded:
                self.constituents.insert(cst.order - 1, cst)
                self.by_id[cst.pk] = cst
                self.by_alias[cst.alias] = cst

        def insert_multi(self, items: Iterable[Constituenta]) -> None:
            if self.is_loaded:
                for cst in items:
                    self.constituents.insert(cst.order - 1, cst)
                    self.by_id[cst.pk] = cst
                    self.by_alias[cst.alias] = cst

        def remove(self, target: Constituenta) -> None:
            if self.is_loaded:
                self.constituents.remove(self.by_id[target.pk])
                del self.by_id[target.pk]
                del self.by_alias[target.alias]

        def remove_multi(self, target: Iterable[Constituenta]) -> None:
            if self.is_loaded:
                for cst in target:
                    self.constituents.remove(self.by_id[cst.pk])
                    del self.by_id[cst.pk]
                    del self.by_alias[cst.alias]


    def __init__(self, model: LibraryItem):
        self.model = model
        self.cache: RSForm.Cache = RSForm.Cache(self)

    @staticmethod
    def create(**kwargs) -> 'RSForm':
        ''' Create LibraryItem via RSForm. '''
        model = LibraryItem.objects.create(item_type=LibraryItemType.RSFORM, **kwargs)
        return RSForm(model)

    @staticmethod
    def from_id(pk: int) -> 'RSForm':
        ''' Get LibraryItem by pk. '''
        model = LibraryItem.objects.get(pk=pk)
        return RSForm(model)

    def save(self, *args, **kwargs) -> None:
        ''' Model wrapper. '''
        self.model.save(*args, **kwargs)

    def refresh_from_db(self) -> None:
        ''' Model wrapper. '''
        self.model.refresh_from_db()

    def constituents(self) -> QuerySet[Constituenta]:
        ''' Get QuerySet containing all constituents of current RSForm. '''
        return Constituenta.objects.filter(schema=self.model)

    def resolver(self) -> Resolver:
        ''' Create resolver for text references based on schema terms. '''
        result = Resolver({})
        for cst in self.constituents().only('alias', 'term_resolved', 'term_forms'):
            entity = Entity(
                alias=cst.alias,
                nominal=cst.term_resolved,
                manual_forms=[
                    TermForm(text=form['text'], grams=split_grams(form['tags']))
                    for form in cst.term_forms
                ]
            )
            result.context[cst.alias] = entity
        return result

    def semantic(self) -> 'SemanticInfo':
        ''' Access semantic information on constituents. '''
        return SemanticInfo(self)

    def on_term_change(self, changed: list[int]) -> None:
        ''' Trigger cascade resolutions when term changes. '''
        self.cache.ensure()
        graph_terms = self._graph_term()
        expansion = graph_terms.expand_outputs(changed)
        expanded_change = changed + expansion
        update_list: list[Constituenta] = []
        resolver = self.resolver()
        if len(expansion) > 0:
            for cst_id in graph_terms.topological_order():
                if cst_id not in expansion:
                    continue
                cst = self.cache.by_id[cst_id]
                resolved = resolver.resolve(cst.term_raw)
                if resolved == resolver.context[cst.alias].get_nominal():
                    continue
                cst.set_term_resolved(resolved)
                update_list.append(cst)
                resolver.context[cst.alias] = Entity(cst.alias, resolved)
        Constituenta.objects.bulk_update(update_list, ['term_resolved'])

        graph_defs = self._graph_text()
        update_defs = set(expansion + graph_defs.expand_outputs(expanded_change)).union(changed)
        update_list = []
        if len(update_defs) == 0:
            return
        for cst_id in update_defs:
            cst = self.cache.by_id[cst_id]
            resolved = resolver.resolve(cst.definition_raw)
            cst.definition_resolved = resolved
            update_list.append(cst)
        Constituenta.objects.bulk_update(update_list, ['definition_resolved'])

    def get_max_index(self, cst_type: CstType) -> int:
        ''' Get maximum alias index for specific CstType. '''
        result: int = 0
        cst_list: Iterable[Constituenta] = []
        if not self.cache.is_loaded:
            cst_list = Constituenta.objects \
                .filter(schema=self.model, cst_type=cst_type) \
                .only('alias')
        else:
            cst_list = [cst for cst in self.cache.constituents if cst.cst_type == cst_type]
        for cst in cst_list:
            result = max(result, int(cst.alias[1:]))
        return result

    def create_cst(self, data: dict, insert_after: Optional[Constituenta] = None) -> Constituenta:
        ''' Create new cst from data. '''
        if insert_after is None:
            position = _INSERT_LAST
        else:
            position = insert_after.order + 1
        result = self.insert_new(data['alias'], data['cst_type'], position)
        result.convention = data.get('convention', '')
        result.definition_formal = data.get('definition_formal', '')
        result.term_forms = data.get('term_forms', [])
        result.term_raw = data.get('term_raw', '')
        result.definition_raw = data.get('definition_raw', '')

        if result.term_raw != '' or result.definition_raw != '':
            resolver = self.resolver()
            if result.term_raw != '':
                resolved = resolver.resolve(result.term_raw)
                result.term_resolved = resolved
                resolver.context[result.alias] = Entity(result.alias, resolved)
            if result.definition_raw != '':
                result.definition_resolved = resolver.resolve(result.definition_raw)

        result.save()
        self.cache.insert(result)
        self.on_term_change([result.pk])
        result.refresh_from_db()
        return result

    def insert_new(
        self,
        alias: str,
        cst_type: Optional[CstType] = None,
        position: int = _INSERT_LAST,
        **kwargs
    ) -> Constituenta:
        ''' Insert new constituenta at given position.
            All following constituents order is shifted by 1 position. '''
        if self.constituents().filter(alias=alias).exists():
            raise ValidationError(msg.aliasTaken(alias))
        position = self._get_insert_position(position)
        if cst_type is None:
            cst_type = guess_type(alias)
        self._shift_positions(position, 1)
        result = Constituenta.objects.create(
            schema=self.model,
            order=position,
            alias=alias,
            cst_type=cst_type,
            **kwargs
        )
        self.cache.insert(result)
        self.save()
        return result

    def insert_copy(self, items: list[Constituenta], position: int = _INSERT_LAST) -> list[Constituenta]:
        ''' Insert copy of target constituents updating references. '''
        count = len(items)
        if count == 0:
            return []

        self.cache.ensure()
        position = self._get_insert_position(position)
        self._shift_positions(position, count)

        indices: dict[str, int] = {}
        for (value, _) in CstType.choices:
            indices[value] = self.get_max_index(cast(CstType, value))

        mapping: dict[str, str] = {}
        for cst in items:
            indices[cst.cst_type] = indices[cst.cst_type] + 1
            newAlias = f'{get_type_prefix(cst.cst_type)}{indices[cst.cst_type]}'
            mapping[cst.alias] = newAlias

        result = deepcopy(items)
        for cst in result:
            cst.pk = None
            cst.schema = self.model
            cst.order = position
            cst.alias = mapping[cst.alias]
            cst.apply_mapping(mapping)
            position = position + 1

        new_cst = Constituenta.objects.bulk_create(result)
        self.cache.insert_multi(new_cst)
        self.save()
        return result

    def move_cst(self, target: list[Constituenta], destination: int) -> None:
        ''' Move list of constituents to specific position '''
        count_moved = 0
        count_top = 0
        count_bot = 0
        size = len(target)

        cst_list: Iterable[Constituenta] = []
        if not self.cache.is_loaded:
            cst_list = self.constituents().only('order').order_by('order')
        else:
            cst_list = self.cache.constituents
        for cst in cst_list:
            if cst in target:
                cst.order = destination + count_moved
                count_moved += 1
            elif count_top + 1 < destination:
                cst.order = count_top + 1
                count_top += 1
            else:
                cst.order = destination + size + count_bot
                count_bot += 1
        Constituenta.objects.bulk_update(cst_list, ['order'])
        self.save()

    def delete_cst(self, target: Iterable[Constituenta]) -> None:
        ''' Delete multiple constituents. Do not check if listCst are from this schema. '''
        self.cache.remove_multi(target)
        Constituenta.objects.filter(pk__in=[cst.pk for cst in target]).delete()
        self._reset_order()
        self.resolve_all_text()
        self.save()

    def substitute(self, substitutions: list[tuple[Constituenta, Constituenta]]) -> None:
        ''' Execute constituenta substitution. '''
        mapping = {}
        deleted: list[Constituenta] = []
        replacements: list[Constituenta] = []
        for original, substitution in substitutions:
            assert original.pk != substitution.pk
            mapping[original.alias] = substitution.alias
            deleted.append(original)
            replacements.append(substitution)
        self.cache.remove_multi(deleted)
        Constituenta.objects.filter(pk__in=[cst.pk for cst in deleted]).delete()
        self.apply_mapping(mapping)
        self.on_term_change([substitution.pk for substitution in replacements])

    def restore_order(self) -> None:
        ''' Restore order based on types and term graph. '''
        manager = _OrderManager(self)
        manager.restore_order()

    def reset_aliases(self) -> None:
        ''' Recreate all aliases based on constituents order. '''
        mapping = self._create_reset_mapping()
        self.apply_mapping(mapping, change_aliases=True)

    def _create_reset_mapping(self) -> dict[str, str]:
        bases = cast(dict[str, int], {})
        mapping = cast(dict[str, str], {})
        for cst_type in CstType.values:
            bases[cst_type] = 1
        cst_list = self.constituents().order_by('order')
        for cst in cst_list:
            alias = f'{get_type_prefix(cst.cst_type)}{bases[cst.cst_type]}'
            bases[cst.cst_type] += 1
            if cst.alias != alias:
                mapping[cst.alias] = alias
        return mapping

    def apply_mapping(self, mapping: dict[str, str], change_aliases: bool = False) -> None:
        ''' Apply rename mapping. '''
        self.cache.ensure()
        update_list: list[Constituenta] = []
        for cst in self.cache.constituents:
            if cst.apply_mapping(mapping, change_aliases):
                update_list.append(cst)
        Constituenta.objects.bulk_update(update_list, ['alias', 'definition_formal', 'term_raw', 'definition_raw'])
        self.save()

    def resolve_all_text(self) -> None:
        ''' Trigger reference resolution for all texts. '''
        self.cache.ensure()
        graph_terms = self._graph_term()
        resolver = Resolver({})
        update_list: list[Constituenta] = []
        for cst_id in graph_terms.topological_order():
            cst = self.cache.by_id[cst_id]
            resolved = resolver.resolve(cst.term_raw)
            resolver.context[cst.alias] = Entity(cst.alias, resolved)
            cst.term_resolved = resolved
            update_list.append(cst)
        Constituenta.objects.bulk_update(update_list, ['term_resolved'])

        for cst in self.cache.constituents:
            resolved = resolver.resolve(cst.definition_raw)
            cst.definition_resolved = resolved
        Constituenta.objects.bulk_update(self.cache.constituents, ['definition_resolved'])


    def create_version(self, version: str, description: str, data) -> Version:
        ''' Creates version for current state. '''
        return Version.objects.create(
            item=self.model,
            version=version,
            description=description,
            data=data
        )

    def produce_structure(self, target: Constituenta, parse: dict) -> list[int]:
        ''' Add constituents for each structural element of the target. '''
        expressions = generate_structure(
            alias=target.alias,
            expression=target.definition_formal,
            parse=parse
        )
        count_new = len(expressions)
        if count_new == 0:
            return []

        position = target.order + 1
        self.cache.ensure()
        self._shift_positions(position, count_new)
        result = []
        cst_type = CstType.TERM if len(parse['args']) == 0 else CstType.FUNCTION
        free_index = self.get_max_index(cst_type) + 1
        prefix = get_type_prefix(cst_type)
        for text in expressions:
            new_item = Constituenta.objects.create(
                schema=self.model,
                order=position,
                alias=f'{prefix}{free_index}',
                definition_formal=text,
                cst_type=cst_type
            )
            result.append(new_item.pk)
            free_index = free_index + 1
            position = position + 1

        self.cache.clear()
        self.save()
        return result

    def _shift_positions(self, start: int, shift: int) -> None:
        if shift == 0:
            return
        update_list: Iterable[Constituenta] = []
        if not self.cache.is_loaded:
            update_list = Constituenta.objects \
                .only('order') \
                .filter(schema=self.model, order__gte=start)
        else:
            update_list = [cst for cst in self.cache.constituents if cst.order >= start]
        for cst in update_list:
            cst.order += shift
        Constituenta.objects.bulk_update(update_list, ['order'])

    def _get_insert_position(self, position: int) -> int:
        if position <= 0 and position != _INSERT_LAST:
            raise ValidationError(msg.invalidPosition())
        lastPosition = self.constituents().count()
        if position == _INSERT_LAST:
            position = lastPosition + 1
        else:
            position = max(1, min(position, lastPosition + 1))
        return position

    def _reset_order(self) -> None:
        order = 1
        changed: list[Constituenta] = []
        cst_list: Iterable[Constituenta] = []
        if not self.cache.is_loaded:
            cst_list = self.constituents().only('order').order_by('order')
        else:
            cst_list = self.cache.constituents
        for cst in cst_list:
            if cst.order != order:
                cst.order = order
                changed.append(cst)
            order += 1
        Constituenta.objects.bulk_update(changed, ['order'])

    def _graph_formal(self) -> Graph[int]:
        ''' Graph based on formal definitions. '''
        self.cache.ensure()
        result: Graph[int] = Graph()
        for cst in self.cache.constituents:
            result.add_node(cst.pk)
        for cst in self.cache.constituents:
            for alias in extract_globals(cst.definition_formal):
                child = self.cache.by_alias.get(alias)
                if child is not None:
                    result.add_edge(src=child.pk, dest=cst.pk)
        return result

    def _graph_term(self) -> Graph[int]:
        ''' Graph based on term texts. '''
        self.cache.ensure()
        result: Graph[int] = Graph()
        for cst in self.cache.constituents:
            result.add_node(cst.pk)
        for cst in self.cache.constituents:
            for alias in extract_entities(cst.term_raw):
                child = self.cache.by_alias.get(alias)
                if child is not None:
                    result.add_edge(src=child.pk, dest=cst.pk)
        return result

    def _graph_text(self) -> Graph[int]:
        ''' Graph based on definition texts. '''
        self.cache.ensure()
        result: Graph[int] = Graph()
        for cst in self.cache.constituents:
            result.add_node(cst.pk)
        for cst in self.cache.constituents:
            for alias in extract_entities(cst.definition_raw):
                child = self.cache.by_alias.get(alias)
                if child is not None:
                    result.add_edge(src=child.pk, dest=cst.pk)
        return result


class SemanticInfo:
    ''' Semantic information derived from constituents. '''

    def __init__(self, schema: RSForm):
        schema.cache.ensure()
        self._graph = schema._graph_formal()
        self._items = schema.cache.constituents
        self._cst_by_ID = schema.cache.by_id
        self._cst_by_alias = schema.cache.by_alias
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
        for cst_id in self._graph.topological_order():
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

        dependencies = self._graph.inputs[target.pk]
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
            for parent_id in self._graph.inputs[target.pk]:
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
        if len(sources) == 0:
            return True
        elif len(sources) != 1:
            return False
        else:
            base = self._cst_by_ID[next(iter(sources))]
            return not is_functional(base.cst_type) or \
                split_template(base.definition_formal)['head'] != head


class _OrderManager:
    ''' Ordering helper class '''

    def __init__(self, schema: RSForm):
        self._semantic = schema.semantic()
        self._graph = schema._graph_formal()
        self._items = schema.cache.constituents
        self._cst_by_ID = schema.cache.by_id

    def restore_order(self) -> None:
        ''' Implement order restoration process. '''
        if len(self._items) <= 1:
            return
        self._fix_kernel()
        self._fix_topological()
        self._fix_semantic_children()
        self._save_order()

    def _fix_topological(self) -> None:
        sorted_ids = self._graph.sort_stable([cst.pk for cst in self._items])
        sorted_items = [next(cst for cst in self._items if cst.pk == id) for id in sorted_ids]
        self._items = sorted_items

    def _fix_kernel(self) -> None:
        result = [cst for cst in self._items if cst.cst_type == CstType.BASE]
        result = result + [cst for cst in self._items if cst.cst_type == CstType.CONSTANT]
        kernel = [
            cst.pk for cst in self._items if
            cst.cst_type in [CstType.STRUCTURED, CstType.AXIOM] or
            self._cst_by_ID[self._semantic.parent(cst.pk)].cst_type == CstType.STRUCTURED
        ]
        kernel = kernel + self._graph.expand_inputs(kernel)
        result = result + [cst for cst in self._items if result.count(cst) == 0 and cst.pk in kernel]
        result = result + [cst for cst in self._items if result.count(cst) == 0]
        self._items = result

    def _fix_semantic_children(self) -> None:
        result: list[Constituenta] = []
        marked: set[Constituenta] = set()
        for cst in self._items:
            if cst in marked:
                continue
            result.append(cst)
            children = self._semantic[cst.pk]['children']
            if len(children) == 0:
                continue
            for child in self._items:
                if child.pk in children:
                    marked.add(child)
                    result.append(child)
        self._items = result

    def _save_order(self) -> None:
        order = 1
        for cst in self._items:
            cst.order = order
            order += 1
        Constituenta.objects.bulk_update(self._items, ['order'])
