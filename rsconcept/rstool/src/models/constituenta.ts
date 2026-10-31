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
  /** Portal flag. Omitted on an update keeps the value already stored in the session. */
  crucial?: boolean;
  /** Inflected term forms. Omitted on an update keeps the stored forms. */
  termForms?: Array<{ text: string; tags: string }>;
  /** Manual typification override. Omitted on an update keeps the stored text. */
  typificationManual?: string;
  /** Manual value-class override. Omitted on an update keeps the stored flag. */
  valueIsProperty?: boolean;
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
