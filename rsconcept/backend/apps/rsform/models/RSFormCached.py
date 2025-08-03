''' Models: RSForm API. '''
# pylint: disable=duplicate-code

from copy import deepcopy
from typing import Iterable, Optional, cast

from cctext import Entity, Resolver
from django.core.exceptions import ValidationError
from django.db.models import QuerySet

from apps.library.models import LibraryItem, LibraryItemType
from shared import messages as msg

from .api_RSLanguage import generate_structure, get_type_prefix, guess_type
from .Constituenta import Constituenta, CstType
from .RSForm import DELETED_ALIAS, INSERT_LAST, RSForm


class RSFormCached:
    ''' RSForm cached. Caching allows to avoid querying for each method call. '''

    def __init__(self, model: LibraryItem):
        self.model = model
        self.cache: _RSFormCache = _RSFormCache(self)

    @staticmethod
    def create(**kwargs) -> 'RSFormCached':
        ''' Create LibraryItem via RSForm. '''
        model = LibraryItem.objects.create(item_type=LibraryItemType.RSFORM, **kwargs)
        return RSFormCached(model)

    @staticmethod
    def from_id(pk: int) -> 'RSFormCached':
        ''' Get LibraryItem by pk. '''
        model = LibraryItem.objects.get(pk=pk)
        return RSFormCached(model)

    def get_dependant(self, target: Iterable[int]) -> set[int]:
        ''' Get list of constituents depending on target (only 1st degree). '''
        self.cache.ensure_loaded()
        result: set[int] = set()
        terms = RSForm.graph_term(self.cache.constituents, self.cache.by_alias)
        formal = RSForm.graph_formal(self.cache.constituents, self.cache.by_alias)
        definitions = RSForm.graph_text(self.cache.constituents, self.cache.by_alias)
        for cst_id in target:
            result.update(formal.outputs[cst_id])
            result.update(terms.outputs[cst_id])
            result.update(definitions.outputs[cst_id])
        return result

    def constituentsQ(self) -> QuerySet[Constituenta]:
        ''' Get QuerySet containing all constituents of current RSForm. '''
        return Constituenta.objects.filter(schema=self.model)

    def insert_last(
        self,
        alias: str,
        cst_type: Optional[CstType] = None,
        **kwargs
    ) -> Constituenta:
        ''' Insert new constituenta at last position. '''
        if cst_type is None:
            cst_type = guess_type(alias)
        position = Constituenta.objects.filter(schema=self.model).count()
        result = Constituenta.objects.create(
            schema=self.model,
            order=position,
            alias=alias,
            cst_type=cst_type,
            **kwargs
        )
        self.cache.is_loaded = False
        return result

    def create_cst(self, data: dict, insert_after: Optional[Constituenta] = None) -> Constituenta:
        ''' Create constituenta from data. '''
        self.cache.ensure_loaded_terms()
        if insert_after is not None:
            position = self.cache.by_id[insert_after.pk].order + 1
        else:
            position = len(self.cache.constituents)
        RSForm.shift_positions(position, 1, self.cache.constituents)

        result = Constituenta.objects.create(
            schema=self.model,
            order=position,
            alias=data['alias'],
            cst_type=data['cst_type'],
            crucial=data.get('crucial', False),
            convention=data.get('convention', ''),
            definition_formal=data.get('definition_formal', ''),
            term_forms=data.get('term_forms', []),
            term_raw=data.get('term_raw', ''),
            definition_raw=data.get('definition_raw', '')
        )

        if result.term_raw != '' or result.definition_raw != '':
            resolver = RSForm.resolver_from_list(self.cache.constituents)
            if result.term_raw != '':
                resolved = resolver.resolve(result.term_raw)
                result.term_resolved = resolved
                resolver.context[result.alias] = Entity(result.alias, resolved)
            if result.definition_raw != '':
                result.definition_resolved = resolver.resolve(result.definition_raw)

        result.save()
        self.cache.insert(result)
        RSForm.resolve_term_change(self.cache.constituents, [result.pk], self.cache.by_alias, self.cache.by_id)
        return result

    def insert_copy(
        self,
        items: list[Constituenta],
        position: int = INSERT_LAST,
        initial_mapping: Optional[dict[str, str]] = None
    ) -> list[Constituenta]:
        ''' Insert copy of target constituents updating references. '''
        count = len(items)
        if count == 0:
            return []

        self.cache.ensure_loaded()
        lastPosition = len(self.cache.constituents)
        if position == INSERT_LAST:
            position = lastPosition
        else:
            position = max(0, min(position, lastPosition))
        RSForm.shift_positions(position, count, self.cache.constituents)

        indices: dict[str, int] = {}
        for (value, _) in CstType.choices:
            indices[value] = -1

        mapping: dict[str, str] = initial_mapping.copy() if initial_mapping else {}
        for cst in items:
            if indices[cst.cst_type] == -1:
                indices[cst.cst_type] = self._get_max_index(cst.cst_type)
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
        return result

    # pylint: disable=too-many-branches
    def update_cst(self, target: int, data: dict) -> dict:
        ''' Update persistent attributes of a given constituenta. Return old values. '''
        self.cache.ensure_loaded_terms()
        cst = self.cache.by_id.get(target)
        if cst is None:
            raise ValidationError(msg.constituentaNotInRSform(str(target)))

        old_data = {}
        term_changed = False
        if 'convention' in data:
            if cst.convention == data['convention']:
                del data['convention']
            else:
                old_data['convention'] = cst.convention
                cst.convention = data['convention']
        if 'crucial' in data:
            cst.crucial = data['crucial']
            del data['crucial']
        if 'definition_formal' in data:
            if cst.definition_formal == data['definition_formal']:
                del data['definition_formal']
            else:
                old_data['definition_formal'] = cst.definition_formal
                cst.definition_formal = data['definition_formal']
        if 'term_forms' in data:
            term_changed = True
            old_data['term_forms'] = cst.term_forms
            cst.term_forms = data['term_forms']

        resolver: Optional[Resolver] = None
        if 'definition_raw' in data or 'term_raw' in data:
            resolver = RSForm.resolver_from_list(self.cache.constituents)
            if 'term_raw' in data:
                if cst.term_raw == data['term_raw']:
                    del data['term_raw']
                else:
                    term_changed = True
                    old_data['term_raw'] = cst.term_raw
                    cst.term_raw = data['term_raw']
                    cst.term_resolved = resolver.resolve(cst.term_raw)
                    if 'term_forms' not in data:
                        cst.term_forms = []
                    resolver.context[cst.alias] = Entity(cst.alias, cst.term_resolved, manual_forms=cst.term_forms)
            if 'definition_raw' in data:
                if cst.definition_raw == data['definition_raw']:
                    del data['definition_raw']
                else:
                    old_data['definition_raw'] = cst.definition_raw
                    cst.definition_raw = data['definition_raw']
                    cst.definition_resolved = resolver.resolve(cst.definition_raw)
        cst.save()
        if term_changed:
            RSForm.resolve_term_change(
                self.cache.constituents, [cst.pk],
                self.cache.by_alias, self.cache.by_id, resolver
            )
        return old_data

    def delete_cst(self, target: list[int]) -> None:
        ''' Delete multiple constituents. '''
        self.cache.ensure_loaded()
        cst_list = [self.cache.by_id[cst_id] for cst_id in target]
        mapping = {cst.alias: DELETED_ALIAS for cst in cst_list}
        self.cache.remove_multi(cst_list)
        self.apply_mapping(mapping)
        Constituenta.objects.filter(pk__in=target).delete()
        RSForm.save_order(self.cache.constituents)

    def substitute(self, substitutions: list[tuple[Constituenta, Constituenta]]) -> None:
        ''' Execute constituenta substitution. '''
        if len(substitutions) < 1:
            return
        self.cache.ensure_loaded_terms()
        mapping = {}
        deleted: list[Constituenta] = []
        replacements: list[int] = []
        for original, substitution in substitutions:
            mapping[original.alias] = substitution.alias
            deleted.append(original)
            replacements.append(substitution.pk)
        self.cache.remove_multi(deleted)
        Constituenta.objects.filter(pk__in=[cst.pk for cst in deleted]).delete()
        RSForm.save_order(self.cache.constituents)
        self.apply_mapping(mapping)
        RSForm.resolve_term_change(self.cache.constituents, replacements, self.cache.by_alias, self.cache.by_id)

    def reset_aliases(self) -> None:
        ''' Recreate all aliases based on constituents order. '''
        self.cache.ensure_loaded()
        bases = cast(dict[str, int], {})
        mapping = cast(dict[str, str], {})
        for cst_type in CstType.values:
            bases[cst_type] = 1
        for cst in self.cache.constituents:
            alias = f'{get_type_prefix(cst.cst_type)}{bases[cst.cst_type]}'
            bases[cst.cst_type] += 1
            if cst.alias != alias:
                mapping[cst.alias] = alias
        self.apply_mapping(mapping, change_aliases=True)

    def change_cst_type(self, target: int, new_type: CstType) -> bool:
        ''' Change type of constituenta generating alias automatically. '''
        self.cache.ensure_loaded()
        cst = self.cache.by_id.get(target)
        if cst is None:
            return False
        newAlias = f'{get_type_prefix(new_type)}{self._get_max_index(new_type) + 1}'
        mapping = {cst.alias: newAlias}
        cst.cst_type = new_type
        cst.alias = newAlias
        cst.save(update_fields=['cst_type', 'alias'])
        self.apply_mapping(mapping)
        return True

    def apply_mapping(self, mapping: dict[str, str], change_aliases: bool = False) -> None:
        ''' Apply rename mapping. '''
        self.cache.ensure_loaded()
        RSForm.apply_mapping(mapping, self.cache.constituents, change_aliases)
        if change_aliases:
            self.cache.reload_aliases()

    def apply_partial_mapping(self, mapping: dict[str, str], target: list[int]) -> None:
        ''' Apply rename mapping to target constituents. '''
        self.cache.ensure_loaded()
        update_list: list[Constituenta] = []
        for cst in self.cache.constituents:
            if cst.pk in target:
                if cst.apply_mapping(mapping):
                    update_list.append(cst)
        Constituenta.objects.bulk_update(update_list, ['definition_formal', 'term_raw', 'definition_raw'])

    def resolve_all_text(self) -> None:
        ''' Trigger reference resolution for all texts. '''
        self.cache.ensure_loaded()
        graph_terms = RSForm.graph_term(self.cache.constituents, self.cache.by_alias)
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


    def produce_structure(self, target: Constituenta, parse: dict) -> list[Constituenta]:
        ''' Add constituents for each structural element of the target. '''
        expressions = generate_structure(
            alias=target.alias,
            expression=target.definition_formal,
            parse=parse
        )
        count_new = len(expressions)
        if count_new == 0:
            return []

        self.cache.ensure_loaded()
        position = self.cache.constituents.index(self.cache.by_id[target.id]) + 1
        RSForm.shift_positions(position, count_new, self.cache.constituents)

        result = []
        cst_type = CstType.TERM if len(parse['args']) == 0 else CstType.FUNCTION
        free_index = self._get_max_index(cst_type) + 1
        prefix = get_type_prefix(cst_type)
        for text in expressions:
            new_item = Constituenta.objects.create(
                schema=self.model,
                order=position,
                alias=f'{prefix}{free_index}',
                definition_formal=text,
                cst_type=cst_type
            )
            result.append(new_item)
            free_index = free_index + 1
            position = position + 1

        self.cache.insert_multi(result)
        return result

    def _get_max_index(self, cst_type: str) -> int:
        ''' Get maximum alias index for specific CstType. '''
        cst_list: Iterable[Constituenta] = []
        if not self.cache.is_loaded:
            cst_list = Constituenta.objects \
                .filter(schema=self.model, cst_type=cst_type) \
                .only('alias')
        else:
            cst_list = [cst for cst in self.cache.constituents if cst.cst_type == cst_type]

        result: int = 0
        for cst in cst_list:
            result = max(result, int(cst.alias[1:]))
        return result


