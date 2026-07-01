import { type CstType, type RSToolErrorDescription, type ValueClass } from './common';

/** Input for {@link RSToolAgent.analyzeExpression}. */
export interface AnalyzeExpressionInput {
  /** RSLang expression to parse and type-check. */
  expression: string;
  /** Expected constituent type context for the expression. */
  cstType: CstType;
  /** When true, append diagnostics to the session log. Default: false. */
  recordDiagnostics?: boolean;
}

/** Outcome of parsing and semantic analysis for one expression. */
export interface AnalysisResult {
  success: boolean;
  /** Inferred RS type AST as a plain object, or `null` on failure. */
  type: Record<string, unknown> | null;
  valueClass: ValueClass | null;
  diagnostics: RSToolErrorDescription[];
}
