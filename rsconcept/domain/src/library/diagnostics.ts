/**
 * Module: Compact diagnostics for constituents (schema and model issue codes).
 */

import { RSErrorCode } from '../rslang/error';
import { labelType } from '../rslang/labels';

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

/** Schema and model diagnostic codes (same numeric format as {@link RSErrorCode}). */
export const RSDiagnosticCode = {
  schemaHomonym: 0x8901,
  schemaFormalDuplicate: 0x8902,
  schemaMissingConvention: 0x8903,
  schemaMissingTerm: 0x8904,
  schemaTypeMismatch: 0x8905,

  modelEmpty: 0x8910,
  modelAxiomFalse: 0x8911,
  modelInvalidData: 0x8912,
  modelEvalFail: 0x8913
} as const;
export type RSDiagnosticCode = (typeof RSDiagnosticCode)[keyof typeof RSDiagnosticCode];

/** Severity of a diagnostic code. Unknown codes are treated as critical. */
export type DiagnosticSeverity = 'error' | 'warning';

const WARNING_DIAGNOSTIC_CODES: ReadonlySet<number> = new Set([RSErrorCode.localNotUsed]);

/** Whether a diagnostic code is an explicitly registered warning. */
export function isDiagnosticWarning(errorCode: number): boolean {
  return WARNING_DIAGNOSTIC_CODES.has(errorCode);
}

/** Whether a diagnostic code should block repair/evaluation flow. */
export function isDiagnosticCritical(errorCode: number): boolean {
  return !isDiagnosticWarning(errorCode);
}

/** Map any known diagnostic/error code to an agent-facing severity. */
export function getDiagnosticSeverity(errorCode: number): DiagnosticSeverity {
  return isDiagnosticWarning(errorCode) ? 'warning' : 'error';
}

/** Compact diagnostic stored on {@link Constituenta} after schema loading. */
export interface CstDiagnostic {
  kind: DiagnosticKind;
  code: number;
  /** Positional message arguments (per-code; homonyms/duplicates use `[aliases]`). */
  params?: readonly string[];
}

/** Whether a constituent has a schema/model diagnostic with the given code. */
export function hasCstDiagnostic(cst: Constituenta, code: RSDiagnosticCode): boolean {
  return cst.diagnostics?.some(item => item.code === code) ?? false;
}

/**
 * Populate `diagnostics` on each constituent (homonyms, duplicates, metadata, type mismatch).
 *
 * Requires normalized formal definitions for duplicate detection (same as Portal loader).
 */
export function assignSchemaDiagnostics(
  items: Constituenta[],
  resolveAlias: (id: number) => string,
  normalizedDefinitions: ReadonlyMap<number, string>
): void {
  const homonymById = detectHomonymDiagnostics(items, resolveAlias);
  const duplicateById = detectFormalDuplicateDiagnostics(items, resolveAlias, normalizedDefinitions);

  for (const cst of items) {
    const diagnostics: CstDiagnostic[] = [];
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

/** Map a model evaluation status to a compact diagnostic, or `null` when not an issue. */
export function modelStatusCstDiagnostic(status: EvalStatus, cstType: CstType): CstDiagnostic | null {
  const code = modelStatusToCode(status, cstType);
  if (code === null) {
    return null;
  }
  return { kind: DiagnosticKind.MODEL, code, params: [String(status)] };
}

function collectLocalSchemaDiagnostics(cst: Constituenta): CstDiagnostic[] {
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

function detectHomonymDiagnostics(
  items: Constituenta[],
  resolveAlias: (id: number) => string
): Map<number, CstDiagnostic> {
  const byTerm = new Map<string, Constituenta[]>();
  for (const cst of items) {
    const key = cst.term_resolved.trim().toLocaleLowerCase();
    if (key === '') {
      continue;
    }
    const group = byTerm.get(key) ?? [];
    group.push(cst);
    byTerm.set(key, group);
  }

  const result = new Map<number, CstDiagnostic>();
  for (const group of byTerm.values()) {
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
        code: RSDiagnosticCode.schemaHomonym,
        params: [aliases]
      });
    }
  }
  return result;
}

function detectFormalDuplicateDiagnostics(
  items: Constituenta[],
  resolveAlias: (id: number) => string,
  normalizedDefinitions: ReadonlyMap<number, string>
): Map<number, CstDiagnostic> {
  const byDefinition = new Map<string, Constituenta[]>();
  for (const cst of items) {
    const key = normalizedDefinitions.get(cst.id);
    if (!key) {
      continue;
    }
    const group = byDefinition.get(key) ?? [];
    group.push(cst);
    byDefinition.set(key, group);
  }

  const result = new Map<number, CstDiagnostic>();
  for (const group of byDefinition.values()) {
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
        code: RSDiagnosticCode.schemaFormalDuplicate,
        params: [aliases]
      });
    }
  }
  return result;
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
