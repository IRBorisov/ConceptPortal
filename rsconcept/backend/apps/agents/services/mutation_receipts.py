''' Atomically claim an idempotency key before applying the corresponding mutation. '''
import hashlib
import json
import re
from contextlib import contextmanager

from django.db import transaction
from rest_framework.exceptions import APIException, NotFound, ValidationError

from ..models.AgentMutationReceipt import AgentMutationReceipt


class IdempotencyConflict(APIException):
    ''' A key is already tied to another request. '''
    status_code = 409
    default_detail = 'Idempotency-Key was used with a different request.'
    default_code = 'idempotency_conflict'


def request_key(request, *, required=False):
    ''' Read a bounded opaque key. Legacy writes can omit the header. '''
    key = request.headers.get('Idempotency-Key')
    if key is None and not required:
        return None
    if key is None or not re.fullmatch(r'[A-Za-z0-9_-]{8,128}', key):
        raise ValidationError({'Idempotency-Key': 'Expected 8–128 letters, digits, underscores or hyphens.'})
    return key


@contextmanager
def mutation_receipt(request, operation, *, target_id=None):
    ''' Hold the claim and the mutation in one transaction, including on SQLite. '''
    key = request_key(request)
    with transaction.atomic():
        if key is None:
            yield None
            return
        body = json.dumps([target_id, request.data], sort_keys=True, separators=(',', ':'), ensure_ascii=True)
        digest = hashlib.sha256(body.encode()).hexdigest()
        lookup = {'owner_id': request.user.pk, 'operation': operation, 'key': key}
        # Write first, so a concurrent SQLite request never upgrades a read lock.
        AgentMutationReceipt.objects.bulk_create(
            [AgentMutationReceipt(**lookup, digest=digest)], ignore_conflicts=True,
        )
        receipt = AgentMutationReceipt.objects.select_for_update().get(**lookup)
        if receipt.digest != digest:
            raise IdempotencyConflict()
        yield receipt
        if receipt.target_id is None:
            raise RuntimeError('Mutation did not complete its receipt')


def complete_receipt(receipt, item, *, version_id=None):
    ''' Store identifiers and the committed revision without copying object contents. '''
    if receipt is not None:
        receipt.target_id = item.pk
        receipt.revision = item.time_update
        receipt.version_id = version_id
        receipt.target_metadata = {
            'owner': item.owner_id, 'location': item.location, 'access_policy': item.access_policy,
        }
        receipt.save(update_fields=['target_id', 'revision', 'version_id', 'target_metadata'])


def lookup_receipt(request, operation):
    ''' Locate a completed receipt owned by the active Portal account. '''
    receipt = AgentMutationReceipt.objects.filter(
        owner=request.user, operation=operation, key=request_key(request, required=True),
        target_id__isnull=False,
    ).first()
    if receipt is None:
        raise NotFound()
    return receipt
