import { type ConstituentaState } from './constituenta';
import { type SessionModelState } from './model-value';

export interface SessionHandle {
  sessionId: string;
  contractVersion: string;
}

export interface SessionRevision {
  revisionId: string;
  at: string;
  message?: string;
}

export interface SessionState {
  sessionId: string;
  /** Library item alias for the conceptual schema or model. */
  alias: string;
  /** Human-readable title. */
  title: string;
  /** Developer comment (Portal JSON `description` on export). */
  comment: string;
  /** Date of creation. */
  createdAt: string;
  /** Date of last update. */
  updatedAt: string;
  /** List of revisions. */
  revisions: SessionRevision[];
  /** List of constituents in the session. */
  items: ConstituentaState[];
  /** Model state. */
  model: SessionModelState;
}
