import { type Grammeme } from '../../models/language';

/** Represents inline position. */
export interface InlinePosition {
  top: number;
  left: number;
}

/** Represents inline syntactic editor state. */
export interface SyntacticRefState {
  nominal: string;
  offset: number;

  /** Amount of references to be linked to this syntactic reference. */
  refsCount: number;

  /** Index of the reference preceding input position in the main list of references. */
  baseIndex: number;
}

/** Represents inline syntactic editor state. */
export interface EntityRefState {
  query: string;
  entity: string;
  grams: Grammeme[];
}