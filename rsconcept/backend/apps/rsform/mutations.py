''' RSForm mutations shared by the UI and the agent API. '''
from typing import Optional, cast

from django.db import transaction
from django.db.models import F
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.request import Request

from apps.library.models import LibraryItem
from apps.oss.models import Inheritance, Operation, OperationType, PropagationFacade
from apps.oss.propagation_batch import propagation_batch
from apps.oss.propagation_state import mark_schema
from shared import permissions
from shared.concurrency import assert_expected_time_update

from . import models as m
from . import serializers as s


def _lock_schema(item: LibraryItem, request: Request | None = None) -> None:
    ''' Acquire a write lock before checking the current ACL and schema revision. '''
    locked = LibraryItem.objects.filter(pk=item.pk).update(time_update=F('time_update'))
    if not locked:
        raise NotFound()
    if request is None:
        return
    item.refresh_from_db()
    if not permissions.can_edit_item(request.user, item):
        raise PermissionDenied()
    assert_expected_time_update(item, request)


def _managed_operation(schema_id: int) -> Operation | None:
    return Operation.objects.filter(
        result_id=schema_id, operation_type=OperationType.RELATIVIZATION, projection__isnull=False,
    ).first()


def _require_own_constituents(ids: list[int], schema_id: int | None = None) -> None:
    if Inheritance.objects.filter(child_id__in=ids).exists():
        raise ValidationError('The constituent is inherited; edit its source schema.')
    operation = _managed_operation(schema_id) if schema_id is not None else None
    if operation and operation.projection and any(row['result'] in ids for row in operation.projection['rows']):
        raise ValidationError('The constituent is managed by relativization; edit its source or parameters.')


def import_empty_schema(item: LibraryItem, validated: dict, request: Request) -> None:
    ''' Legacy agent import can initialize an empty schema owned by the caller. '''
    with transaction.atomic():
        _lock_schema(item, request)
        if item.owner_id != request.user.pk:
            raise PermissionDenied('Initial import requires ownership of the schema.')
        if m.Constituenta.objects.filter(schema=item).exists():
            raise PermissionDenied('Use guarded publication to replace an existing schema.')
        replace_schema_content(item, validated)


@propagation_batch
def replace_schema_content(item: LibraryItem, validated: dict) -> None:
    ''' Replace schema content from an import payload. Caller checks inheritance. '''
    with transaction.atomic():
        # Serialize schema writers before touching constituent rows (also on SQLite).
        _lock_schema(item)
        version_data = {
            'title': validated['title'],
            'alias': validated['alias'],
            'description': validated['description'],
            'items': validated['items'],
            'attribution': validated.get('attribution', []),
        }
        data = s.RSFormSerializer(item).to_versioned_data() | version_data
        if _managed_operation(item.pk):
            raise ValidationError('The schema is managed by relativization.')
        PropagationFacade().before_delete_schema(item.pk)
        s.RSFormSerializer(item).restore_from_version(data)
        PropagationFacade().after_create_cst(
            list(m.RSFormCached(item.pk).constituentsQ().order_by('order'))
        )
        item.save(update_fields=['time_update'])


@propagation_batch
def create_constituenta(
    item: LibraryItem,
    data: dict,
    insert_after: Optional[m.Constituenta],
    request: Request | None = None,
) -> m.Constituenta:
    ''' Create one constituenta and propagate the change. '''
    with transaction.atomic():
        _lock_schema(item, request)
        propagation = PropagationFacade()
        schema = propagation.get_schema(item.pk)
        new_cst = schema.create_cst(data, insert_after)
        propagation.after_create_cst([new_cst])
        item.save(update_fields=['time_update'])
    return new_cst


