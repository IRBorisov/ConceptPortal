import { DiagnosticKind, type DiagnosticTarget, expressionDiagnostic } from './diagnostic-assembly';
import { type RSErrorDescription, type ValueClass } from '@rsconcept/domain/rslang';

import { type AnalysisResult, type Diagnostic } from '../models';

/** Minimal domain error shape before mapping to {@link Diagnostic}. */
export interface DomainErrorLike {
  code: number;
  from: number;
  to: number;
  params?: readonly string[];
  stack?: RSErrorDescription['stack'];
}

/** Minimal domain analysis shape before mapping to {@link AnalysisResult}. */
export interface DomainAnalysisLike {
  success: boolean;
  type: Record<string, unknown> | null;
  valueClass: ValueClass | null;
  errors: DomainErrorLike[];
}

/** Map a domain parser/semantic error to the public diagnostic shape. */
export function toDiagnostic(error: DomainErrorLike, expression: string, target?: DiagnosticTarget): Diagnostic {
  return expressionDiagnostic(error as RSErrorDescription, expression, target);
}

/** Map a domain analysis result to the public {@link AnalysisResult} shape. */
export function toPublicAnalysis(
  analysis: DomainAnalysisLike,
  expression: string,
  target?: DiagnosticTarget
): AnalysisResult {
  return {
    success: analysis.success,
    type: analysis.type,
    valueClass: analysis.valueClass,
    diagnostics: analysis.errors.map(error => expressionDiagnostic(error as RSErrorDescription, expression, target))
  };
}
