''' Apply the difference between a fresh projection and its managed result rows. '''
from rest_framework.exceptions import ValidationError

from apps.library.models import LibraryItem
from apps.rsform.models import Attribution, Constituenta, CstType, RSForm, RSFormCached
from apps.rsform.models.api_RSLanguage import get_type_prefix
from apps.rsform.relativization import TEXT_FIELDS, calculate_projection, require_valid_projection
from apps.rsform.utils import extract_entities, replace_entities, replace_globals

from .models.Operation import Operation
from .models.PropagationFacade import PropagationFacade
from .propagation_state import mark_schema
from .relativization import correspondence_key

Match = tuple[dict, dict, dict, Constituenta | None]
MUTABLE_FIELDS = (
    'crucial', 'definition_formal', 'typification_manual', 'value_is_property', 'term_forms', *TEXT_FIELDS,
)


def refresh_projection(
    operation: Operation, parameters: dict | None = None, projection: dict | None = None,
    checked_ids: set[int] | None = None, suggestions: dict | None = None,
) -> None:
    ''' Recalculate one projection, retaining own rows and durable correspondence. '''
    stored = operation.projection
    if not stored or not operation.relativization_source_id or not operation.result_id:
        return
    requested = parameters if parameters is not None else stored
    source = Constituenta.objects.filter(schema_id=operation.relativization_source_id)
    target = source.filter(pk=requested['target'], cst_type__in=['basic', 'structure']).first()
    if not target:
        raise ValidationError({
            'target': 'Reconfigure the relativization before deleting its target or changing its type.',
        })
    excluded = set(source.filter(pk__in=requested['excluded'], cst_type__in=['basic', 'constant', 'structure'])
                   .values_list('pk', flat=True))
    params = requested | {'excluded': [pk for pk in requested['excluded'] if pk in excluded]}
    if projection is None:
        projection = calculate_projection(operation.relativization_source_id, params)
    require_valid_projection(projection)
    result = LibraryItem.objects.get(pk=operation.result_id)
    rows, attributes, changed = _apply_projection(result, projection, stored, checked_ids or set(), suggestions or {})
    metadata = params | {'rows': rows, 'attribution': attributes}
    source_item = operation.relativization_source
    assert source_item is not None
    passport = {
        'source': {'id': source_item.pk, 'alias': source_item.alias, 'title': source_item.title},
        'target': {'alias': target.alias, 'term': target.term_resolved},
        'excluded': [{'alias': item.alias, 'term': item.term_resolved}
                     for item in source.filter(pk__in=params['excluded']).order_by('order')],
    }
    if metadata != stored or passport != operation.relativization:
        operation.projection = metadata
        operation.relativization = passport
        operation.save(update_fields=['projection', 'relativization'])
    if changed:
        result.save(update_fields=['time_update'])
        mark_schema(result.pk)


def _allocate_aliases(rows: list[Match], used: set[str]) -> dict[str, str]:
    aliases: dict[str, str] = {}
    counters: dict[str, int] = {}
    for _, _, item, current in rows:
        alias = item['alias']
        if current and current.cst_type == item['cst_type']:
            alias = current.alias
        elif alias in used:
            prefix = get_type_prefix(item['cst_type'])
            index = counters.get(prefix, 1)
            while f'{prefix}{index}' in used:
                index += 1
            alias = f'{prefix}{index}'
            counters[prefix] = index + 1
        aliases[item['alias']] = alias
        used.add(alias)
    return aliases


def _mapped_row(item: dict, aliases: dict[str, str]) -> dict:
    return item | {
        'alias': aliases[item['alias']],
        'definition_formal': replace_globals(item['definition_formal'], aliases),
        'typification_manual': replace_globals(item['typification_manual'], aliases),
        **{name: replace_entities(item[name], aliases) for name in TEXT_FIELDS},
    }


