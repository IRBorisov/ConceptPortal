import { type ConstituentaState } from './constituenta';
import { type SessionModelState } from './model-value';

/** Opaque session reference returned by create/import operations. */
export interface SessionHandle {
  sessionId: string;
  contractVersion: string;
}

/** Recorded checkpoint in session revision history. */
export interface SessionRevision {
  revisionId: string;
  at: string;
  message?: string;
}

/** Full in-memory session state. */
export interface SessionState {
  sessionId: string;
  /** Library item alias for the conceptual schema or model. */
  alias: string;
  /** Human-readable title. */
  title: string;
  /** Developer comment (Portal JSON `description` on export). */
  comment: string;
  /** ISO timestamp of session creation. */
  createdAt: string;
  /** ISO timestamp of last mutation. */
  updatedAt: string;
  /** Revision checkpoints recorded via {@link RSToolAgent.commitStep}. */
  revisions: SessionRevision[];
  /** Analyzed constituents in the conceptual schema. */
  items: ConstituentaState[];
  /** Evaluated model values. */
  model: SessionModelState;
}
