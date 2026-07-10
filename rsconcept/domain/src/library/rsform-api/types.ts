/**
 * Types for restoring constituent declaration order.
 */

import { type CstType } from '../rsform';

/** Minimal constituent fields required to restore order. */
export interface OrderableConstituenta {
  id: number;
  alias: string;
  cst_type: CstType;
  definition_formal: string;
}

/** Semantic parent/children derived from formal definitions (backend SemanticInfo). */
export interface SemanticRelations {
  /** Parent id for each constituenta (self when none). */
  parentOf: Map<number, number>;
  /** Semantic children ids for each constituenta. */
  childrenOf: Map<number, number[]>;
}
