''' RSForm mutations shared by the UI and the agent API. '''
from typing import Optional, cast

from django.db import transaction

from apps.library.models import LibraryItem
from apps.oss.models import PropagationFacade

from . import models as m
from . import serializers as s


def replace_schema_content(item: LibraryItem, validated: dict) -> None:
    ''' Replace schema content from an import payload. Caller checks inheritance. '''
    with transaction.atomic():
        version_data = {
            'title': validated['title'],
            'alias': validated['alias'],
            'description': validated['description'],
            'items': validated['items'],
            'attribution': validated.get('attribution', []),
        }
        data = s.RSFormSerializer(item).to_versioned_data() | version_data
        PropagationFacade().before_delete_schema(item.pk)
        s.RSFormSerializer(item).restore_from_version(data)
        PropagationFacade().after_create_cst(
            list(m.RSFormCached(item.pk).constituentsQ().order_by('order'))
        )
        item.save(update_fields=['time_update'])


def create_constituenta(
    item: LibraryItem,
    data: dict,
    insert_after: Optional[m.Constituenta],
) -> m.Constituenta:
    ''' Create one constituenta and propagate the change. '''
    with transaction.atomic():
        propagation = PropagationFacade()
        schema = propagation.get_schema(item.pk)
        new_cst = schema.create_cst(data, insert_after)
        propagation.after_create_cst([new_cst])
        item.save(update_fields=['time_update'])
    return new_cst


def update_constituenta(item: LibraryItem, cst: m.Constituenta, data: dict) -> None:
    ''' Update persistent attributes of a constituenta and propagate the change. '''
    with transaction.atomic():
        propagation = PropagationFacade()
        schema = propagation.get_schema(item.pk)
        old_data = schema.update_cst(cst.pk, data)
        propagation.after_update_cst(item.pk, cst.pk, data, old_data)
        if 'alias' in data and data['alias'] != cst.alias:
            cst.refresh_from_db()
            changed_type = 'cst_type' in data and cst.cst_type != data['cst_type']
            mapping = {cst.alias: data['alias']}
            cst.alias = data['alias']
            if changed_type:
                cst.cst_type = data['cst_type']
            cst.save()
            schema.apply_mapping(mapping=mapping, change_aliases=False)
            if changed_type:
                propagation.after_change_cst_type(item.pk, cst.pk, cast(m.CstType, cst.cst_type))
        item.save(update_fields=['time_update'])


def delete_constituents(item: LibraryItem, cst_list: list[m.Constituenta]) -> None:
    ''' Delete constituents and propagate the change. '''
    with transaction.atomic():
        schema = m.RSForm(item)
        PropagationFacade().before_delete_cst(item.pk, [cst.pk for cst in cst_list])
        schema.delete_cst(cst_list)
        item.save(update_fields=['time_update'])


def substitute_constituents(item: LibraryItem, substitutions_data: list) -> None:
    ''' Substitute constituents and propagate the change. '''
    with transaction.atomic():
        schema = m.RSForm(item)
        substitutions: list[tuple[m.Constituenta, m.Constituenta]] = []
        for substitution in substitutions_data:
            original = cast(m.Constituenta, substitution['original'])
            replacement = cast(m.Constituenta, substitution['substitution'])
            substitutions.append((original, replacement))
        PropagationFacade().before_substitute(item.pk, substitutions)
        schema.substitute(substitutions)
        item.save(update_fields=['time_update'])


def move_constituents(item: LibraryItem, validated: dict) -> None:
    ''' Reorder constituents from a validated move payload. '''
    with transaction.atomic():
        schema = m.RSForm(item)
        schema.move_cst(target=validated['items'], destination=validated['move_to'])
        item.save(update_fields=['time_update'])
