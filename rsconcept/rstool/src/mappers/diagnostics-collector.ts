import { isModelIssue } from '@rsconcept/domain/library/rsmodel-api';

import { type SessionState } from '../models';
import {
  DiagnosticKind,
  expandCstDiagnostic,
  modelStatusDiagnostic,
  type Diagnostic
} from './diagnostic-assembly';
import { ModelAdapter } from './model-adapter';
import { enrichSessionConstituents } from './rsform-builder';
import { toDiagnostic } from './types';

const modelAdapter = new ModelAdapter();

/** Collect expression and schema diagnostics for a session. */
export function collectSchemaDiagnostics(session: SessionState): Diagnostic[] {
  const records: Diagnostic[] = [];

  for (const item of session.items) {
    for (const diagnostic of item.analysis.diagnostics) {
      const base = diagnostic.name
        ? diagnostic
        : toDiagnostic(diagnostic, item.definitionFormal, {
            constituentId: item.id,
            alias: item.alias
          });
      records.push({
        ...base,
        kind: DiagnosticKind.EXPRESSION,
        constituentId: base.constituentId ?? item.id,
        alias: base.alias ?? item.alias
      });
    }
  }

  const enriched = enrichSessionConstituents(session);
  for (const { cst } of enriched) {
    for (const diagnostic of cst.diagnostics) {
      if (diagnostic.kind !== DiagnosticKind.SCHEMA) {
        continue;
      }
      records.push(expandCstDiagnostic(cst, diagnostic));
    }
  }

  return records;
}

/** Collect model diagnostics for a session (requires schema items). */
export function collectModelDiagnostics(session: SessionState): Diagnostic[] {
  if (session.items.length === 0) {
    return [];
  }

  const records: Diagnostic[] = [];
  const enriched = enrichSessionConstituents(session);
  const schema = enriched.map(entry => entry.cst);
  const engine = modelAdapter.createEngine(session);
  engine.recalculateAll();
  for (const cst of schema) {
    if (!isModelIssue(engine, cst)) {
      continue;
    }
    const diagnostic = modelStatusDiagnostic(engine.getCstStatus(cst.id), cst);
    if (diagnostic) {
      records.push(diagnostic);
    }
  }

  return records;
}

/** Collect expression, schema, and model diagnostics for a session. */
export function collectSessionDiagnostics(session: SessionState): Diagnostic[] {
  return [...collectSchemaDiagnostics(session), ...collectModelDiagnostics(session)];
}
