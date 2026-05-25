import { type CstType, type RSToolErrorDescription, type ValueClass } from './common';

export interface AnalyzeExpressionInput {
  expression: string;
  cstType: CstType;
}

export interface AnalysisResult {
  success: boolean;
  type: Record<string, unknown> | null;
  valueClass: ValueClass | null;
  diagnostics: RSToolErrorDescription[];
}
