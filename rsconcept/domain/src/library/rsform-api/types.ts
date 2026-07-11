/**
 * Minimal constituenta shapes for schema transforms.
 */

import { type CstType, type TermForm } from '../rsform';

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

/** Constituent fields needed to resolve term/definition entity references. */
export interface ResolvableConstituenta {
  id: number;
  alias: string;
  term_raw: string;
  term_resolved: string;
  term_forms: TermForm[];
  definition_raw: string;
  definition_resolved: string;
}

/** Constituent fields needed to allocate or reset aliases by type. */
export interface AliasTypedConstituenta {
  alias: string;
  cst_type: CstType;
}
