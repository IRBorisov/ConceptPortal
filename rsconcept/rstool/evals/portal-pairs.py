''' Compare Portal skill revisions on fixed synthetic transcripts using Codex JSON events. '''
import argparse
import hashlib
import json
import math
import re
import subprocess
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from tempfile import TemporaryDirectory


ROOT = Path(__file__).resolve().parents[3]
PACKAGE = ROOT / 'rsconcept/rstool'
CASES = {
    'public-metadata': (
        ('rs-portal',),
        'Пользователь дал ссылку https://portal.acconcept.ru/rsforms/856?tab=editor. '
        'Нужно узнать название доступной публичной схемы, локальную сессию создавать незачем. '
        'Укажи anonymous, metadata_only и session_created как логические поля JSON.',
        {'anonymous': True, 'metadata_only': True, 'session_created': False},
    ),
    'evolve-schema': (
        ('rstool', 'rs-explicate', 'rs-interpret'),
        'КС выдач различает читателя, экземпляр и выдачу. Аксиома запрещает две открытые '
        'выдачи одного экземпляра. У одного читателя два разных экземпляра. У двух читателей '
        'один и тот же экземпляр с двумя открытыми выдачами. Не смешивай экземпляры и выдачи. '
        'Верни логические поля keep_distinction, first_valid, second_valid и weaken_axiom.',
        {'keep_distinction': True, 'first_valid': True, 'second_valid': False, 'weaken_axiom': False},
    ),
    'recover-publication': (
        ('rs-portal',),
        'Запись КС уже согласовали. При создании с requestId stable-project-001 потерян ответ. '
        'Другой чат видит прежний проект. Как восстановиться? Подтверди логическими полями '
        'keep_request_id, check_receipt, independently_read_target, create_with_new_id.',
        {'keep_request_id': True, 'check_receipt': True, 'independently_read_target': True, 'create_with_new_id': False},
    ),
}
SECTION_SELECTION = {
    'public-metadata': {'rs-portal': ['Ссылка → API']},
    'evolve-schema': {'rstool': ['Короткие маршруты'], 'rs-explicate': ['Смысл важнее «зелёного»'],
                      'rs-interpret': ['Шаги']},
    'recover-publication': {'rs-portal': ['Новая КС и путь', 'Замена существующей КС']},
}


def skill(name, ref):
    path = PACKAGE / 'skills' / name / 'SKILL.md'
    if ref:
        return subprocess.check_output(['git', 'show', f'{ref}:{path.relative_to(ROOT).as_posix()}'], cwd=ROOT).decode()
    return path.read_text(encoding='utf-8')


def response_fields(message):
    match = re.search(r'\{[\s\S]*\}', message)
    if not match:
        return {}
    try:
        value = json.loads(match[0])
    except ValueError:
        return {}
    return value if isinstance(value, dict) else {}


def select_sections(contents, headings):
    sections = re.split(r'(?m)(?=^## )', contents)
    by_heading = {section.splitlines()[0][3:]: section for section in sections if section.startswith('## ')}
    return '\n'.join(by_heading[heading] for heading in headings)


