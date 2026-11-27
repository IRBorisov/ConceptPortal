''' Stable constituent identity across relativization recalculations. '''
from .models.Inheritance import Inheritance
from .models.Relativization import RelativizationRow

ARTIFACT_ROLES = {'carrier', 'predicate', 'accessor'}
TRANSFORMED_ROLES = {'preserved', 'family', 'callable', 'condition'}


def correspondence_key(origin: int | None, role: str) -> tuple[int | None, str]:
    ''' Preserve the identity of a main row when its expression is transformed. '''
    return origin, 'main' if role in TRANSFORMED_ROLES else role


def correspondence(proposal: dict, result_id: int, relativization_id: int) -> RelativizationRow:
    ''' Link a new projected constituent to its origin and role. '''
    return RelativizationRow(
        relativization_id=relativization_id, origin_id=proposal['origin'], result_id=result_id, role=proposal['role'],
    )


def store_correspondence(operation_id: int, rows: list[RelativizationRow]) -> None:
    ''' Record provenance for every result and inheritance for actual successors. '''
    RelativizationRow.objects.bulk_create(rows)
    Inheritance.objects.bulk_create([
        Inheritance(operation_id=operation_id, parent_id=row.origin_id, child_id=row.result_id)
        for row in rows if row.origin_id is not None and row.role not in ARTIFACT_ROLES
    ])
