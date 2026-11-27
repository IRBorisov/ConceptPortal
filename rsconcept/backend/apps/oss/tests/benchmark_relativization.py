''' Local fixed-graph benchmark. Run via manage.py shell using a test database. '''
import json
import subprocess
from statistics import median
from time import perf_counter
import tracemalloc
from unittest.mock import patch

from django.db import transaction

from apps.library.models import LibraryItem
from apps.oss.models import OperationSchema, OperationType, PropagationFacade
from apps.oss.relativization import correspondence
from apps.oss.relativization_refresh import _allocate_aliases, match_projection, refresh_projection
from apps.rsform.models import Constituenta, RSForm
from apps.rsform.relativization import TEXT_FIELDS, calculate_projection
from apps.rsform.serializers.io_files import create_rsform_from_data


def _sample(action, *args, **kwargs):
    tracemalloc.start()
    start = perf_counter()
    try:
        result = action(*args, **kwargs)
        return result, {'ms': round((perf_counter() - start) * 1000, 1),
                        'pythonPeakKiB': round(tracemalloc.get_traced_memory()[1] / 1024, 1)}
    finally:
        tracemalloc.stop()


def _seed(size):
    schema = RSForm.create(alias='BenchSrc', title='Benchmark source')
    base = schema.insert_last('X1', term_raw='vertices', term_resolved='vertices')
    target = schema.insert_last('S1', term_raw='edges', term_resolved='edges', definition_formal='ℬ(X1×X1)')
    terms = Constituenta.objects.bulk_create([
        Constituenta(schema=schema.model, alias=f'D{index + 1}', cst_type='term', order=index + 2,
                     definition_formal='Pr1(S1)', term_raw=f'component {index + 1}',
                     term_resolved=f'component {index + 1}')
        for index in range(size)
    ])
    oss = OperationSchema.create(alias='BenchOss', title='Benchmark OSS')
    source = oss.create_operation(operation_type=OperationType.INPUT, result=schema.model)
    params = {'target': target.pk, 'excluded': [base.pk], 'context_name': 'context', 'locale': 'en'}
    projection = calculate_projection(schema.model.pk, params)
    result, ids = create_rsform_from_data(
        item_data={'alias': 'BenchRel', 'title': 'Benchmark projection', 'location': oss.model.location},
        schema_data=projection,
    )
    operation = oss.record_relativization(source, LibraryItem.objects.get(pk=result.pk), target, [base])
    suggestions = {item['id']: {name: item[name] for name in TEXT_FIELDS} for item in projection['items']}
    operation.projection = params | {'rows': correspondence(projection, ids, set(), suggestions), 'attribution': []}
    operation.save(update_fields=['projection'])

    synthesis = oss.create_operation(
        operation_type=OperationType.SYNTHESIS, alias='BenchSyn', title='Benchmark synthesis',
    )
    oss.set_arguments(synthesis.pk, [operation])
    PropagationFacade().get_oss(oss.model.pk).execute_operation(synthesis)
    return schema.model.pk, params, operation, terms[0]


def _match(operation, draft):
    current = Constituenta.objects.filter(schema_id=operation.result_id)
    by_id = current.in_bulk()
    matches = match_projection(draft, operation.projection['rows'], by_id)
    return _allocate_aliases(matches, {row.alias for row in by_id.values()})


def _report(samples):
    return {name: {'median': median(sample[name] for sample in samples),
                   'max': max(sample[name] for sample in samples)} for name in samples[0]}


def run(sizes=(30, 300, 900), repeats=5):
    ''' Print wall time and peak allocations for a fixed three-node OSS. All rows roll back. '''
    actual_run = subprocess.run
    profile = {}

    def subprocess_with_profile(args, **kwargs):
        nonlocal profile
        output = actual_run([*args, '--profile'], check=kwargs.pop('check', True), **kwargs)
        profile = json.loads(output.stderr)
        return output

    for size in sizes:
        report = {'calculate': [], 'match': [], 'applyAndCascade': [], 'unchangedApply': []}
        with transaction.atomic():
            schema_id, params, operation, term = _seed(size)
            for index in range(repeats + 1):
                term.definition_formal = 'Pr2(S1)' if index % 2 == 0 else 'Pr1(S1)'
                term.save(update_fields=['definition_formal'])
                with patch('apps.rsform.relativization.subprocess.run', side_effect=subprocess_with_profile):
                    draft, calc = _sample(calculate_projection, schema_id, params)
                _, match = _sample(_match, operation, draft)
                _, cascade = _sample(refresh_projection, operation, projection=draft)
                _, no_op = _sample(refresh_projection, operation, projection=draft)
                if index > 0:
                    report['calculate'].append(calc | profile)
                    report['match'].append(match)
                    report['applyAndCascade'].append(cascade)
                    report['unchangedApply'].append(no_op)
            transaction.set_rollback(True)
        print(json.dumps({'sourceRows': size + 2, 'operationCount': 3, 'repeats': repeats,
                          **{phase: _report(samples) for phase, samples in report.items()}}))
