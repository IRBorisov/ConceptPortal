import {
  type ApplySchemaPatchInput,
  type ApplySchemaPatchResult,
  type SessionStateDetail,
  type SessionStateResult
} from './agent-workflow';
import { type AnalysisResult, type AnalyzeExpressionInput } from './analysis';
import { type Diagnostic, type ListDiagnosticsFilters } from './diagnostic';
import { type EvaluateInput, type EvaluationResult } from './evaluation';
import { type ExportPortalInput, type ExportPortalResult, type ImportDataKind } from './import-export';
import { type RecalculateModelResult, type SessionModelState, type SetModelValuesInput } from './model-value';
import { type SessionHandle, type SessionRevision, type SessionState } from './session';

/** Agent-visible contract version; bump on breaking API changes. */
export const CONTRACT_VERSION = '3.0.0';

/** Options for constructing an {@link RSToolAgent}. */
export interface RSToolAgentOptions {
  /** When set, sessions are persisted to this directory and survive process restarts. */
  persistenceDir?: string;
}

/**
 * Public method surface of {@link RSToolAgent}.
 *
 * Each method accepts an optional `sessionId`; when omitted, the current session is used
 * (or a new one is created where noted).
 */
export interface RSToolAgentContract {
  /** Current contract version string (same as {@link CONTRACT_VERSION}). */
  readonly contractVersion: string;

  /** Return the current session, or create one with optional `initial` metadata. */
  ensureSession(initial?: Partial<SessionState>): SessionHandle;

  /** Create a new session and make it current. */
  createSession(initial?: Partial<SessionState>): SessionHandle;

  /** Return the current session handle, or `null` when none is active. */
  getCurrentSession(): SessionHandle | null;

  /** Switch the active session; throws when `sessionId` is unknown. */
  setCurrentSession(sessionId: string): SessionHandle;

  /** Apply constituent patches to the schema (analyze, merge, optionally commit). */
  applySchemaPatch(input: ApplySchemaPatchInput, sessionId?: string): ApplySchemaPatchResult;

  /** Return session summary (default) or full cloned state when `detail` is `'full'`. */
  getSessionState(detail?: SessionStateDetail, sessionId?: string): SessionStateResult;

  /** List diagnostics for the session, optionally filtered by constituent or kind. */
  listDiagnostics(filters?: ListDiagnosticsFilters, sessionId?: string): Diagnostic[];

  /** Parse and type-check an RSLang expression against the current schema context. */
  analyzeExpression(input: AnalyzeExpressionInput, sessionId?: string): AnalysisResult;

  /** Record a revision checkpoint with an optional message. */
  commitStep(message?: string, sessionId?: string): SessionRevision;

  /** Export the session as a JSON string (state + diagnostics). */
  exportSession(sessionId?: string): string;

  /** Export schema or model payload in Portal JSON format. */
  exportPortal(input: ExportPortalInput, sessionId?: string): ExportPortalResult;

  /**
   * Import a session export or Portal JSON payload and make the new session current.
   *
   * When `kind` is `'auto'`, the payload shape is detected automatically.
   */
  importData(payload: string | object, kind?: ImportDataKind): SessionHandle;

  /** Set or clear model values for constituents; returns the updated model state. */
  setModelValues(input: SetModelValuesInput, sessionId?: string): Promise<SessionModelState>;

  /** Return a deep clone of the session model state. */
  getModelState(sessionId?: string): SessionModelState;

  /**
   * Evaluate a stored constituent or a scratch expression.
   *
   * Provide `constituentId`, or both `expression` and `cstType`.
   */
  evaluate(input: EvaluateInput, sessionId?: string): EvaluationResult;

  /** Recompute derived model values for all constituents. */
  recalculateModel(sessionId?: string): RecalculateModelResult;
}
