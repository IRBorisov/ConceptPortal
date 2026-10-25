import { readFileSync } from 'node:fs';

import { type Brief, checkBrief } from '../skills/scripts/brief-check';
import { type Diagnostic, type RSToolWrapperClient } from '../src';

export type ExampleDiagnostic = Diagnostic;

export function formatDiagnostics(diags: ExampleDiagnostic[], aliasById?: ReadonlyMap<number, string>): string {
  return diags
    .map(d => {
      const alias = d.alias ?? (d.constituentId !== undefined ? (aliasById?.get(d.constituentId) ?? '?') : '(scratch)');
      const stack = d.stack && d.stack.length > 0 ? ` stack=${d.stack.map(frame => frame.alias).join('←')}` : '';
      return `[${d.kind}] ${alias} ${d.name} ${JSON.stringify(d.params ?? [])}${stack}`;
    })
    .join('\n');
}

export async function assertCleanDiagnostics(
  client: RSToolWrapperClient,
  sessionId: string,
  _aliasById: Map<number, string>,
  context: string
): Promise<void> {
  const diags = await client.call<ExampleDiagnostic[]>('listDiagnostics', { sessionId });
  if (diags.length === 0) {
    return;
  }
  throw new Error(`${context}: ${diags.length} diagnostic(s)\n${formatDiagnostics(diags)}`);
}

/** Throws unless the exported session answers its brief (no `check-brief` blockers). */
export async function assertReady(session: string, briefPath: string, context: string): Promise<void> {
  const brief = JSON.parse(readFileSync(briefPath, 'utf8')) as Brief;
  const { readiness } = await checkBrief({ session, brief });
  if (!readiness.ready) {
    throw new Error(`${context}: brief blockers\n${readiness.blockers.join('\n')}`);
  }
}
