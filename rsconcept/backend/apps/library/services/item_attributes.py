''' Persist owner-controlled library attributes.

The library UI and the agent API share these writes. ``QuerySet.update`` skips
``LibraryItem.save``, so ``time_update`` stays put — the same rule the library
endpoints already follow. An OSS update also copies the field onto result
schemas that share the owner and the current folder.
'''
from django.db import transaction

from apps.oss.models import OperationSchema

from ..models import LibraryItem, LibraryItemType


def set_item_location(item: LibraryItem, location: str) -> None:
    ''' Move the item. Owned OSS results in the same folder move with it. '''
    _set_cascaded_field(item, 'location', location)


def set_item_access_policy(item: LibraryItem, access_policy: str) -> None:
    ''' Set access policy. Owned OSS results in the same folder follow it. '''
    _set_cascaded_field(item, 'access_policy', access_policy)


def _set_cascaded_field(item: LibraryItem, field: str, value: str) -> None:
    ''' Write one field, cascading it across an OSS and its owned results.

    The row is locked and read again inside the transaction. The cascade then
    uses that folder, so a move that committed earlier is not applied on top of
    a stale copy.
    '''
    with transaction.atomic():
        try:
            locked = LibraryItem.objects.select_for_update().get(pk=item.pk)
        except LibraryItem.DoesNotExist:
            return
        if getattr(locked, field) == value:
            setattr(item, field, value)
            return
        if locked.item_type == LibraryItemType.OPERATION_SCHEMA:
            owned_schemas = OperationSchema.owned_schemasQ(locked).only(field)
            for schema in owned_schemas:
                setattr(schema, field, value)
            LibraryItem.objects.bulk_update(owned_schemas, [field])
        setattr(item, field, value)
        LibraryItem.objects.filter(pk=item.pk).update(**{field: value})
