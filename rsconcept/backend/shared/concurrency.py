''' Optimistic concurrency helpers for LibraryItem mutations. '''
from datetime import datetime
from typing import Any

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


class ConcurrencyMixin:
    ''' Check ``X-Expected-Time-Update`` on unsafe methods after object lookup. '''

    def get_object(self):
        obj = super().get_object()  # type: ignore[misc]
        request = self.request  # type: ignore[attr-defined]
        if request.method.upper() in ('GET', 'HEAD', 'OPTIONS'):
            return obj
        item = library_item_from_object(obj)
        if item is not None:
            assert_expected_time_update(item, request)
        return obj
