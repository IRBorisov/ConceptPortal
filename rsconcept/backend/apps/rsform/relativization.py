''' Calculate a relativization from the stored source schema. '''
import json
import logging
import subprocess
from typing import cast

from django.conf import settings
from django.core.exceptions import PermissionDenied as DjangoPermissionDenied
from django.db import transaction
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.request import Request

from apps.library.models import AccessPolicy, LibraryItem, LocationHead
from apps.library.services.location_access import assert_can_write_location
from shared import messages as msg
from shared import permissions
from shared.concurrency import Conflict

from .models import Attribution, Constituenta
from .serializers.io_files import create_rsform_from_data

logger = logging.getLogger(__name__)
TEXT_FIELDS = ('term_raw', 'definition_raw', 'convention')
EDITABLE_TEXT_FIELDS = (*TEXT_FIELDS, 'term_forms')
ITEM_FIELDS = (
    'alias', 'convention', 'crucial', 'cst_type', 'definition_formal', 'definition_raw',
    'definition_resolved', 'term_raw', 'term_resolved', 'term_forms', 'typification_manual', 'value_is_property',
)


def calculate_projection(source_id: int, parameters: dict, *, unavailable_field: str = 'source_operation') -> dict:
    ''' Use the same pure calculator for creation and refresh. '''
    items = list(Constituenta.objects.filter(schema_id=source_id).order_by('order').values('id', *ITEM_FIELDS))
    attribution = [
        {'container': container, 'attribute': attribute}
        for container, attribute in Attribution.objects.filter(container__schema_id=source_id)
        .order_by('pk').values_list('container_id', 'attribute_id')
    ]
    payload = {'source': {'items': items, 'attribution': attribution}, 'options': {
        'target': parameters['target'],
        'excluded': parameters['excluded'],
        'locale': parameters['locale'],
        'contextName': parameters['context_name'],
    }}
    script = settings.BASE_DIR / 'build' / 'model-types' / 'relativization.mjs'
    try:
        result = subprocess.run(
            ['node', str(script)], input=json.dumps(payload).encode('utf-8'),
            capture_output=True, check=True, timeout=15,
        )
        draft = json.loads(result.stdout)
    except (OSError, subprocess.SubprocessError, ValueError) as exc:
        logger.error('Relativization calculation failed for schema %s (%s)', source_id, type(exc).__name__)
        raise ValidationError({unavailable_field: 'Relativization calculation is unavailable.'}) from exc
    if draft is None:
        raise ValidationError({
            'target': 'Choose a valid base set or structure and distinct eligible exclusions.',
        })
    return cast(dict, draft)


def parameters_from(data: dict) -> dict:
    ''' Store operation parameters independently from the display passport. '''
    return {name: data[name] for name in ('target', 'excluded', 'locale', 'context_name')}


def require_valid_projection(draft: dict) -> None:
    ''' Reject regressions that the second formal analysis found in the projection. '''
    invalid = {row['id'] for row in draft['proposals'] if row['formalInvalid']}
    if invalid:
        names = ', '.join(item['alias'] for item in draft['items'] if item['id'] in invalid)
        raise ValidationError({'projection': f'The projected definitions or types are invalid: {names}.'})


def _lock_source(item: LibraryItem, data: dict, request: Request) -> LibraryItem:
    source = LibraryItem.objects.select_for_update().filter(pk=item.pk).first()
    if source is None:
        raise NotFound()
    if not permissions.can_read_library_item(request.user, source):
        raise PermissionDenied()
    if source.time_update != data['source_time_update']:
        raise Conflict(detail=msg.concurrentModification())
    return source


@transaction.atomic
def create_standalone_relativization(item: LibraryItem, data: dict, request: Request) -> LibraryItem:
    ''' Recompute the projection and save an independent result schema. '''
    source = _lock_source(item, data, request)
    parameters = parameters_from(data)
    draft = calculate_projection(source.pk, parameters, unavailable_field='projection')
    require_valid_projection(draft)

    location = source.location if source.owner_id == request.user.pk else LocationHead.USER
    if location == LocationHead.LIBRARY:
        location = LocationHead.USER
    try:
        assert_can_write_location(request.user, location)
    except DjangoPermissionDenied:
        location = LocationHead.USER
    access_policy = source.access_policy
    if access_policy == AccessPolicy.PUBLIC:
        source_ids = permissions.source_schema_ids({source.pk})
        if LibraryItem.objects.filter(pk__in=source_ids).exclude(access_policy=AccessPolicy.PUBLIC).exists():
            access_policy = AccessPolicy.PRIVATE
    result, _ = create_rsform_from_data(
        item_data=data['item_data'] | {'access_policy': access_policy, 'location': location},
        schema_data=draft,
        owner=request.user,
    )
    return LibraryItem.objects.get(pk=result.pk)
