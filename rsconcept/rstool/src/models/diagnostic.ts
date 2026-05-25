import { type RSToolErrorDescription } from './common';

export interface DiagnosticRecord {
  sessionId: string;
  constituentId?: number;
  expression: string;
  error: RSToolErrorDescription;
}

export interface ListDiagnosticsFilters {
  constituentId?: number;
}
