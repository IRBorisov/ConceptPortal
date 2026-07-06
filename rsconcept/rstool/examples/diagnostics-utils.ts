import { type Diagnostic, type RSToolWrapperClient } from '../src';

export type ExampleDiagnostic = Diagnostic;

export function formatDiagnostics(diags: ExampleDiagnostic[]): string {
  return diags
    .map(d => {
      const alias = d.alias ?? (d.constituentId !== undefined ? '?' : '(scratch)');
      return `[${d.kind}] ${alias} ${d.name} ${JSON.stringify(d.params ?? [])}`;
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
