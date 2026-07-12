/**
 * Module: Compact diagnostics for constituents (schema and model issue codes).
 */

import { type Graph } from '../graph';
import { type ExpressionType } from '../rslang';
import { labelType } from '../rslang/labels';

import { type BasicTextCheckFields } from './rsform-api/types';
import { type Constituenta, type CstType } from './rsform';
import { isBasicConcept, isLogical } from './rsform-api';
import { EvalStatus } from './rsmodel';

/** Origin of a diagnostic. */
export const DiagnosticKind = {
  EXPRESSION: 'expression',
  SCHEMA: 'schema',
  MODEL: 'model'
} as const;
export type DiagnosticKind = (typeof DiagnosticKind)[keyof typeof DiagnosticKind];

/** Schema, model, and substitution-table diagnostic codes (same numeric format as {@link RSErrorCode}). */
export const RSDiagnosticCode = {
  schemaHomonym: 0x8901,
  schemaFormalDuplicate: 0x8902,
  schemaMissingConvention: 0x8903,
  schemaMissingTerm: 0x8904,
  schemaTypeMismatch: 0x8905,
  schemaDependencyCycle: 0x8906,

  modelEmpty: 0x8910,
  modelAxiomFalse: 0x8911,
  modelInvalidData: 0x8912,
  modelEvalFail: 0x8913,

  substitutionInvalidIDs: 0x8920,
  substitutionIncorrectCst: 0x8921,
  substitutionInvalidClasses: 0x8922,
  substitutionInvalidBasic: 0x8923,
  substitutionInvalidConstant: 0x8924,
  substitutionTypificationCycle: 0x8925,
  substitutionBaseNotSet: 0x8926,
  substitutionUnequalTypification: 0x8927,
  /** Non-blocking warning: formal definitions differ after mapping. */
  substitutionUnequalExpressions: 0x2928,
  substitutionUnequalArgsCount: 0x8929,
  substitutionUnequalArgs: 0x892a,
  substitutionInvalidNominal: 0x892b
} as const;
export type RSDiagnosticCode = (typeof RSDiagnosticCode)[keyof typeof RSDiagnosticCode];

/** Compact diagnostic stored on {@link Constituenta} after schema loading. */
export interface CstDiagnostic {
  kind: DiagnosticKind;
  code: number;
  /** Positional message arguments (per-code; homonyms/duplicates use `[aliases]`). */
  params?: readonly string[];
}

/** Whether an item has a schema/model diagnostic with the given code. */
export function hasCstDiagnostic(
  cst: { diagnostics?: readonly CstDiagnostic[] | null },
  code: RSDiagnosticCode
): boolean {
  return cst.diagnostics?.some(item => item.code === code) ?? false;
}

/**
 * Populate `diagnostics` on each constituent (homonyms, duplicates, metadata, type mismatch, cycles).
 *
 * Requires normalized formal definitions for duplicate detection (same as Portal loader).
 * When `graph` is provided, dependency cycles are reported as {@link RSDiagnosticCode.schemaDependencyCycle}.
 */
export function assignSchemaDiagnostics(
  items: Constituenta[],
  resolveAlias: (id: number) => string,
  normalizedDefinitions: ReadonlyMap<number, string>,
  graph?: Graph
): void {
  const homonymById = detectHomonymDiagnostics(items, resolveAlias);
  const duplicateById = detectFormalDuplicateDiagnostics(items, resolveAlias, normalizedDefinitions);
  const cycleById = graph ? detectDependencyCycleDiagnostics(graph, resolveAlias) : new Map<number, CstDiagnostic>();

  for (const cst of items) {
    const diagnostics: CstDiagnostic[] = [];
    const cycle = cycleById.get(cst.id);
    if (cycle) {
      diagnostics.push(cycle);
    }
    const homonym = homonymById.get(cst.id);
    if (homonym) {
      diagnostics.push(homonym);
    }
    const duplicate = duplicateById.get(cst.id);
    if (duplicate) {
      diagnostics.push(duplicate);
    }
    diagnostics.push(...collectLocalSchemaDiagnostics(cst));
    cst.diagnostics = diagnostics;
  }
}

/**
 * Format a closed dependency cycle as `A → B → A`.
 *
 * Rotates the path to start at the lexicographically smallest alias so the same
 * cycle always renders identically regardless of graph traversal order.
 *
 * @param aliases Closed or open alias path from {@link Graph.findCycles}.
 * @returns Human-readable cycle text joined with ` → `.
 */
export function formatDependencyCycle(aliases: readonly string[]): string {
  if (aliases.length < 2) {
    return aliases.join(' → ');
  }

  const closed = aliases[0] === aliases[aliases.length - 1];
  const open = closed ? aliases.slice(0, -1) : [...aliases];
  if (open.length === 0) {
    return aliases.join(' → ');
  }

  let bestStart = 0;
  for (let index = 1; index < open.length; index++) {
    const alias = open[index];
    const bestAlias = open[bestStart];
    if (alias !== undefined && bestAlias !== undefined && alias < bestAlias) {
      bestStart = index;
    }
  }
  const rotated = [...open.slice(bestStart), ...open.slice(0, bestStart)];
  if (closed) {
    const first = rotated[0];
    if (first !== undefined) {
      rotated.push(first);
    }
  }
  return rotated.join(' → ');
}

