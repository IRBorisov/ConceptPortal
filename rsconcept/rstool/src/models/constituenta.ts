import { type AnalysisResult } from './analysis';
import { type CstType } from './common';
import { type Diagnostic } from './diagnostic';

/** Constituent payload before analysis and merge into session state. */
export interface ConstituentaDraft {
  id: number;
  /** Unique alias (e.g. `X1`, `D2`). */
  alias: string;
  /** Constituent type. */
  cstType: CstType;
  /** Formal RSLang definition. */
  definitionFormal: string;
  /** Natural-language term. */
  term?: string;
  /** Natural-language definition. */
  definitionText?: string;
  /** Convention or comment. */
  convention?: string;
}

/** Constituent stored in session state after analysis. */
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
  diagnostics: Diagnostic[];
}

/** How a multi-draft apply handles partial failures. */
export type ApplyConstituentsMode = 'atomic' | 'best_effort';

export interface ApplyConstituentsInput {
  drafts: ConstituentaDraft[];
  /** atomic: rollback on first failure; best_effort: apply valid drafts. Default: atomic. */
  mode?: ApplyConstituentsMode;
}

export interface ApplyConstituentsResult {
  success: boolean;
  applied: ConstituentaState[];
  failed: Array<{ draft: ConstituentaDraft; diagnostics: Diagnostic[] }>;
  diagnostics: Diagnostic[];
}