@propagation_batch
def update_constituenta(
    item: LibraryItem, cst: m.Constituenta, data: dict, request: Request | None = None,
    *, allow_inherited: bool = False,
) -> None:
    ''' Update persistent attributes of a constituenta and propagate the change. '''
    with transaction.atomic():
        _lock_schema(item, request)
        if request is not None:
            if not allow_inherited:
                _require_own_constituents([cst.pk])
            managed = _managed_operation(item.pk)
            managed_rows = (managed.projection or {}).get('rows', []) if managed else []
            managed_row = next((row for row in managed_rows if row['result'] == cst.pk), None)
            formal_fields = ('alias', 'cst_type', 'definition_formal', 'typification_manual', 'value_is_property')
            if managed_row and any(field in data and data[field] != getattr(cst, field) for field in formal_fields):
                raise ValidationError('Edit managed definitions and types in the source or operation parameters.')
            try:
                cst.refresh_from_db()
            except m.Constituenta.DoesNotExist as exc:
                raise NotFound() from exc
        propagation = PropagationFacade()
        schema = propagation.get_schema(item.pk)
        old_data = schema.update_cst(cst.pk, data)
        if request is not None and managed and managed_row:
            fields = {'term_raw', 'definition_raw', 'convention'}.intersection(old_data)
            if fields:
                updated = schema.cache.by_id[cst.pk]
                managed_row['confirmed'].update({field: getattr(updated, field) for field in fields})
                managed.save(update_fields=['projection'])
        propagation.after_update_cst(item.pk, cst.pk, data, old_data)
        type_changed = 'cst_type' in data and data['cst_type'] != cst.cst_type
        alias_changed = 'alias' in data and data['alias'] != cst.alias
        if alias_changed:
            cst.refresh_from_db()
            mapping = {cst.alias: data['alias']}
            cst.alias = data['alias']
            if type_changed:
                cst.cst_type = data['cst_type']
            cst.save()
            schema.apply_mapping(mapping=mapping, change_aliases=False)
            if type_changed:
                propagation.after_change_cst_type(item.pk, cst.pk, cast(m.CstType, cst.cst_type))
        elif type_changed:
            new_type = cast(m.CstType, data['cst_type'])
            if schema.change_cst_type(cst.pk, new_type):
                propagation.after_change_cst_type(item.pk, cst.pk, new_type)
        item.save(update_fields=['time_update'])


@propagation_batch
def delete_constituents(
    item: LibraryItem, cst_list: list[m.Constituenta], request: Request | None = None,
) -> None:
    ''' Delete constituents and propagate the change. '''
    with transaction.atomic():
        _lock_schema(item, request)
        ids = [cst.pk for cst in cst_list]
        if request is not None:
            _require_own_constituents(ids, item.pk)
        schema = m.RSForm(item)
        PropagationFacade().before_delete_cst(item.pk, ids)
        schema.delete_cst(cst_list)
        item.save(update_fields=['time_update'])


@propagation_batch
def substitute_constituents(
    item: LibraryItem, substitutions_data: list, request: Request | None = None,
) -> None:
    ''' Substitute constituents and propagate the change. '''
    with transaction.atomic():
        _lock_schema(item, request)
        schema = m.RSForm(item)
        substitutions: list[tuple[m.Constituenta, m.Constituenta]] = []
        for substitution in substitutions_data:
            original = cast(m.Constituenta, substitution['original'])
            replacement = cast(m.Constituenta, substitution['substitution'])
            substitutions.append((original, replacement))
        if request is not None:
            _require_own_constituents([original.pk for original, _ in substitutions], item.pk)
        PropagationFacade().before_substitute(item.pk, substitutions)
        schema.substitute(substitutions)
        item.save(update_fields=['time_update'])


@propagation_batch
def move_constituents(item: LibraryItem, validated: dict, request: Request | None = None) -> None:
    ''' Reorder constituents from a validated move payload. '''
    with transaction.atomic():
        _lock_schema(item, request)
        if request is not None:
            _require_own_constituents([cst.pk for cst in validated['items']])
        schema = m.RSForm(item)
        schema.move_cst(target=validated['items'], destination=validated['move_to'])
        mark_schema(item.pk)
        item.save(update_fields=['time_update'])
