import {
  type Constituenta,
  type CstDiagnostic,
  DiagnosticKind,
  modelStatusCstDiagnostic,
  RSDiagnosticCode
} from '@rsconcept/domain/library';
import { EvalStatus } from '@rsconcept/domain/library/rsmodel';
import { isCritical, RSErrorCode, type RSErrorDescription } from '@rsconcept/domain/rslang/error';

export { DiagnosticKind, RSDiagnosticCode };

/** Severity of a {@link Diagnostic}. */
export type DiagnosticSeverity = 'error' | 'warning';

/** Agent-facing diagnostic with redundant fields for autonomous repair. */
export interface Diagnostic extends CstDiagnostic {
  name: string;
  severity: DiagnosticSeverity;
  constituentId?: number;
  alias?: string;
  expression: string;
  from: number;
  to: number;
}

/** Context for attributing a {@link Diagnostic} to a constituent. */
export interface DiagnosticTarget {
  constituentId?: number;
  alias?: string;
}

const DIAGNOSTIC_NAMES: ReadonlyMap<number, string> = new Map([
  ...Object.entries(RSErrorCode).map(([name, code]) => [code, name] as const),
  ...Object.entries(RSDiagnosticCode).map(([name, code]) => [code, name] as const)
]);

export function getDiagnosticName(code: number): string {
  return DIAGNOSTIC_NAMES.get(code) ?? `0x${code.toString(16).toUpperCase()}`;
}

export function getDiagnosticSeverity(code: number): DiagnosticSeverity {
  return isCritical(code as RSErrorCode) ? 'error' : 'warning';
}

export function expandCstDiagnostic(cst: Constituenta, diagnostic: CstDiagnostic): Diagnostic {
  const expression = expressionForCstDiagnostic(cst, diagnostic);
  return {
    ...diagnostic,
    name: getDiagnosticName(diagnostic.code),
    severity: getDiagnosticSeverity(diagnostic.code),
    constituentId: cst.id,
    alias: cst.alias,
    expression,
    from: 0,
    to: diagnostic.kind === DiagnosticKind.MODEL ? 0 : Math.max(expression.length, 1)
  };
}

export function expressionDiagnostic(
  error: RSErrorDescription,
  expression: string,
  target?: DiagnosticTarget
): Diagnostic {
  return {
    kind: DiagnosticKind.EXPRESSION,
    code: error.code,
    name: getDiagnosticName(error.code),
    severity: getDiagnosticSeverity(error.code),
    constituentId: target?.constituentId,
    alias: target?.alias,
    expression,
    from: error.from,
    to: error.to,
    ...(error.params ? { params: error.params } : {})
  };
}

export function modelStatusDiagnostic(status: EvalStatus, cst: Constituenta): Diagnostic | null {
  const base = modelStatusCstDiagnostic(status, cst.cst_type);
  return base ? expandCstDiagnostic(cst, base) : null;
}

function expressionForCstDiagnostic(cst: Constituenta, diagnostic: CstDiagnostic): string {
  switch (diagnostic.code) {
    case RSDiagnosticCode.schemaHomonym:
    case RSDiagnosticCode.schemaMissingTerm:
      return cst.term_resolved;
    case RSDiagnosticCode.schemaMissingConvention:
      return cst.convention;
    case RSDiagnosticCode.schemaTypeMismatch:
      return cst.typification_manual;
    default:
      return cst.definition_formal;
  }
}
