''' Calculate and review a relativization from the stored source schema. '''
import json
import logging
import subprocess
from hashlib import sha256
from typing import cast

from django.conf import settings
from django.db import transaction
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.request import Request

from apps.library.models import AccessPolicy, LibraryItem, LocationHead
from shared import messages as msg
from shared import permissions
from shared.concurrency import Conflict

from .models import Attribution, Constituenta
from .serializers.io_files import create_rsform_from_data

logger = logging.getLogger(__name__)
TEXT_FIELDS = ('term_raw', 'definition_raw', 'convention')
ITEM_FIELDS = (
    'alias', 'convention', 'crucial', 'cst_type', 'definition_formal', 'definition_raw',
    'definition_resolved', 'term_raw', 'term_resolved', 'term_forms', 'typification_manual', 'value_is_property',
)


def calculate_projection(source_id: int, parameters: dict, *, unavailable_field: str = 'source_operation') -> dict:
    ''' Use the same pure calculator for preview, creation, and refresh. '''
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


def draft_revision(source_id: int, source_time, draft: dict, parameters: dict, prior: list[dict]) -> str:
    ''' Tie a review to the exact snapshot, parameters, and projection. '''
    snapshot = [source_id, source_time.isoformat(), parameters, draft, prior]
    data = json.dumps(snapshot, sort_keys=True, ensure_ascii=False)
    return sha256(data.encode('utf-8')).hexdigest()


def parameters_from(data: dict) -> dict:
    ''' Store operation parameters independently from the display passport. '''
    return {name: data[name] for name in ('target', 'excluded', 'locale', 'context_name')}


def require_valid_projection(draft: dict) -> None:
    ''' Reject regressions that the second formal analysis found in the projection. '''
    invalid = {row['id'] for row in draft['proposals'] if row['formalInvalid']}
    if invalid:
        names = ', '.join(item['alias'] for item in draft['items'] if item['id'] in invalid)
        raise ValidationError({'projection': f'The projected definitions or types are invalid: {names}.'})


def confirm_projection(draft: dict, edits: list[dict], reviewed: list[int]) -> None:
    ''' Validate review coverage and apply only the three reviewed text fields. '''
    require_valid_projection(draft)
    by_id = {proposal['id']: proposal for proposal in draft['proposals']}
    items = {item['id']: item for item in draft['items']}
    required = {pk for pk, proposal in by_id.items() if proposal['inKernel'] and proposal['changed']}
    if not required.issubset(reviewed) or set(reviewed).difference(by_id):
        raise ValidationError({'reviewed': 'Review all new and changed kernel texts.'})
    supplied = {row['id']: row for row in edits}
    if len(supplied) != len(edits) or set(supplied).difference(by_id):
        raise Conflict(detail='The text edits do not match the current draft.')
    for pk, proposal in by_id.items():
        edit = supplied.get(pk)
        if pk in required and (proposal['ambiguous'] or proposal['missing']) and (not edit or not edit['clarified']):
            raise ValidationError({'edits': 'Resolve the required text clarifications.'})
        if edit:
            item = items[pk]
            for name in TEXT_FIELDS:
                if name in proposal['missing'] and not edit[name].strip():
                    raise ValidationError({'edits': 'Fill the required text fields.'})
                if name == 'term_raw' and item[name] != edit[name]:
                    item['term_forms'] = []
                item[name] = edit[name]


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
def preview_standalone_relativization(item: LibraryItem, data: dict, request: Request) -> dict:
    ''' Compute a preview from the current source revision. '''
    source = _lock_source(item, data, request)
    parameters = parameters_from(data)
    draft = calculate_projection(source.pk, parameters, unavailable_field='projection')
    return draft | {'revision': draft_revision(source.pk, source.time_update, draft, parameters, []), 'prior': []}


@transaction.atomic
def create_standalone_relativization(item: LibraryItem, data: dict, request: Request) -> LibraryItem:
    ''' Recompute the projection and save an independent result schema. '''
    source = _lock_source(item, data, request)
    parameters = parameters_from(data)
    draft = calculate_projection(source.pk, parameters, unavailable_field='projection')
    if data['skip_review']:
        require_valid_projection(draft)
    else:
        revision = draft_revision(source.pk, source.time_update, draft, parameters, [])
        if data['revision'] != revision:
            raise Conflict(detail=msg.concurrentModification())
        confirm_projection(draft, data['edits'], data['reviewed'])

    location = source.location if source.owner_id == request.user.pk else LocationHead.USER
    if location == LocationHead.LIBRARY:
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
