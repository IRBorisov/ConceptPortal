/**
 * CLI: check a session against its brief and print readiness.
 *
 * Usage (from the rstool package root):
 *   tsx skills/scripts/check-brief.ts --session <session.json> --brief <brief.json> [--base <v1-session.json>] [--json]
 *
 * Exit code: 0 — no blockers, 1 — blockers, 2 — usage or input error.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { type Brief, checkBrief, type BriefCheckResult } from './brief-check';

function parseArgs(argv: string[]): Record<string, string | true> {
  const args: Record<string, string | true> = {};
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i];
    if (!key.startsWith('--')) {
      continue;
    }
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) {
      args[key.slice(2)] = true;
    } else {
      args[key.slice(2)] = next;
      i++;
    }
  }
  return args;
}

function readText(path: string): string {
  return readFileSync(resolve(path), 'utf8').replace(/^﻿/, '');
}

function printReport({ readiness, scenarios }: BriefCheckResult) {
  const lines: string[] = [];
  lines.push(`Этап: ${readiness.stage}${readiness.ready ? ' — блокеров нет' : ''}`);
  lines.push(`Диагностики: ошибок ${readiness.diagnostics.errors}, предупреждений ${readiness.diagnostics.warnings}`);
  lines.push(
    `Покрытие: требования ${readiness.coverage.expressiveness}, инварианты ${readiness.coverage.invariants}, различения ${readiness.coverage.distinctions}`
  );
  lines.push(
    `Сценарии: прошло ${readiness.scenarios.passed}, провалено ${readiness.scenarios.failed}, не хватает ${readiness.scenarios.missing}`
  );
  if (scenarios.length > 0) {
    lines.push('', 'Матрица приёмки:');
    for (const scenario of scenarios) {
      lines.push(
        `  ${scenario.passed ? '✓' : '✗'} ${scenario.id} ${scenario.title}${scenario.error ? ` — ${scenario.error}` : ''}`
      );
      for (const check of scenario.checks) {
        lines.push(
          `      ${check.passed ? '✓' : '✗'} ${check.target}: ожидалось ${check.expected}, получено ${check.actual}`
        );
      }
    }
  }
  if (readiness.blockers.length > 0) {
    lines.push('', 'Блокеры:', ...readiness.blockers.map(item => `  - ${item}`));
  }
  if (readiness.warnings.length > 0) {
    lines.push('', 'Предупреждения:', ...readiness.warnings.map(item => `  - ${item}`));
  }
  lines.push('', `Дальше: ${readiness.next}`);
  console.log(lines.join('\n'));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (typeof args.session !== 'string' || typeof args.brief !== 'string') {
    console.error(
      'Usage: tsx skills/scripts/check-brief.ts --session <session.json> --brief <brief.json> [--base <session.json>] [--json]'
    );
    process.exit(2);
  }
  const result = await checkBrief({
    session: readText(args.session),
    brief: JSON.parse(readText(args.brief)) as Brief,
    base: typeof args.base === 'string' ? readText(args.base) : undefined
  });
  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printReport(result);
  }
  process.exit(result.readiness.ready ? 0 : 1);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(2);
});
