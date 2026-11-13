import { createHash } from 'node:crypto';
import type { RSToolAgent } from '@rsconcept/rstool';

export interface SourceDiagnosticReview {
  intent: 'annotated_source';
  source: string;
  sourceSha256: string;
  diagnostics: Array<{ alias: string; code: number; expressionSha256: string; pages: number[]; comment: string }>;
}

/** A narrowly reviewed source duplicate is not a clean theory. All other schema errors still block. */
export function reviewSourceDiagnostics(value: unknown, diagnostics: ReturnType<RSToolAgent['listDiagnostics']>,
  schema: Record<string, any>): SourceDiagnosticReview | undefined {
  const errors = diagnostics.filter(d => d.kind === 'schema' && d.severity === 'error');
  if (value === undefined) {
    if (errors.length) throw new Error('Resolve schema diagnostics before preparing publication');
    return undefined;
  }
  const review = object(value, ['intent', 'source', 'sourceSha256', 'diagnostics']);
  if (review.intent !== 'annotated_source' || typeof review.source !== 'string' || !review.source.trim() ||
      review.source.length > 500 || !hash(review.sourceSha256) || !Array.isArray(review.diagnostics) ||
      !errors.length || errors.length > 256 || review.diagnostics.length !== errors.length ||
      typeof schema.description !== 'string' || !schema.description.trim())
    throw new Error('A complete annotated-source review and schema description are required');
  if (errors.some(d => d.name !== 'schemaFormalDuplicate' || d.code !== 35074))
    throw new Error('Only reviewed source formal duplicates are supported; other schema errors still block publication');
  const remaining = new Set(errors.map(d => `${d.alias}:${d.code}:${digest(d.expression ?? '')}`));
  const entries: SourceDiagnosticReview['diagnostics'] = [];
  for (const raw of review.diagnostics) {
    const entry = object(raw, ['alias', 'code', 'expressionSha256', 'pages', 'comment']);
    if (typeof entry.alias !== 'string' || entry.code !== 35074 || !hash(entry.expressionSha256) ||
        !Array.isArray(entry.pages) || !entry.pages.length || entry.pages.length > 100 ||
        entry.pages.some(p => !Number.isSafeInteger(p) || Number(p) <= 0 || Number(p) > 1000000) ||
        typeof entry.comment !== 'string' || entry.comment.trim().length < 20 || entry.comment.length > 10000)
      throw new Error('Each source diagnostic needs its exact alias, code, expression hash, PDF pages and explanation');
    const key = `${entry.alias}:${entry.code}:${entry.expressionSha256}`;
    if (!remaining.delete(key)) throw new Error('Source diagnostic review does not match the current schema errors');
    const item = schema.items.find((item: Record<string, any>) => item.alias === entry.alias);
    if (!item || typeof item.convention !== 'string' || !item.convention.includes(entry.comment))
      throw new Error('Source-error explanation must also be preserved in the constituent convention');
    entries.push({ alias: entry.alias, code: entry.code, expressionSha256: entry.expressionSha256,
      pages: [...entry.pages] as number[], comment: entry.comment });
  }
  if (remaining.size) throw new Error('Every blocking source duplicate must be reviewed');
  return { intent: 'annotated_source', source: review.source, sourceSha256: review.sourceSha256 as string,
    diagnostics: entries.sort((a, b) => a.alias.localeCompare(b.alias)) };
}

function digest(value: string): string { return createHash('sha256').update(value).digest('hex'); }
function hash(value: unknown): value is string { return typeof value === 'string' && /^[a-f0-9]{64}$/.test(value); }
function object(value: unknown, fields: string[]): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).some(k => !fields.includes(k)))
    throw new Error('Unexpected source review field');
  return value as Record<string, unknown>;
}
