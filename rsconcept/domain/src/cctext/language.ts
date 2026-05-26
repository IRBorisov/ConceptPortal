/**
 * Module: Natural language model declarations.
 */

/** Represents single unit of language Morphology. */
// prettier-ignore
export const Grammeme = {
  // Число
  sing: 'sing', plur: 'plur',

  // Падеж
  nomn: 'nomn', gent: 'gent', datv: 'datv',
  accs: 'accs', ablt: 'ablt', loct: 'loct',
} as const;
export type Grammeme = (typeof Grammeme)[keyof typeof Grammeme];

/** Represents case language concept. */
export const Case: Grammeme[] = [
  Grammeme.nomn,
  Grammeme.gent,
  Grammeme.datv,
  Grammeme.accs,
  Grammeme.ablt,
  Grammeme.loct
] as const;

/** Represents plurality language concept. */
export const Plurality: Grammeme[] = [Grammeme.sing, Grammeme.plur] as const;

/** Represents specific wordform attached to {@link Grammeme}s. */
export interface WordForm {
  text: string;
  grams: Grammeme[];
}

/** Represents a term available for text reference resolution. */
export interface TermContextItem {
  nominal: string;
  forms?: WordForm[];
}

/** Represents term lookup context keyed by entity alias. */
export type TermContext = Record<string, TermContextItem>;

/**
 * Represents list of {@link Grammeme}s available in reference construction.
 */
// prettier-ignore
export const supportedGrammemes = [
  Grammeme.sing, Grammeme.plur,
  Grammeme.nomn, Grammeme.gent, Grammeme.datv,
  Grammeme.accs, Grammeme.ablt, Grammeme.loct,
] as const;

// ====== Reference resolution =====

/** Represents text reference type. */
export const ReferenceType = {
  ENTITY: 'entity',
  SYNTACTIC: 'syntax'
} as const;
export type ReferenceType = (typeof ReferenceType)[keyof typeof ReferenceType];

/** Represents entity reference payload. */
export interface EntityReference {
  entity: string;
  tags: Grammeme[];
}

/** Represents syntactic reference payload. */
export interface SyntacticReference {
  offset: number;
  nominal: string;
}

/** Represents abstract reference data. */
export interface IReference {
  type: ReferenceType;
  data: EntityReference | SyntacticReference;
}