def run(job):
    label, case, repeat, model, ref, trace = job
    names, question, expected = CASES[case]
    loaded = {name: skill(name, ref) for name in names}
    if not ref:
        loaded = {name: select_sections(contents, SECTION_SELECTION[case][name]) for name, contents in loaded.items()}
    instructions = '\n\n'.join(loaded.values())
    prompt = (f'Контролируемый замер. Используй приложенные инструкции для решения. '
              f'Данные задачи синтетические. Ответь только JSON, без вызовов инструментов.\n\n'
              f'{question}\n\n{instructions}')
    tool_metrics = {}
    if trace is not None:
        outputs = trace['outputs']
        if case == 'public-metadata':
            metadata = outputs[0]['value']
            target = metadata.get('target', metadata)
            prompt = prompt.replace('/rsforms/856', f"/rsforms/{target['id']}")
        outputs_json = json.dumps(outputs, ensure_ascii=False, separators=(',', ':'))
        if re.search(r'\b(?:rcp_|rcm_|rcd_)[A-Za-z0-9_-]{20,}', outputs_json):
            raise ValueError('The synthetic tool trace contains credential-shaped data')
        prompt += '\n\nСинтетический протокол выполненных вызовов:\n' + outputs_json
        tool_metrics = {key: trace[key] for key in ('steps', 'toolOutputBytes', 'largestOutputBytes',
                                                    'portalRequests', 'repeatedRevisionReads')}
        tool_metrics['toolTranscriptHash'] = hashlib.sha256(outputs_json.encode()).hexdigest()
    command = ['codex', 'exec', '--ephemeral', '--json', '--skip-git-repo-check', '-s', 'read-only',
               '-m', model, '-c', 'model_reasoning_effort="low"', '-']
    with TemporaryDirectory(prefix='rstool-skill-eval-') as directory:
        result = subprocess.run(command, cwd=directory, input=prompt, text=True, encoding='utf-8',
                                capture_output=True, timeout=180, check=False)
    events = [json.loads(line) for line in result.stdout.splitlines() if line.startswith('{')]
    usage = next((event['usage'] for event in reversed(events) if event['type'] == 'turn.completed'), None)
    if result.returncode or usage is None:
        raise RuntimeError(f'No completed measurement for {label}/{case}/{repeat}')
    items = [event['item'] for event in events if event['type'] == 'item.completed']
    message = next((item['text'] for item in reversed(items) if item['type'] == 'agent_message'), '')
    actual = response_fields(message)
    return {'version': label, 'scenario': case, 'repeat': repeat, 'skills': {
        name: hashlib.sha256(contents.encode()).hexdigest() for name, contents in loaded.items()
    }, 'context_bytes': len(instructions.encode()), 'input': usage['input_tokens'],
        'uncached': usage['input_tokens'] - usage.get('cached_input_tokens', 0),
        'output': usage['output_tokens'], 'rubric': {key: actual.get(key) is value for key, value in expected.items()},
        'tool_calls': sum(item['type'] in ('command_execution', 'mcp_tool_call') for item in items), **tool_metrics}


def percentile(values, q):
    return sorted(values)[math.ceil(len(values) * q) - 1]


def summarize(samples):
    metrics = ('context_bytes', 'input', 'uncached', 'output', 'tool_calls', 'steps', 'toolOutputBytes',
               'largestOutputBytes', 'portalRequests', 'repeatedRevisionReads')
    return {version: {
        **{metric: {name: percentile([row[metric] for row in group], q) for name, q in [('p50', .5), ('p95', .95)]}
           for metric in metrics if metric in group[0]},
        'checks_passed': sum(sum(row['rubric'].values()) for row in group),
        'checks_total': sum(len(row['rubric']) for row in group),
    } for version in ['baseline', 'candidate'] if (group := [row for row in samples if row['version'] == version])}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--baseline', required=True)
    parser.add_argument('--model', required=True)
    parser.add_argument('--repeats', type=int, default=1)
    parser.add_argument('--output', required=True, type=Path)
    parser.add_argument('--live-trace', type=Path, help='Synthetic loopback output from portal-live.mjs')
    args = parser.parse_args()
    if args.repeats < 1:
        parser.error('--repeats must be positive')
    ref = subprocess.check_output(['git', 'rev-parse', args.baseline], cwd=ROOT, text=True).strip()
    runtime = subprocess.check_output(['codex', '--version'], cwd=ROOT, text=True).strip()
    traces = {}
    if args.live_trace:
        document = json.loads(args.live_trace.read_text(encoding='utf-8'))
        if document.get('fixture') != 'synthetic local Portal and MCP over HTTP':
            parser.error('--live-trace must come from the synthetic loopback fixture')
        traces = {(sample['version'], sample['scenario']): sample for sample in document['samples']}
        if traces.keys() != {(version, case) for version in ('baseline', 'candidate') for case in CASES}:
            parser.error('--live-trace must contain both versions of each scenario')
    jobs = [(version, case, i, args.model, baseline, traces.get((version, case)))
            for i in range(args.repeats) for case in CASES
            for version, baseline in [('baseline', ref), ('candidate', None)]]
    with ThreadPoolExecutor(max_workers=2) as pool:
        samples = list(pool.map(run, jobs))
    mode = ('local live tool transcripts replayed to the model' if traces else 'synthetic questions without tool transcripts')
    document = {'model': args.model, 'runtime': runtime, 'reasoning_effort': 'low', 'baseline_commit': ref,
                'mode': f'{mode}; baseline full skills; candidate routed sections',
                'summary': summarize(samples), 'samples': samples}
    args.output.write_text(json.dumps(document, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    print(json.dumps(document['summary']))


if __name__ == '__main__':
    main()
