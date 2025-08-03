''' Models: RSForm API. '''
# pylint: disable=duplicate-code

from typing import Iterable, Optional, cast

from cctext import Entity, Resolver, TermForm, split_grams
from django.core.exceptions import ValidationError
from django.db.models import QuerySet

from apps.library.models import LibraryItem, LibraryItemType, Version
from shared import messages as msg

from ..graph import Graph
from .api_RSLanguage import get_type_prefix, guess_type
from .Constituenta import Constituenta, CstType, extract_entities, extract_globals

INSERT_LAST: int = -1
DELETED_ALIAS = 'DEL'


class RSForm:
    ''' RSForm wrapper. No caching, each mutation requires querying. '''

    def __init__(self, model: LibraryItem):
        assert model.item_type == LibraryItemType.RSFORM
        self.model = model

    @staticmethod
    def create(**kwargs) -> 'RSForm':
        ''' Create LibraryItem via RSForm. '''
        model = LibraryItem.objects.create(item_type=LibraryItemType.RSFORM, **kwargs)
        return RSForm(model)

    @staticmethod
    def resolver_from_schema(schemaID: int) -> Resolver:
        ''' Create resolver for text references based on schema terms. '''
        result = Resolver({})
        constituents = Constituenta.objects.filter(schema_id=schemaID).only('alias', 'term_resolved', 'term_forms')
        for cst in constituents:
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

    @staticmethod
    def resolver_from_list(cst_list: Iterable[Constituenta]) -> Resolver:
        ''' Create resolver for text references based on list of constituents. '''
        result = Resolver({})
        for cst in cst_list:
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

    @staticmethod
    def graph_formal(cst_list: Iterable[Constituenta],
                     cst_by_alias: Optional[dict[str, Constituenta]] = None) -> Graph[int]:
        ''' Graph based on formal definitions. '''
        result: Graph[int] = Graph()
        if cst_by_alias is None:
            cst_by_alias = {cst.alias: cst for cst in cst_list}
        for cst in cst_list:
            result.add_node(cst.pk)
        for cst in cst_list:
            for alias in extract_globals(cst.definition_formal):
                child = cst_by_alias.get(alias)
                if child is not None:
                    result.add_edge(src=child.pk, dest=cst.pk)
        return result

    @staticmethod
    def graph_term(cst_list: Iterable[Constituenta],
                   cst_by_alias: Optional[dict[str, Constituenta]] = None) -> Graph[int]:
        ''' Graph based on term texts. '''
        result: Graph[int] = Graph()
        if cst_by_alias is None:
            cst_by_alias = {cst.alias: cst for cst in cst_list}
        for cst in cst_list:
            result.add_node(cst.pk)
        for cst in cst_list:
            for alias in extract_entities(cst.term_raw):
                child = cst_by_alias.get(alias)
                if child is not None:
                    result.add_edge(src=child.pk, dest=cst.pk)
        return result

    @staticmethod
    def graph_text(cst_list: Iterable[Constituenta],
                   cst_by_alias: Optional[Optional[dict[str, Constituenta]]] = None) -> Graph[int]:
        ''' Graph based on definition texts. '''
        result: Graph[int] = Graph()
        if cst_by_alias is None:
            cst_by_alias = {cst.alias: cst for cst in cst_list}
        for cst in cst_list:
            result.add_node(cst.pk)
        for cst in cst_list:
            for alias in extract_entities(cst.definition_raw):
                child = cst_by_alias.get(alias)
                if child is not None:
                    result.add_edge(src=child.pk, dest=cst.pk)
        return result

    @staticmethod
    def save_order(cst_list: Iterable[Constituenta]) -> None:
        ''' Save order for constituents list. '''
        order = 0
        changed: list[Constituenta] = []
        for cst in cst_list:
            if cst.order != order:
                cst.order = order
                changed.append(cst)
            order += 1
        Constituenta.objects.bulk_update(changed, ['order'])

    @staticmethod
    def shift_positions(start: int, shift: int, cst_list: list[Constituenta]) -> None:
        ''' Shift positions of constituents. '''
        if shift == 0:
            return
        update_list = cst_list[start:]
        for cst in update_list:
            cst.order += shift
        Constituenta.objects.bulk_update(update_list, ['order'])

    @staticmethod
    def apply_mapping(mapping: dict[str, str], cst_list: Iterable[Constituenta],
                      change_aliases: bool = False) -> None:
        ''' Apply rename mapping. '''
        update_list: list[Constituenta] = []
        for cst in cst_list:
            if cst.apply_mapping(mapping, change_aliases):
                update_list.append(cst)
        Constituenta.objects.bulk_update(update_list, ['alias', 'definition_formal', 'term_raw', 'definition_raw'])

    @staticmethod
    def resolve_term_change(cst_list: Iterable[Constituenta], changed: list[int],
                            cst_by_alias: Optional[Optional[dict[str, Constituenta]]] = None,
                            cst_by_id: Optional[Optional[dict[int, Constituenta]]] = None,
                            resolver: Optional[Resolver] = None) -> None:
        ''' Trigger cascade resolutions when term changes. '''
        if cst_by_alias is None:
            cst_by_alias = {cst.alias: cst for cst in cst_list}
        if cst_by_id is None:
            cst_by_id = {cst.pk: cst for cst in cst_list}

        graph_terms = RSForm.graph_term(cst_list, cst_by_alias)
        expansion = graph_terms.expand_outputs(changed)
        expanded_change = changed + expansion
        update_list: list[Constituenta] = []

        if resolver is None:
            resolver = RSForm.resolver_from_list(cst_list)

        if len(expansion) > 0:
            for cst_id in graph_terms.topological_order():
                if cst_id not in expansion:
                    continue
                cst = cst_by_id[cst_id]
                resolved = resolver.resolve(cst.term_raw)
                if resolved == resolver.context[cst.alias].get_nominal():
                    continue
                cst.set_term_resolved(resolved)
                update_list.append(cst)
                resolver.context[cst.alias] = Entity(cst.alias, resolved)
        Constituenta.objects.bulk_update(update_list, ['term_resolved'])

        graph_defs = RSForm.graph_text(cst_list, cst_by_alias)
        update_defs = set(expansion + graph_defs.expand_outputs(expanded_change)).union(changed)
        update_list = []
        if len(update_defs) == 0:
            return
        for cst_id in update_defs:
            cst = cst_by_id[cst_id]
            resolved = resolver.resolve(cst.definition_raw)
            cst.definition_resolved = resolved
            update_list.append(cst)
        Constituenta.objects.bulk_update(update_list, ['definition_resolved'])

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
        if Constituenta.objects.filter(schema=self.model, alias=alias).exists():
            raise ValidationError(msg.aliasTaken(alias))
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
        return result

    def move_cst(self, target: list[Constituenta], destination: int) -> None:
        ''' Move list of constituents to specific position. '''
        count_moved = 0
        count_top = 0
        count_bot = 0
        size = len(target)

        cst_list = Constituenta.objects.filter(schema=self.model).only('order').order_by('order')
        for cst in cst_list:
            if cst in target:
                cst.order = destination + count_moved
                count_moved += 1
            elif count_top < destination:
                cst.order = count_top
                count_top += 1
            else:
                cst.order = destination + size + count_bot
                count_bot += 1
        Constituenta.objects.bulk_update(cst_list, ['order'])

    def delete_cst(self, target: list[Constituenta]) -> None:
        ''' Delete multiple constituents. '''
        ids = [cst.pk for cst in target]
        mapping = {cst.alias: DELETED_ALIAS for cst in target}
        Constituenta.objects.filter(pk__in=ids).delete()
        all_cst = Constituenta.objects.filter(schema=self.model).only(
            'alias', 'definition_formal', 'term_raw', 'definition_raw', 'order'
        ).order_by('order')
        RSForm.apply_mapping(mapping, all_cst, change_aliases=False)
        RSForm.save_order(all_cst)

    def reset_aliases(self) -> None:
        ''' Recreate all aliases based on constituents order. '''
        bases = cast(dict[str, int], {})
        mapping = cast(dict[str, str], {})
        for cst_type in CstType.values:
            bases[cst_type] = 1
        cst_list = Constituenta.objects.filter(schema=self.model).only(
            'alias', 'cst_type', 'definition_formal',
            'term_raw', 'definition_raw'
        ).order_by('order')
        for cst in cst_list:
            alias = f'{get_type_prefix(cst.cst_type)}{bases[cst.cst_type]}'
            bases[cst.cst_type] += 1
            if cst.alias != alias:
                mapping[cst.alias] = alias
        RSForm.apply_mapping(mapping, cst_list, change_aliases=True)

    def substitute(self, substitutions: list[tuple[Constituenta, Constituenta]]) -> None:
        ''' Execute constituenta substitution. '''
        if len(substitutions) < 1:
            return
        mapping = {}
        deleted: list[int] = []
        replacements: list[int] = []
        for original, substitution in substitutions:
            mapping[original.alias] = substitution.alias
            deleted.append(original.pk)
            replacements.append(substitution.pk)
        Constituenta.objects.filter(pk__in=deleted).delete()
        cst_list = Constituenta.objects.filter(schema=self.model).only(
            'alias', 'cst_type', 'definition_formal',
            'term_raw', 'definition_raw', 'order', 'term_forms', 'term_resolved'
        ).order_by('order')
        RSForm.save_order(cst_list)
        RSForm.apply_mapping(mapping, cst_list, change_aliases=False)
        RSForm.resolve_term_change(cst_list, replacements)

    def create_version(self, version: str, description: str, data) -> Version:
        ''' Creates version for current state. '''
        return Version.objects.create(
            item=self.model,
            version=version,
            description=description,
            data=data
        )
