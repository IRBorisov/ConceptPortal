''' Models: RSForm API. '''
from typing import Dict, Iterable, Optional, cast

from django.db import transaction
from django.db.models import QuerySet
from django.core.exceptions import ValidationError

from cctext import Resolver, Entity, extract_entities, split_grams, TermForm
from .api_RSLanguage import get_type_prefix, generate_structure
from .LibraryItem import LibraryItem, LibraryItemType
from .Constituenta import CstType, Constituenta
from .Version import Version

from ..graph import Graph
from .. import messages as msg


_INSERT_LAST: int = -1


class RSForm:
    ''' RSForm is math form of conceptual schema. '''
    def __init__(self, item: LibraryItem):
        if item.item_type != LibraryItemType.RSFORM:
            raise ValueError(msg.libraryTypeUnexpected())
        self.item = item

    @staticmethod
    def create(**kwargs) -> 'RSForm':
        return RSForm(LibraryItem.objects.create(item_type=LibraryItemType.RSFORM, **kwargs))

    def constituents(self) -> QuerySet['Constituenta']:
        ''' Get QuerySet containing all constituents of current RSForm. '''
        return Constituenta.objects.filter(schema=self.item)

    def resolver(self) -> Resolver:
        ''' Create resolver for text references based on schema terms. '''
        result = Resolver({})
        for cst in self.constituents():
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

    @transaction.atomic
    def on_term_change(self, changed: Iterable[str]):
        ''' Trigger cascade resolutions when term changes. '''
        graph_terms = self._term_graph()
        expansion = graph_terms.expand_outputs(changed)
        resolver = self.resolver()
        if len(expansion) > 0:
            for alias in graph_terms.topological_order():
                if alias not in expansion:
                    continue
                cst = self.constituents().get(alias=alias)
                resolved = resolver.resolve(cst.term_raw)
                if resolved == cst.term_resolved:
                    continue
                cst.set_term_resolved(resolved)
                cst.save()
                resolver.context[cst.alias] = Entity(cst.alias, resolved)

        graph_defs = self._definition_graph()
        update_defs = set(expansion + graph_defs.expand_outputs(expansion)).union(changed)
        if len(update_defs) == 0:
            return
        for alias in update_defs:
            cst = self.constituents().get(alias=alias)
            resolved = resolver.resolve(cst.definition_raw)
            if resolved == cst.definition_resolved:
                continue
            cst.definition_resolved = resolved
            cst.save()

    def get_max_index(self, cst_type: CstType) -> int:
        ''' Get maximum alias index for specific CstType '''
        result: int = 0
        items = Constituenta.objects \
            .filter(schema=self.item, cst_type=cst_type) \
            .order_by('-alias') \
            .values_list('alias', flat=True)
        for alias in items:
            result = max(result, int(alias[1:]))
        return result

    @transaction.atomic
    def insert_new(self, alias: str, insert_type: CstType, position: int = _INSERT_LAST) -> Constituenta:
        ''' Insert new constituenta at given position.
            All following constituents order is shifted by 1 position. '''
        if self.constituents().filter(alias=alias).exists():
            raise ValidationError(msg.aliasTaken(alias))
        position = self._get_insert_position(position)
        self._shift_positions(position, 1)
        result = Constituenta.objects.create(
            schema=self.item,
            order=position,
            alias=alias,
            cst_type=insert_type
        )
        self.item.save()
        result.refresh_from_db()
        return result

    @transaction.atomic
    def insert_copy(self, items: list[Constituenta], position: int = _INSERT_LAST) -> list[Constituenta]:
        ''' Insert copy of target constituents updating references. '''
        count = len(items)
        if count == 0:
            return []

        position = self._get_insert_position(position)
        self._shift_positions(position, count)

        indices: Dict[str, int] = {}
        for (value, _) in CstType.choices:
            indices[value] = self.get_max_index(cast(CstType, value))

        mapping: Dict[str, str]  = {}
        for cst in items:
            indices[cst.cst_type] = indices[cst.cst_type] + 1
            newAlias = f'{get_type_prefix(cst.cst_type)}{indices[cst.cst_type]}'
            mapping[cst.alias] = newAlias

        result: list[Constituenta] = []
        for cst in items:
            newCst = Constituenta.objects.create(
                schema=self.item,
                order=position,
                alias=mapping[cst.alias],
                cst_type=cst.cst_type,
                convention=cst.convention,
                term_raw=cst.term_raw,
                term_resolved=cst.term_resolved,
                term_forms=cst.term_forms,
                definition_raw=cst.definition_raw,
                definition_formal=cst.definition_formal,
                definition_resolved=cst.definition_resolved
            )
            newCst.apply_mapping(mapping)
            newCst.save()
            position = position + 1
            result.append(newCst)
        self.item.save()
        return result

    @transaction.atomic
    def move_cst(self, listCst: list[Constituenta], target: int):
        ''' Move list of constituents to specific position '''
        count_moved = 0
        count_top = 0
        count_bot = 0
        size = len(listCst)
        update_list = []
        for cst in self.constituents().only('id', 'order').order_by('order'):
            if cst not in listCst:
                if count_top + 1 < target:
                    cst.order = count_top + 1
                    count_top += 1
                else:
                    cst.order = target + size + count_bot
                    count_bot += 1
            else:
                cst.order = target + count_moved
                count_moved += 1
            update_list.append(cst)
        Constituenta.objects.bulk_update(update_list, ['order'])
        self.item.save()

    @transaction.atomic
    def delete_cst(self, listCst):
        ''' Delete multiple constituents. Do not check if listCst are from this schema. '''
        for cst in listCst:
            cst.delete()
        self._reset_order()
        self.resolve_all_text()
        self.item.save()

    @transaction.atomic
    def create_cst(self, data: dict, insert_after: Optional[str]=None) -> Constituenta:
        ''' Create new cst from data. '''
        resolver = self.resolver()
        cst = self._insert_new(data, insert_after)
        cst.convention = data.get('convention', '')
        cst.definition_formal = data.get('definition_formal', '')
        cst.term_forms = data.get('term_forms', [])
        cst.term_raw = data.get('term_raw', '')
        if cst.term_raw != '':
            resolved = resolver.resolve(cst.term_raw)
            cst.term_resolved = resolved
            resolver.context[cst.alias] = Entity(cst.alias, resolved)
        cst.definition_raw = data.get('definition_raw', '')
        if cst.definition_raw != '':
            cst.definition_resolved = resolver.resolve(cst.definition_raw)
        cst.save()
        self.on_term_change([cst.alias])
        cst.refresh_from_db()
        return cst

    @transaction.atomic
    def substitute(
        self,
        original: Constituenta,
        substitution: Constituenta,
        transfer_term: bool
    ):
        ''' Execute constituenta substitution. '''
        assert original.pk != substitution.pk
        mapping = { original.alias: substitution.alias }
        self.apply_mapping(mapping)
        if transfer_term:
            substitution.term_raw = original.term_raw
            substitution.term_forms = original.term_forms
            substitution.term_resolved = original.term_resolved
            substitution.save()
        original.delete()
        self.on_term_change([substitution.alias])

    def reset_aliases(self):
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

    @transaction.atomic
    def apply_mapping(self, mapping: dict[str, str], change_aliases: bool = False):
        ''' Apply rename mapping. '''
        cst_list = self.constituents().order_by('order')
        for cst in cst_list:
            if cst.apply_mapping(mapping, change_aliases):
                cst.save()

    @transaction.atomic
    def resolve_all_text(self):
        ''' Trigger reference resolution for all texts. '''
        graph_terms = self._term_graph()
        resolver = Resolver({})
        for alias in graph_terms.topological_order():
            cst = self.constituents().get(alias=alias)
            resolved = resolver.resolve(cst.term_raw)
            resolver.context[cst.alias] = Entity(cst.alias, resolved)
            if resolved != cst.term_resolved:
                cst.term_resolved = resolved
                cst.save()
        for cst in self.constituents():
            resolved = resolver.resolve(cst.definition_raw)
            if resolved != cst.definition_resolved:
                cst.definition_resolved = resolved
                cst.save()

    @transaction.atomic
    def create_version(self, version: str, description: str, data) -> Version:
        ''' Creates version for current state. '''
        return Version.objects.create(
            item=self.item,
            version=version,
            description=description,
            data=data
        )

    @transaction.atomic
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
        self._shift_positions(position, count_new)

        result = []
        cst_type = CstType.TERM if len(parse['args']) == 0 else CstType.FUNCTION
        free_index = self.get_max_index(cst_type) + 1
        prefix = get_type_prefix(cst_type)
        for text in expressions:
            new_item = Constituenta.objects.create(
                schema=self.item,
                order=position,
                alias=f'{prefix}{free_index}',
                definition_formal=text,
                cst_type=cst_type
            )
            result.append(new_item.id)
            free_index = free_index + 1
            position = position + 1

        self.item.save()
        return result

    def _shift_positions(self, start: int, shift: int):
        if shift == 0:
            return
        update_list = \
            Constituenta.objects \
                .only('id', 'order', 'schema') \
                .filter(schema=self.item, order__gte=start)
        for cst in update_list:
            cst.order += shift
        Constituenta.objects.bulk_update(update_list, ['order'])

    def _get_last_position(self):
        if self.constituents().exists():
            return self.constituents().count()
        else:
            return 0

    def _get_insert_position(self, position: int) -> int:
        if position <= 0 and position != _INSERT_LAST:
            raise ValidationError(msg.invalidPosition())
        lastPosition = self._get_last_position()
        if position == _INSERT_LAST:
            position = lastPosition + 1
        else:
            position =  max(1, min(position, lastPosition + 1))
        return position

    @transaction.atomic
    def _reset_order(self):
        order = 1
        for cst in self.constituents().only('id', 'order').order_by('order'):
            if cst.order != order:
                cst.order = order
                cst.save()
            order += 1

    def _insert_new(self, data: dict, insert_after: Optional[str]=None) -> Constituenta:
        if insert_after is not None:
            cst_after = Constituenta.objects.get(pk=insert_after)
            return self.insert_new(data['alias'], data['cst_type'], cst_after.order + 1)
        else:
            return self.insert_new(data['alias'], data['cst_type'])

    def _term_graph(self) -> Graph:
        result = Graph()
        cst_list = \
            self.constituents() \
                .only('order', 'alias', 'term_raw') \
                .order_by('order')
        for cst in cst_list:
            result.add_node(cst.alias)
        for cst in cst_list:
            for alias in extract_entities(cst.term_raw):
                if result.contains(alias):
                    result.add_edge(id_from=alias, id_to=cst.alias)
        return result

    def _definition_graph(self) -> Graph:
        result = Graph()
        cst_list = \
            self.constituents() \
                .only('order', 'alias', 'definition_raw') \
                .order_by('order')
        for cst in cst_list:
            result.add_node(cst.alias)
        for cst in cst_list:
            for alias in extract_entities(cst.definition_raw):
                if result.contains(alias):
                    result.add_edge(id_from=alias, id_to=cst.alias)
        return result