/**
 * Map each node id that participates in a dependency cycle to a schema diagnostic.
 *
 * `params[0]` is the closed cycle path (`F3 → P1 → F3`).
 *
 * @param graph Constituent dependency graph (provider → dependent edges).
 * @param resolveAlias Maps node id to display alias for cycle formatting.
 * @returns One {@link CstDiagnostic} per node on each cyclic SCC.
 */
export function detectDependencyCycleDiagnostics(
  graph: Graph,
  resolveAlias: (id: number) => string
): Map<number, CstDiagnostic> {
  const result = new Map<number, CstDiagnostic>();
  for (const cycle of graph.findCycles()) {
    if (cycle.length < 2) {
      continue;
    }
    const aliases = cycle.map(id => resolveAlias(id));
    const cycleText = formatDependencyCycle(aliases);
    const memberIds = new Set(cycle);
    for (const id of memberIds) {
      result.set(id, {
        kind: DiagnosticKind.SCHEMA,
        code: RSDiagnosticCode.schemaDependencyCycle,
        params: [cycleText]
      });
    }
  }
  return result;
}

/** Map a model evaluation status to a compact diagnostic, or `null` when not an issue. */
export function modelStatusCstDiagnostic(status: EvalStatus, cstType: CstType): CstDiagnostic | null {
  const code = modelStatusToCode(status, cstType);
  if (code === null) {
    return null;
  }
  return { kind: DiagnosticKind.MODEL, code, params: [String(status)] };
}

function collectLocalSchemaDiagnostics(
  cst: BasicTextCheckFields & {
    is_type_mismatch: boolean;
    typification_manual: string;
    analysis: { type: ExpressionType | null };
  }
): CstDiagnostic[] {
  const result: CstDiagnostic[] = [];
  if (cst.is_type_mismatch) {
    result.push({
      kind: DiagnosticKind.SCHEMA,
      code: RSDiagnosticCode.schemaTypeMismatch,
      params: [cst.typification_manual, labelType(cst.analysis.type)]
    });
  }
  if (isBasicConcept(cst.cst_type) && !isLogical(cst.cst_type)) {
    if (!cst.convention.trim()) {
      result.push({ kind: DiagnosticKind.SCHEMA, code: RSDiagnosticCode.schemaMissingConvention });
    }
    if (!cst.term_resolved.trim()) {
      result.push({ kind: DiagnosticKind.SCHEMA, code: RSDiagnosticCode.schemaMissingTerm });
    }
  }
  return result;
}

function detectGroupedAliasDiagnostics<T extends { id: number }>(
  items: readonly T[],
  resolveAlias: (id: number) => string,
  groupKey: (cst: T) => string | undefined,
  code: RSDiagnosticCode
): Map<number, CstDiagnostic> {
  const groups = new Map<string, T[]>();
  for (const cst of items) {
    const key = groupKey(cst);
    if (!key) {
      continue;
    }
    const group = groups.get(key) ?? [];
    group.push(cst);
    groups.set(key, group);
  }

  const result = new Map<number, CstDiagnostic>();
  for (const group of groups.values()) {
    if (group.length <= 1) {
      continue;
    }
    for (const cst of group) {
      const aliases = group
        .filter(other => other.id !== cst.id)
        .map(other => resolveAlias(other.id))
        .join(', ');
      result.set(cst.id, {
        kind: DiagnosticKind.SCHEMA,
        code,
        params: [aliases]
      });
    }
  }
  return result;
}

function detectHomonymDiagnostics(
  items: readonly { id: number; term_resolved: string }[],
  resolveAlias: (id: number) => string
): Map<number, CstDiagnostic> {
  return detectGroupedAliasDiagnostics(
    items,
    resolveAlias,
    cst => {
      const key = cst.term_resolved.trim().toLocaleLowerCase();
      return key === '' ? undefined : key;
    },
    RSDiagnosticCode.schemaHomonym
  );
}

function detectFormalDuplicateDiagnostics(
  items: readonly { id: number }[],
  resolveAlias: (id: number) => string,
  normalizedDefinitions: ReadonlyMap<number, string>
): Map<number, CstDiagnostic> {
  return detectGroupedAliasDiagnostics(
    items,
    resolveAlias,
    cst => normalizedDefinitions.get(cst.id),
    RSDiagnosticCode.schemaFormalDuplicate
  );
}

function modelStatusToCode(status: EvalStatus, cstType: CstType): RSDiagnosticCode | null {
  switch (status) {
    case EvalStatus.EMPTY:
      return isBasicConcept(cstType) ? RSDiagnosticCode.modelEmpty : null;
    case EvalStatus.AXIOM_FALSE:
      return RSDiagnosticCode.modelAxiomFalse;
    case EvalStatus.INVALID_DATA:
      return RSDiagnosticCode.modelInvalidData;
    case EvalStatus.EVAL_FAIL:
      return RSDiagnosticCode.modelEvalFail;
    default:
      return null;
  }
}
