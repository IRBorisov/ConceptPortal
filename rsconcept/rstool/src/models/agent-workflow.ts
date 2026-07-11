import { type CstType } from './common';
import { type ApplyConstituentsMode, type ApplyConstituentsResult, type ConstituentaDraft } from './constituenta';
import { type Diagnostic } from './diagnostic';
import { type SessionHandle, type SessionRevision, type SessionState } from './session';

/** Level of detail returned by {@link RSToolAgent.getSessionState}. */
export type SessionStateDetail = 'summary' | 'full';

/** Result of `getSessionState`: compact summary or full cloned session state. */
export type SessionStateResult = SessionSummary | SessionState;

/**
 * Partial constituent update used in {@link ApplySchemaPatchInput}.
 *
 * `alias` is required; other fields are merged with any existing constituent
 * or inferred from the alias prefix when omitted.
 */
export interface AgentConstituentaPatch extends Omit<Partial<ConstituentaDraft>, 'alias'> {
  alias: string;
}

/** Input for {@link RSToolAgent.applySchemaPatch}. */
export interface ApplySchemaPatchInput {
  /** Metadata used only when a new session is created for this patch. */
  initial?: {
    alias?: string;
    title?: string;
    comment?: string;
  };
  /** Constituent patches to apply in dependency order. */
  items: AgentConstituentaPatch[];
  /** atomic: rollback on first failure; best_effort applies valid drafts. Default: atomic. */
  mode?: ApplyConstituentsMode;
  /** When set, a revision is recorded after a successful patch. */
  commitMessage?: string;
}

/** Result of {@link RSToolAgent.restoreOrder}. */
export interface RestoreOrderResult {
  /** Constituent ids in the restored declaration order. */
  orderedIds: number[];
  /** Aliases in the same order as {@link orderedIds}. */
  orderedAliases: string[];
}

/** One row of an identification (substitution) table, by alias. */
export interface SynthesisSubstitution {
  /** Alias of the constituenta being replaced (deleted). */
  original: string;
  /** Alias of the surviving constituenta. */
  substitution: string;
}

/** Input for {@link RSToolAgent.synthesize}. */
export interface SynthesizeInput {
  /** Session whose constituents are merged into the receiver. */
  sourceSessionId: string;
  /**
   * Optional subset of source aliases to import.
   * Omit or pass an empty array to import all source constituents.
   */
  items?: string[];
  /**
   * Identification table: one endpoint is a source alias, the other a receiver alias
   * (same rules as Portal schema embedding / «Встраивание схемы»).
   */
  substitutions?: SynthesisSubstitution[];
  /** When set, a revision is recorded after a successful synthesis. */
  commitMessage?: string;
}

/** Result of {@link RSToolAgent.synthesize}. */
export interface SynthesizeResult {
  session: SessionHandle;
  summary: SessionSummary;
  /** Source constituent id → inserted id in the receiver (before substitutions). */
  idMap: Record<number, number>;
  /** Alias remapping applied to imported constituents. */
  aliasMapping: Record<string, string>;
  /** Ids removed by substitutions. */
  deletedIds: number[];
  /** Ids of constituents inserted from the source (may include later-deleted ones). */
  insertedIds: number[];
  revision?: SessionRevision;
}

/** Compact view of one constituent in a session summary. */
export interface SessionSummaryItem {
  id: number;
  alias: string;
  cstType: CstType;
  analysisSuccess: boolean;
}

/** Compact session overview returned by default from `getSessionState`. */
export interface SessionSummary {
  sessionId: string;
  contractVersion: string;
  alias: string;
  title: string;
  comment: string;
  itemCount: number;
  modelItemCount: number;
  diagnosticsCount: number;
  items: SessionSummaryItem[];
  diagnostics: Diagnostic[];
  lastRevision?: SessionRevision;
}

/** Result of {@link RSToolAgent.applySchemaPatch}. */
export interface ApplySchemaPatchResult extends ApplyConstituentsResult {
  session: SessionHandle;
  summary: SessionSummary;
  revision?: SessionRevision;
}
