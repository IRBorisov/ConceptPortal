''' Maintain the durable correspondence for a relativization operation. '''
from apps.rsform.relativization import TEXT_FIELDS

ROLE_KEYS = {'preserved': 'main', 'carrier': 'main', 'family': 'main', 'callable': 'main', 'condition': 'main'}


def correspondence(
    draft: dict, id_map: dict[int, int], reviewed: set[int], suggestions: dict,
) -> list[dict]:
    ''' Store confirmed text fields with each durable correspondence. '''
    items = {item['id']: item for item in draft['items']}
    return [{
        'origin': row['origin'],
        'role': row['role'],
        'result': id_map[row['id']],
        'confirmed': {name: items[row['id']][name] for name in TEXT_FIELDS} if row['id'] in reviewed else {},
        'suggested': suggestions[row['id']],
        **({'needs_review': True} if row['id'] not in reviewed and row['inKernel'] and row['changed'] else {}),
    } for row in draft['proposals']]


def correspondence_key(row: dict) -> tuple:
    ''' Preserve the identity of a main row when its expression is transformed. '''
    return row['origin'], ROLE_KEYS.get(row['role'], row['role'])