def match_projection(projection: dict, previous: list[dict], by_id: dict[int, Constituenta]) -> list[Match]:
    ''' Match draft rows to existing rows by stable provenance. '''
    known = {correspondence_key(row): row for row in previous}
    items = {item['id']: item for item in projection['items']}
    matches = []
    for proposal in projection['proposals']:
        old = known.get(correspondence_key(proposal), {})
        matches.append((proposal, old, items[proposal['id']], by_id.get(old.get('result', 0))))
    return matches


def _apply_projection(
    result: LibraryItem, projection: dict, stored: dict, checked_ids: set[int], suggestions: dict,
) -> tuple[list[dict], list[list[int]], bool]:
    propagation = PropagationFacade()
    schema = propagation.get_schema(result.pk)
    schema.cache.ensure_loaded_terms()
    known = schema.cache.by_id
    rows = match_projection(projection, stored['rows'], known)
    retained = {current.pk for _, _, _, current in rows if current}
    removed = [row['result'] for row in stored['rows'] if row['result'] in known and row['result'] not in retained]
    aliases = _allocate_aliases(rows, set(schema.cache.by_alias))
    renamed = {
        current.alias: aliases[item['alias']] for _, _, item, current in rows
        if current and current.alias != aliases[item['alias']]
    }
    if removed:
        propagation.before_delete_cst(result.pk, removed)
        schema.delete_cst(removed)
    if renamed:
        schema.apply_mapping(renamed, change_aliases=True)

    surviving_aliases = set(aliases.values()) | set(schema.cache.by_alias)
    updates = []
    for proposal, old, item, current in rows:
        mapped = _mapped_row(item, aliases)
        suggestion = {name: replace_entities(value, aliases)
                      for name, value in suggestions.get(proposal['id'], {}).items()}
        row_metadata = _merge_review(
            proposal, mapped, old, current, suggestion,
            proposal['id'] in checked_ids, renamed, surviving_aliases,
        )
        updates.append((proposal['id'], current, mapped, row_metadata))

    changed_shape = bool(removed or renamed)
    metadata, current_ids, changed = _write_updates(schema, updates, propagation, changed_shape)
    attributes = [
        [current_ids[row['container']], current_ids[row['attribute']]] for row in projection['attribution']
    ]
    changed = _apply_attributions(result.pk, stored.get('attribution', []), attributes, propagation) or changed
    return metadata, attributes, changed or changed_shape


# pylint: disable=too-many-arguments,too-many-positional-arguments
def _merge_review(
    proposal: dict, item: dict, previous: dict, current: Constituenta | None, suggestion: dict,
    checked: bool, renamed: dict[str, str], surviving_aliases: set[str],
) -> dict:
    candidate = {name: item[name] for name in TEXT_FIELDS}
    suggestion = suggestion or candidate
    baseline = {name: replace_entities(value, renamed) for name, value in previous.get('suggested', {}).items()}
    confirmed = previous.get('confirmed', {})
    if checked:
        confirmed = candidate
    elif confirmed:
        confirmed = {name: replace_entities(value, renamed) for name, value in confirmed.items()}
        references = {alias for value in confirmed.values() for alias in extract_entities(value)}
        if references - surviving_aliases:
            confirmed = {name: getattr(current, name) for name in confirmed} if current else {}
        if item['term_raw'] != confirmed.get('term_raw', item['term_raw']):
            item['term_forms'] = current.term_forms if current else []
    item.update(confirmed)

    result = {
        'origin': proposal['origin'], 'role': proposal['role'],
        'confirmed': confirmed, 'suggested': suggestion if checked else baseline or suggestion,
    }
    if not checked and baseline and suggestion != baseline and (
        any(suggestion[name] != value for name, value in confirmed.items())
    ):
        result['proposal'] = suggestion
    if not confirmed and proposal['inKernel'] and proposal['changed']:
        result['needs_review'] = True
    return result


