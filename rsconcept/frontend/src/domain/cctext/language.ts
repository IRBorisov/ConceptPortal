/**
 * Module: Natural language model declarations.
 */

import { z } from 'zod';

/**
 * Represents single unit of language Morphology.
 */
// prettier-ignore
export const Grammeme = {
  // Части речи
  NOUN: 'NOUN', ADJF: 'ADJF', ADJS: 'ADJS', COMP: 'COMP',
  VERB: 'VERB', INFN: 'INFN', PRTF: 'PRTF', PRTS: 'PRTS',
  GRND: 'GRND', NUMR: 'NUMR', ADVB: 'ADVB', NPRO: 'NPRO',
  PRED: 'PRED', PREP: 'PREP', CONJ: 'CONJ', PRCL: 'PRCL',
  INTJ: 'INTJ',

  // Одушевленность
  anim: 'anim', inan: 'inan',

  // Род
  masc: 'masc', femn: 'femn', neut: 'neut',

  // Число
  sing: 'sing', plur: 'plur',

  // Падеж (основные)
  nomn: 'nomn', gent: 'gent', datv: 'datv',
  accs: 'accs', ablt: 'ablt', loct: 'loct',

  // Совершенный / несовершенный вид
  perf: 'perf', impf: 'impf',

  // Переходность
  tran: 'tran', intr: 'intr',

  // Время
  pres: 'pres', past: 'past', futr: 'futr',

  // Лицо
  per1: '1per', per2: '2per', per3: '3per',

  // Наклонение
  indc: 'indc', impr: 'impr',

  // Включение говорящего в действие
  incl: 'incl', excl: 'excl',

  // Залог
  actv: 'actv', pssv: 'pssv',

  // Стиль речи
  Infr: 'Infr', // Неформальный
  Slng: 'Slng', // Жаргон
  Arch: 'Arch', // Устаревший
  Litr: 'Litr', // Литературный

  // Аббревиатура
  Abbr: 'Abbr'
} as const;
export type Grammeme = (typeof Grammeme)[keyof typeof Grammeme];
export const schemaGrammeme = z.enum(Object.values(Grammeme) as [Grammeme, ...Grammeme[]]);

/**
 * Represents part of speech language concept.
 *
 * Implemented as a list of mutually exclusive {@link Grammeme}s.
 */
export const PartOfSpeech: Grammeme[] = [
  Grammeme.NOUN,
  Grammeme.ADJF,
  Grammeme.ADJS,
  Grammeme.COMP,
  Grammeme.VERB,
  Grammeme.INFN,
  Grammeme.PRTF,
  Grammeme.PRTS,
  Grammeme.GRND,
  Grammeme.ADVB,
  Grammeme.NPRO,
  Grammeme.PRED,
  Grammeme.PREP,
  Grammeme.CONJ,
  Grammeme.PRCL,
  Grammeme.INTJ
] as const;

/**
 * Represents gender language concept.
 *
 * Implemented as a list of mutually exclusive {@link Grammeme}s.
 */
export const Gender: Grammeme[] = [Grammeme.masc, Grammeme.femn, Grammeme.neut] as const;

/**
 * Represents case language concept.
 *
 * Implemented as a list of mutually exclusive {@link Grammeme}s.
 */
export const Case: Grammeme[] = [
  Grammeme.nomn,
  Grammeme.gent,
  Grammeme.datv,
  Grammeme.accs,
  Grammeme.ablt,
  Grammeme.loct
] as const;

/**
 * Represents plurality language concept.
 *
 * Implemented as a list of mutually exclusive {@link Grammeme}s.
 */
export const Plurality: Grammeme[] = [Grammeme.sing, Grammeme.plur] as const;

/**
 * Represents verb perfectivity language concept.
 *
 * Implemented as a list of mutually exclusive {@link Grammeme}s.
 */
export const Perfectivity: Grammeme[] = [Grammeme.perf, Grammeme.impf] as const;

/**
 * Represents verb transitivity language concept.
 *
 * Implemented as a list of mutually exclusive {@link Grammeme}s.
 */
export const Transitivity: Grammeme[] = [Grammeme.tran, Grammeme.intr] as const;

/**
 * Represents verb mood language concept.
 *
 * Implemented as a list of mutually exclusive {@link Grammeme}s.
 */
export const Mood: Grammeme[] = [Grammeme.indc, Grammeme.impr] as const;

/**
 * Represents verb self-inclusion language concept.
 *
 * Implemented as a list of mutually exclusive {@link Grammeme}s.
 */
export const Inclusion: Grammeme[] = [Grammeme.incl, Grammeme.excl] as const;

/**
 * Represents verb voice language concept.
 *
 * Implemented as a list of mutually exclusive {@link Grammeme}s.
 */
export const Voice: Grammeme[] = [Grammeme.actv, Grammeme.pssv] as const;

/**
 * Represents verb tense language concept.
 *
 * Implemented as a list of mutually exclusive {@link Grammeme}s.
 */
export const Tense: Grammeme[] = [Grammeme.pres, Grammeme.past, Grammeme.futr] as const;

/**
 * Represents verb person language concept.
 *
 * Implemented as a list of mutually exclusive {@link Grammeme}s.
 */
export const Person: Grammeme[] = [Grammeme.per1, Grammeme.per2, Grammeme.per3] as const;

/**
 * Represents complete list of language concepts.
 *
 * Implemented as a list of lists of {@link Grammeme}s.
 */
export const GrammemeGroups: Grammeme[][] = [
  PartOfSpeech,
  Gender,
  Case,
  Plurality,
  Perfectivity,
  Transitivity,
  Mood,
  Inclusion,
  Voice,
  Tense,
  Person
] as const;

/**
 * Represents NOUN-ish list of language concepts.
 *
 * Represented concepts can be target of inflection or coalition in a sentence.
 *
 * Implemented as a list of lists of {@link Grammeme}s.
 */
export const NounGrams: Grammeme[] = [Grammeme.NOUN, Grammeme.ADJF, Grammeme.ADJS, ...Case, ...Plurality] as const;

/**
 * Represents VERB-ish list of language concepts.
 *
 * Represented concepts can be target of inflection or coalition in a sentence.
 *
 * Implemented as a list of lists of {@link Grammeme}s.
 */
export const VerbGrams = [
  Grammeme.VERB,
  Grammeme.INFN,
  Grammeme.PRTF,
  Grammeme.PRTS,
  ...Perfectivity,
  ...Transitivity,
  ...Mood,
  ...Inclusion,
  ...Voice,
  ...Tense,
  ...Person
] as const;

/**
 * Represents specific wordform attached to {@link Grammeme}s.
 */
export interface WordForm {
  text: string;
  grams: Grammeme[];
}

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
  form: string;
}

/** Represents syntactic reference payload. */
export interface SyntacticReference {
  offset: number;
  nominal: string;
}

export const schemaReferenceType = z.enum(Object.values(ReferenceType) as [ReferenceType, ...ReferenceType[]]);

export const schemaReference = z.strictObject({
  type: schemaReferenceType,
  data: z.union([
    z.strictObject({ entity: z.string(), form: z.string() }),
    z.strictObject({ offset: z.number(), nominal: z.string() })
  ])
});

/** Represents abstract reference data. */
export type IReference = z.infer<typeof schemaReference>;
