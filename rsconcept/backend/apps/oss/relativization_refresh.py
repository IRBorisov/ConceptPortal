''' Apply the difference between a fresh projection and its managed result rows. '''
from rest_framework.exceptions import ValidationError

from apps.library.models import LibraryItem
from apps.rsform.models import Attribution, Constituenta, CstType, RSForm, RSFormCached
from apps.rsform.models.api_RSLanguage import get_type_prefix
from apps.rsform.relativization import EDITABLE_TEXT_FIELDS, TEXT_FIELDS, calculate_projection, require_valid_projection
from apps.rsform.utils import replace_entities, replace_globals

from .models.PropagationFacade import PropagationFacade
from .models.Relativization import Relativization, RelativizationRow
from .propagation_state import mark_schema
from .relativization import correspondence, correspondence_key, store_correspondence

Match = tuple[dict, RelativizationRow | None, dict, Constituenta | None]
MUTABLE_FIELDS = (
    'crucial', 'definition_formal', 'typification_manual', 'value_is_property', *EDITABLE_TEXT_FIELDS,
)


def refresh_projection(
    relativization: Relativization, parameters: dict | None = None, projection: dict | None = None,
) -> None:
    ''' Recalculate one projection, retaining own rows and durable correspondence. '''
    operation = relativization.operation
    requested = parameters if parameters is not None else relativization.parameters
    if not requested or not operation.result_id:
        return
    source = Constituenta.objects.filter(schema_id=relativization.source_id)
    target = source.filter(pk=requested['target'], cst_type__in=['basic', 'structure']).first()
    if not target:
        raise ValidationError({
            'target': 'Reconfigure the relativization before deleting its target or changing its type.',
        })
    excluded = set(source.filter(pk__in=requested['excluded'], cst_type__in=['basic', 'constant', 'structure'])
                   .values_list('pk', flat=True))
    params = requested | {'excluded': [pk for pk in requested['excluded'] if pk in excluded]}
    if projection is None:
        projection = calculate_projection(relativization.source_id, params)
    require_valid_projection(projection)
    result = LibraryItem.objects.get(pk=operation.result_id)
    attributes, changed = _apply_projection(result, projection, relativization)
    source_item = relativization.source
    passport = {
        'source': {'id': source_item.pk, 'alias': source_item.alias, 'title': source_item.title},
        'target': {'alias': target.alias, 'term': target.term_resolved},
        'excluded': [{'alias': item.alias, 'term': item.term_resolved}
                     for item in source.filter(pk__in=params['excluded']).order_by('order')],
    }
    if (params, attributes, passport) != (
        relativization.parameters, relativization.attribution, relativization.passport,
    ):
        relativization.parameters = params
        relativization.attribution = attributes
        relativization.passport = passport
        relativization.save(update_fields=['parameters', 'attribution', 'passport'])
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


def match_projection(
    projection: dict, previous: list[RelativizationRow], by_id: dict[int, Constituenta],
) -> list[Match]:
    ''' Match draft rows to existing rows by stable provenance. '''
    known = {correspondence_key(row.origin_id, row.role): row for row in previous}
    items = {item['id']: item for item in projection['items']}
    matches = []
    for proposal in projection['proposals']:
        old = known.get(correspondence_key(proposal['origin'], proposal['role']))
        current = by_id.get(old.result_id) if old else None
        matches.append((proposal, old, items[proposal['id']], current))
    return matches


def _apply_projection(
    result: LibraryItem, projection: dict, relativization: Relativization,
) -> tuple[list[list[int]], bool]:
    propagation = PropagationFacade()
    schema = propagation.get_schema(result.pk)
    schema.cache.ensure_loaded_terms()
    known = schema.cache.by_id
    previous = list(relativization.rows.all())
    rows = match_projection(projection, previous, known)
    retained = {current.pk for _, _, _, current in rows if current}
    removed = [row.result_id for row in previous if row.result_id in known and row.result_id not in retained]
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

    updates = []
    for proposal, old, item, current in rows:
        mapped = _mapped_row(item, aliases)
        if old and current:
            for name in old.text_overrides:
                mapped[name] = getattr(current, name)
            if 'convention' in old.text_overrides:
                mapped['convention'] = replace_entities(mapped['convention'], renamed)
        updates.append((proposal['id'], current, mapped))

    changed_shape = bool(removed or renamed)
    current_ids, changed = _write_updates(schema, updates, propagation, changed_shape)
    new_rows = []
    changed_rows = []
    for proposal, old, _, current in rows:
        if old is None or current is None:
            new_rows.append(correspondence(proposal, current_ids[proposal['id']], relativization.pk))
        elif old.role != proposal['role']:
            old.role = proposal['role']
            changed_rows.append(old)
    store_correspondence(relativization.operation_id, new_rows)
    RelativizationRow.objects.bulk_update(changed_rows, ['role'])
    attributes = [
        [current_ids[row['container']], current_ids[row['attribute']]] for row in projection['attribution']
    ]
    changed = _apply_attributions(result.pk, relativization.attribution, attributes, propagation) or changed
    return attributes, changed or changed_shape


def _write_updates(
    schema: RSFormCached, updates: list[tuple[int, Constituenta | None, dict]], propagation: PropagationFacade,
    changed_shape: bool,
) -> tuple[dict[int, int], bool]:
    created: list[Constituenta] = []
    existing: list[tuple[Constituenta, dict]] = []
    current_ids = {}
    for draft_id, current, item in updates:
        if current is None:
            current = Constituenta.objects.create(
                schema_id=schema.pk, order=len(schema.cache.constituents) + len(created),
                **{name: item[name] for name in ('alias', 'cst_type', *MUTABLE_FIELDS)}
            )
            created.append(current)
        else:
            existing.append((current, item))
        current_ids[draft_id] = current.pk

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
    return current_ids, bool(created or changes or order_changed)


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
