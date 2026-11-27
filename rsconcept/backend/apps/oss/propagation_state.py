''' State shared by the existing cascade and the projection batch. '''
from contextvars import ContextVar

from apps.library.models import LibraryItem

changed_schemas: ContextVar[set[int] | None] = ContextVar('oss_projection_batch', default=None)


def mark_schema(schema_id: int) -> None:
    ''' Record affected inputs while the normal OSS cascade is running. '''
    work = changed_schemas.get()
    if work is not None:
        work.add(schema_id)


def touch_schema(schema_id: int) -> None:
    ''' Bump the revision and schedule refresh after propagated content changes. '''
    LibraryItem.objects.get(pk=schema_id).save(update_fields=['time_update'])
    mark_schema(schema_id)
