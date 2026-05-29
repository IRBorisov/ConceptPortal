''' Library context search across item and nested text fields. '''
from typing import Iterable, Optional, cast

from django.db import connection
from django.db.models import Q, QuerySet

from apps.library.models import AccessPolicy, LibraryItem, LibraryItemType, LocationHead
from apps.oss.models import Block, Operation
from apps.rsform.models import Constituenta
from apps.rsmodel.models import ConstituentData, RSModel
from apps.users.models import User

ALL_CONTEXT_FIELDS = frozenset({
    'alias',
    'title',
    'description',
    'term',
    'definition_formal',
    'definition_text',
    'convention',
    'operation',
    'block',
})


def get_accessible_items_queryset(user, *, all_items: bool = False) -> QuerySet[LibraryItem]:
    ''' Items visible to *user* (or all items for staff admin mode). '''
    if all_items:
        return LibraryItem.objects.all()
    common_location = Q(location__startswith=LocationHead.COMMON) | Q(location__startswith=LocationHead.LIBRARY)
    is_public = Q(access_policy=AccessPolicy.PUBLIC)
    if user.is_anonymous:
        return LibraryItem.objects.filter(is_public).filter(common_location)
    user = cast(User, user)
    return LibraryItem.objects.filter(
        (is_public & common_location) |
        Q(owner=user) |
        Q(editor__editor=user)
    ).distinct()


def search_library_context(
    user,
    query: str,
    *,
    fields: Optional[Iterable[str]] = None,
    all_items: bool = False
) -> list[int]:
    ''' Return library item ids whose nested text matches *query*. '''
    normalized_query = query.strip()
    if not normalized_query:
        return []

    active_fields = _normalize_fields(fields)
    if not active_fields:
        return []

    accessible = get_accessible_items_queryset(user, all_items=all_items)
    matching_ids: set[int] = set()

    item_text_fields = _library_item_text_fields(active_fields)
    if item_text_fields:
        matching_ids.update(
            _collect_matching_ids(accessible, item_text_fields, normalized_query, 'pk')
        )

    accessible_ids = list(accessible.values_list('pk', flat=True))
    if not accessible_ids:
        return sorted(matching_ids)

    cst_text_fields = _constituenta_text_fields(active_fields)
    if cst_text_fields:
        rsform_ids = accessible.filter(item_type=LibraryItemType.RSFORM).values_list('pk', flat=True)
        matching_ids.update(
            _collect_matching_ids(
                Constituenta.objects.filter(schema_id__in=rsform_ids),
                cst_text_fields,
                normalized_query,
                'schema_id'
            )
        )

        linked_schema_ids = RSModel.objects.filter(
            model_id__in=accessible_ids,
            schema_id__isnull=False
        ).values_list('schema_id', flat=True)
        accessible_linked_schema_ids = accessible.filter(
            item_type=LibraryItemType.RSFORM,
            pk__in=linked_schema_ids
        ).values_list('pk', flat=True)
        matched_schema_ids = _collect_matching_ids(
            Constituenta.objects.filter(schema_id__in=accessible_linked_schema_ids),
            cst_text_fields,
            normalized_query,
            'schema_id'
        )
        matching_ids.update(
            RSModel.objects
            .filter(model_id__in=accessible_ids, schema_id__in=matched_schema_ids)
            .values_list('model_id', flat=True)
        )

        if 'definition_text' in active_fields:
            matching_ids.update(
                _collect_matching_ids(
                    ConstituentData.objects.filter(model_id__in=accessible_ids),
                    ['type'],
                    normalized_query,
                    'model_id'
                )
            )

    oss_ids = accessible.filter(item_type=LibraryItemType.OPERATION_SCHEMA).values_list('pk', flat=True)
    if 'operation' in active_fields:
        matching_ids.update(
            _collect_matching_ids(
                Operation.objects.filter(oss_id__in=oss_ids),
                ['alias', 'title', 'description'],
                normalized_query,
                'oss_id'
            )
        )
    if 'block' in active_fields:
        matching_ids.update(
            _collect_matching_ids(
                Block.objects.filter(oss_id__in=oss_ids),
                ['title', 'description'],
                normalized_query,
                'oss_id'
            )
        )

    return sorted(matching_ids)


def _normalize_fields(fields: Optional[Iterable[str]]) -> set[str]:
    if not fields:
        return set(ALL_CONTEXT_FIELDS)
    return {field for field in fields if field in ALL_CONTEXT_FIELDS}


def _uses_python_casefold() -> bool:
    ''' SQLite upper()/lower() do not fold non-ASCII text reliably. '''
    return connection.vendor == 'sqlite'


def _collect_ids_casefold(queryset, text_fields: list[str], query: str, id_field: str) -> set[int]:
    needle = query.casefold()
    result: set[int] = set()
    only_fields = [id_field, *text_fields]
    for row in queryset.only(*only_fields).iterator():
        for field in text_fields:
            if needle in (getattr(row, field) or '').casefold():
                result.add(getattr(row, id_field))
                break
    return result


def _collect_ids_icontains(queryset, text_fields: list[str], query: str, id_field: str) -> set[int]:
    condition = Q()
    for field in text_fields:
        condition |= Q(**{f'{field}__icontains': query})
    return set(queryset.filter(condition).values_list(id_field, flat=True))


def _collect_matching_ids(queryset, text_fields: list[str], query: str, id_field: str) -> set[int]:
    if not text_fields:
        return set()
    if _uses_python_casefold():
        return _collect_ids_casefold(queryset, text_fields, query, id_field)
    return _collect_ids_icontains(queryset, text_fields, query, id_field)


def _library_item_text_fields(active_fields: set[str]) -> list[str]:
    fields: list[str] = []
    if 'alias' in active_fields:
        fields.append('alias')
    if 'title' in active_fields:
        fields.append('title')
    if 'description' in active_fields:
        fields.append('description')
    return fields


def _constituenta_text_fields(active_fields: set[str]) -> list[str]:
    fields: list[str] = []
    if 'alias' in active_fields:
        fields.append('alias')
    if 'term' in active_fields:
        fields.extend(['term_resolved', 'term_raw'])
    if 'definition_formal' in active_fields:
        fields.extend(['definition_formal', 'typification_manual'])
    if 'definition_text' in active_fields:
        fields.extend(['definition_resolved', 'definition_raw'])
    if 'convention' in active_fields:
        fields.append('convention')
    return fields