class _RSFormCache:
    ''' Cache for RSForm constituents. '''

    def __init__(self, schema: 'RSFormCached'):
        self._schema = schema
        self.constituents: list[Constituenta] = []
        self.by_id: dict[int, Constituenta] = {}
        self.by_alias: dict[str, Constituenta] = {}
        self.is_loaded = False
        self.is_loaded_terms = False

    def ensure_loaded(self) -> None:
        if not self.is_loaded:
            self.constituents = list(
                self._schema.constituentsQ().only(
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
            self.is_loaded_terms = False

    def ensure_loaded_terms(self) -> None:
        if not self.is_loaded_terms:
            self.constituents = list(
                self._schema.constituentsQ().only(
                    'order',
                    'alias',
                    'cst_type',
                    'definition_formal',
                    'term_raw',
                    'definition_raw',
                    'term_forms',
                    'term_resolved'
                ).order_by('order')
            )
            self.by_id = {cst.pk: cst for cst in self.constituents}
            self.by_alias = {cst.alias: cst for cst in self.constituents}
            self.is_loaded = True
            self.is_loaded_terms = True

    def reload_aliases(self) -> None:
        self.by_alias = {cst.alias: cst for cst in self.constituents}

    def clear(self) -> None:
        self.constituents = []
        self.by_id = {}
        self.by_alias = {}
        self.is_loaded = False
        self.is_loaded_terms = False

    def insert(self, cst: Constituenta) -> None:
        if self.is_loaded:
            self.constituents.insert(cst.order, cst)
            self.by_id[cst.pk] = cst
            self.by_alias[cst.alias] = cst

    def insert_multi(self, items: Iterable[Constituenta]) -> None:
        if self.is_loaded:
            for cst in items:
                self.constituents.insert(cst.order, cst)
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
