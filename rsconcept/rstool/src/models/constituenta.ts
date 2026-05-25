import { type AnalysisResult } from './analysis';
import { type CstType } from './common';
import { type DiagnosticRecord } from './diagnostic';

export interface ConstituentaDraft {
  id: number;
  /** Alias */
  alias: string;
  /** CST type */
  cstType: CstType;
  /** Formal definition */
  definitionFormal: string;
  /** Natural-language term */
  term?: string;
  /** Natural-language definition */
  definitionText?: string;
  /** Convention or comment */
  convention?: string;
}

export interface ConstituentaState extends Omit<ConstituentaDraft, 'term' | 'definitionText' | 'convention'> {
  term: string;
  definitionText: string;
  convention: string;
  analysis: AnalysisResult;
}

export interface AddOrUpdateConstituentaInput {
  draft: ConstituentaDraft;
}

export interface AddOrUpdateConstituentaResult {
  state: ConstituentaState;
  diagnostics: DiagnosticRecord[];
}
