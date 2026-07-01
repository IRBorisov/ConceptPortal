import { type RSToolErrorDescription } from './common';

/** Persisted diagnostic for a failed or warned expression in a session. */
export interface DiagnosticRecord {
  sessionId: string;
  /** Constituent id when the diagnostic is tied to a stored item; omitted for scratch analysis. */
  constituentId?: number;
  /** Expression text that was analyzed. */
  expression: string;
  error: RSToolErrorDescription;
}

/** Filters for {@link RSToolAgent.listDiagnostics}. */
export interface ListDiagnosticsFilters {
  constituentId?: number;
}
