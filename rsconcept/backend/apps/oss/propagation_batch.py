''' Recompute derived projections in the transaction that changes their input. '''
from collections.abc import Callable
from functools import wraps
from typing import ParamSpec, TypeVar

from django.db import transaction
from rest_framework.exceptions import ValidationError

from apps.library.models import LibraryItem

from .models.Argument import Argument
from .models.Operation import Operation, OperationType
from .propagation_state import changed_schemas
from .relativization_refresh import refresh_projection

P = ParamSpec('P')
T = TypeVar('T')


def propagation_batch(method: Callable[P, T]) -> Callable[P, T]:
    ''' Reuse the outer mutation's transaction and process each affected projection once. '''
    @wraps(method)
    def wrapped(*args: P.args, **kwargs: P.kwargs) -> T:
        if changed_schemas.get() is not None:
            return method(*args, **kwargs)
        changed: set[int] = set()
        token = changed_schemas.set(changed)
        try:
            with transaction.atomic():
                result = method(*args, **kwargs)
                _recompute(changed)
                return result
        finally:
            changed_schemas.reset(token)
    return wrapped


def _ancestors(input_id: int) -> set[int]:
    seen = {input_id}
    frontier = seen.copy()
    while frontier:
        parent_ids = Argument.objects.filter(
            operation__result_id__in=frontier, argument__result_id__isnull=False
        ).values_list('argument__result_id', flat=True)
        frontier = set(parent_ids) - seen
        seen.update(frontier)
    return seen


def _recompute(changed: set[int]) -> None:
    completed: set[int] = set()
    while changed:
        pending = list(Operation.objects.filter(
            operation_type=OperationType.RELATIVIZATION,
            relativization_source_id__in=changed,
            result_id__isnull=False,
            projection__isnull=False,
        ).exclude(pk__in=completed).order_by('pk'))
        if not pending:
            return
        pending_outputs = {item.result_id for item in pending}
        for operation in pending:
            source_id = operation.relativization_source_id
            result_id = operation.result_id
            assert source_id is not None and result_id is not None
            ancestors = _ancestors(source_id)
            if not ancestors.intersection(pending_outputs):
                ids = [source_id, result_id]
                list(LibraryItem.objects.select_for_update().filter(pk__in=ids).order_by('pk'))
                locked = Operation.objects.select_for_update().filter(
                    pk=operation.pk, relativization_source_id=source_id, result_id=result_id,
                ).first()
                if locked is not None:
                    refresh_projection(locked)
                completed.add(operation.pk)
                break
        else:
            raise ValidationError({'propagation': 'The relativization dependencies are cyclic.'})
