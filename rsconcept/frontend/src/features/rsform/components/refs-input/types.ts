import { type Grammeme } from '@/domain/cctext/language';

/** UI coordinates for inline editors rendered in a portal. */
export interface InlinePosition {
  top: number;
  left: number;
}

/** UI state for syntactic reference inline editor. */
export interface SyntacticRefState {
  nominal: string;
  offset: number;
  refsCount: number;
  baseIndex: number;
}

/** UI state for entity reference inline editor. */
export interface EntityRefState {
  query: string;
  entity: string;
  tags: Grammeme[];
}
