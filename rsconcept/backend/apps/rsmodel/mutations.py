''' RSModel interpretation mutations shared by the UI and the agent API. '''
from __future__ import annotations

from django.db import transaction
from rest_framework.exceptions import ValidationError
from rest_framework.request import Request

from apps.library.models import LibraryItem
from apps.rsform.models import Constituenta
from shared.concurrency import assert_expected_time_update_locked

from .models import ConstituentData, RSModel


def require_bound_schema(item: LibraryItem) -> LibraryItem:
    ''' Return the schema linked to a model item. '''
    try:
        schema = RSModel.objects.get(model=item).schema
    except RSModel.DoesNotExist as exc:
        raise ValidationError({'schema': 'Model has no schema bound'}) from exc
    if schema is None:
        raise ValidationError({'schema': 'Model has no schema bound'})
    return schema


def set_constituent_values(
    item: LibraryItem,
    bindings: list[dict],
    request: Request | None = None,
) -> None:
    ''' Upsert interpretation bindings. Each item has target, type and data. '''
    with transaction.atomic():
        _lock_expected_update(item, request)
        for binding in bindings:
            ConstituentData.objects.update_or_create(
                model=item,
                constituent=binding['target'],
                defaults={
                    'type': binding['type'],
                    'data': binding['data'],
                },
            )
        item.save(update_fields=['time_update'])


def clear_constituent_values(
    item: LibraryItem,
    constituents: list[Constituenta],
    request: Request | None = None,
) -> None:
    ''' Drop interpretation bindings for the given constituents. '''
    with transaction.atomic():
        _lock_expected_update(item, request)
        ids = [cst.pk for cst in constituents]
        ConstituentData.objects.filter(model=item, constituent_id__in=ids).delete()
        item.save(update_fields=['time_update'])


def reset_constituent_values(
    item: LibraryItem,
    request: Request | None = None,
) -> None:
    ''' Drop every interpretation binding on the model. '''
    with transaction.atomic():
        _lock_expected_update(item, request)
        ConstituentData.objects.filter(model=item).delete()
        item.save(update_fields=['time_update'])


def _lock_expected_update(item: LibraryItem, request: Request | None) -> None:
    if request is not None:
        assert_expected_time_update_locked(item, request)
