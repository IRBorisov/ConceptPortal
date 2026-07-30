''' Optimistic concurrency helpers for LibraryItem mutations. '''
from datetime import datetime
from typing import Any

from django.db import transaction
from django.utils.dateparse import parse_datetime
from rest_framework.exceptions import APIException, ValidationError
from rest_framework.request import Request

from apps.library.models import LibraryItem
from shared import messages as msg

EXPECTED_TIME_UPDATE_HEADER = 'X-Expected-Time-Update'


class Conflict(APIException):
    ''' HTTP 409 Conflict. '''
    status_code = 409
    default_detail = 'Conflict.'
    default_code = 'conflict'


def _extract_expected_timestamp(request: Request) -> str | None:
    ''' Read expected ``time_update`` from header or request body. '''
    expected = request.headers.get(EXPECTED_TIME_UPDATE_HEADER)
    if expected:
        return expected.strip() or None
    data = getattr(request, 'data', None)
    if isinstance(data, dict):
        value = data.get('expected_time_update')
        if isinstance(value, str) and value.strip():
            return value.strip()
    return None


def _normalize_datetime(value: datetime | str) -> datetime:
    ''' Parse a datetime or ISO string; raise ``ValidationError`` if invalid. '''
    if isinstance(value, datetime):
        return value
    parsed = parse_datetime(value.replace('Z', '+00:00') if isinstance(value, str) else value)
    if parsed is None:
        raise ValidationError({'expected_time_update': 'Invalid timestamp'})
    return parsed


def assert_expected_time_update(item: LibraryItem, request: Request) -> None:
    ''' Reject stale writes when the client supplies an expected ``time_update``.

    Absence of the header/field is allowed for backward compatibility; when present
    and mismatched, raise HTTP 409.
    '''
    expected_raw = _extract_expected_timestamp(request)
    if not expected_raw:
        return
    try:
        expected = _normalize_datetime(expected_raw)
    except ValidationError:
        raise
    except Exception as exc:  # pylint: disable=broad-exception-caught
        raise ValidationError({'expected_time_update': 'Invalid timestamp'}) from exc

    actual = item.time_update
    if actual is None:
        return
    if expected != actual:
        raise Conflict(detail=msg.concurrentModification())


def library_item_from_object(obj: Any) -> LibraryItem | None:
    ''' Resolve a LibraryItem from common view ``get_object`` results. '''
    if isinstance(obj, LibraryItem):
        return obj
    item = getattr(obj, 'item', None)
    if isinstance(item, LibraryItem):
        return item
    schema = getattr(obj, 'schema', None)
    if isinstance(schema, LibraryItem):
        return schema
    return None


def assert_expected_time_update_locked(item: LibraryItem, request: Request) -> None:
    ''' Re-check concurrency token under row lock. Call inside ``transaction.atomic``. '''
    locked = LibraryItem.objects.select_for_update().only('pk', 'time_update').get(pk=item.pk)
    assert_expected_time_update(locked, request)


class ConcurrencyMixin:
    ''' Check ``X-Expected-Time-Update`` on unsafe methods after object lookup.

    ``get_object`` fails fast on stale tokens. ``perform_update`` re-checks under
    ``select_for_update`` in the write transaction so concurrent ModelViewSet
    updates cannot both pass and overwrite each other. Custom ``@action``
    endpoints that mutate outside ``perform_update`` should call
    ``assert_expected_time_update_locked`` inside their own atomic block when
    stronger guarantees are required.
    '''

    def get_object(self):
        ''' Return the object; on unsafe methods, reject stale concurrency tokens. '''
        obj = super().get_object()  # type: ignore[misc]
        request = self.request  # type: ignore[attr-defined]
        if request.method.upper() in ('GET', 'HEAD', 'OPTIONS'):
            return obj
        item = library_item_from_object(obj)
        if item is not None:
            # Re-read token from DB; in-memory instances can be stale.
            fresh = LibraryItem.objects.only('pk', 'time_update').filter(pk=item.pk).first()
            if fresh is not None:
                assert_expected_time_update(fresh, request)
        return obj

    def perform_update(self, serializer):
        ''' Save under row lock after re-checking the concurrency token. '''
        request = self.request  # type: ignore[attr-defined]
        with transaction.atomic():
            item = library_item_from_object(serializer.instance)
            if item is not None:
                assert_expected_time_update_locked(item, request)
            return super().perform_update(serializer)  # type: ignore[misc]