def _write_updates(
    schema: RSFormCached, updates: list[tuple[int, Constituenta | None, dict, dict]], propagation: PropagationFacade,
    changed_shape: bool,
) -> tuple[list[dict], dict[int, int], bool]:
    created: list[Constituenta] = []
    existing: list[tuple[Constituenta, dict]] = []
    metadata: list[dict] = []
    current_ids = {}
    for draft_id, current, item, review in updates:
        if current is None:
            current = Constituenta.objects.create(
                schema_id=schema.pk, order=len(schema.cache.constituents) + len(created),
                **{name: item[name] for name in ('alias', 'cst_type', *MUTABLE_FIELDS)}
            )
            created.append(current)
        else:
            existing.append((current, item))
        current_ids[draft_id] = current.pk
        metadata.append(review | {'result': current.pk})

    schema.cache.insert_multi(created)
    order_changed = _apply_order(schema, list(current_ids.values()))
    changes: list[tuple[int, CstType | None, dict, dict]] = []
    for current, item in existing:
        new_type = None
        if current.cst_type != item['cst_type']:
            new_type = CstType(item['cst_type'])
            current.cst_type = new_type
            current.save(update_fields=['cst_type'])
        modifications = {name: item[name] for name in MUTABLE_FIELDS if getattr(current, name) != item[name]}
        if modifications or new_type is not None:
            old_data = schema.update_cst(current.pk, modifications) if modifications else {}
            changes.append((current.pk, new_type, modifications, old_data))

    if created or changed_shape:
        schema.resolve_all_text()
    propagation.after_create_cst(created)
    for cst_id, new_type, modifications, old_data in changes:
        if new_type is not None:
            propagation.after_change_cst_type(schema.pk, cst_id, new_type)
        if modifications:
            propagation.after_update_cst(schema.pk, cst_id, modifications, old_data)
    return metadata, current_ids, bool(created or changes or order_changed)


def _apply_order(schema: RSFormCached, projected_ids: list[int]) -> bool:
    projected = iter(schema.cache.by_id[pk] for pk in projected_ids)
    managed = set(projected_ids)
    current = schema.cache.constituents
    ordered = [next(projected) if cst.pk in managed else cst for cst in current]
    if ordered == current:
        return False
    RSForm.save_order(ordered)
    schema.cache.constituents = ordered
    return True


def _apply_attributions(source_id: int, old_pairs: list[list[int]], pairs: list[list[int]],
                        propagation: PropagationFacade) -> bool:
    old = {tuple(pair) for pair in old_pairs}
    new = {tuple(pair) for pair in pairs}
    changed = False
    for container, attribute in sorted(old - new):
        row = Attribution.objects.filter(container_id=container, attribute_id=attribute).first()
        if row:
            propagation.before_delete_attribution(source_id, [row])
            row.delete()
            changed = True
    created = []
    for container, attribute in sorted(new - old):
        row, added = Attribution.objects.get_or_create(container_id=container, attribute_id=attribute)
        if added:
            created.append(row)
    if created:
        propagation.after_create_attribution(source_id, created)
    return changed or bool(created)


def prior_texts(operation: Operation, draft: dict) -> list[dict]:
    ''' Map previously confirmed text into the alias space of a new review. '''
    stored = operation.projection or {}
    old = {correspondence_key(row): row for row in stored.get('rows', [])}
    aliases = dict(Constituenta.objects.filter(schema_id=operation.result_id).values_list('pk', 'alias'))
    proposed = {row['id']: row['alias'] for row in draft['items']}
    mapping = {}
    for row in draft['proposals']:
        previous = old.get(correspondence_key(row), {})
        alias = aliases.get(previous.get('result'))
        if alias:
            mapping[alias] = proposed[row['id']]
    items = {row['id']: row for row in draft['items']}
    result = []
    for row in draft['proposals']:
        before = old.get(correspondence_key(row), {})
        confirmed = before.get('confirmed')
        if not confirmed:
            continue
        suggestion = before.get('suggested', {})
        item = items[row['id']]
        still_current = (
            before['role'] == row['role'] and all(name in confirmed for name in TEXT_FIELDS)
            and all(name in suggestion and item[name] == replace_entities(suggestion[name], mapping)
                    for name in TEXT_FIELDS)
        )
        result.append({
            'id': row['id'],
            'fields': {name: replace_entities(value, mapping) for name, value in confirmed.items()},
            'stillCurrent': still_current,
        })
    return result
