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
  createdAt: string;
  updatedAt: string;
  revisions: SessionRevision[];
  items: ConstituentaState[];
  model: SessionModelState;
}
