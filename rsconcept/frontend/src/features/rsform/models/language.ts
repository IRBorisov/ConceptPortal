/**
 * Module: Natural language model declarations.
 */

import { z } from 'zod';

/**
 * Represents single unit of language Morphology.
 */
// prettier-ignore
export enum Grammeme {
  // Части речи
  NOUN = 'NOUN', ADJF = 'ADJF', ADJS = 'ADJS', COMP = 'COMP',
  VERB = 'VERB', INFN = 'INFN', PRTF = 'PRTF', PRTS = 'PRTS',
  GRND = 'GRND', NUMR = 'NUMR', ADVB = 'ADVB', NPRO = 'NPRO',
  PRED = 'PRED', PREP = 'PREP', CONJ = 'CONJ', PRCL = 'PRCL',
  INTJ = 'INTJ',

  // Одушевленность
  anim = 'anim', inan = 'inan',

  // Род
  masc = 'masc', femn = 'femn', neut = 'neut',

  // Число
  sing = 'sing', plur = 'plur',

  // Падеж (основные)
  nomn = 'nomn', gent = 'gent', datv = 'datv',
  accs = 'accs', ablt = 'ablt', loct = 'loct',

  // Совершенный / несовершенный вид
  perf = 'perf', impf = 'impf',

  // Переходность
  tran = 'tran', intr = 'intr',

  // Время
  pres = 'pres', past = 'past', futr = 'futr',

  // Лицо
  per1 = '1per', per2 = '2per', per3 = '3per',

  // Наклонение
  indc = 'indc', impr = 'impr',

  // Включение говорящего в действие
  incl = 'incl', excl = 'excl',

  // Залог
  actv = 'actv', pssv = 'pssv',

  // Стиль речи
  Infr = 'Infr', // Неформальный
  Slng = 'Slng', // Жаргон
  Arch = 'Arch', // Устаревший
  Litr = 'Litr', // Литературный

  // Аббревиатура
  Abbr = 'Abbr'
}

/**
 * Represents part of speech language concept.
 *
 * Implemented as a list of mutually exclusive {@link Grammeme}s.
 */
export const PartOfSpeech = [
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
];

/**
 * Represents gender language concept.
 *
 * Implemented as a list of mutually exclusive {@link Grammeme}s.
 */
export const Gender = [Grammeme.masc, Grammeme.femn, Grammeme.neut];

/**
 * Represents case language concept.
 *
 * Implemented as a list of mutually exclusive {@link Grammeme}s.
 */
export const Case = [Grammeme.nomn, Grammeme.gent, Grammeme.datv, Grammeme.accs, Grammeme.ablt, Grammeme.loct];

/**
 * Represents plurality language concept.
 *
 * Implemented as a list of mutually exclusive {@link Grammeme}s.
 */
export const Plurality = [Grammeme.sing, Grammeme.plur];

/**
 * Represents verb perfectivity language concept.
 *
 * Implemented as a list of mutually exclusive {@link Grammeme}s.
 */
export const Perfectivity = [Grammeme.perf, Grammeme.impf];

/**
 * Represents verb transitivity language concept.
 *
 * Implemented as a list of mutually exclusive {@link Grammeme}s.
 */
export const Transitivity = [Grammeme.tran, Grammeme.intr];

/**
 * Represents verb mood language concept.
 *
 * Implemented as a list of mutually exclusive {@link Grammeme}s.
 */
export const Mood = [Grammeme.indc, Grammeme.impr];

/**
 * Represents verb self-inclusion language concept.
 *
 * Implemented as a list of mutually exclusive {@link Grammeme}s.
 */
export const Inclusion = [Grammeme.incl, Grammeme.excl];

/**
 * Represents verb voice language concept.
 *
 * Implemented as a list of mutually exclusive {@link Grammeme}s.
 */
export const Voice = [Grammeme.actv, Grammeme.pssv];

/**
 * Represents verb tense language concept.
 *
 * Implemented as a list of mutually exclusive {@link Grammeme}s.
 */
export const Tense = [Grammeme.pres, Grammeme.past, Grammeme.futr];

/**
 * Represents verb person language concept.
 *
 * Implemented as a list of mutually exclusive {@link Grammeme}s.
 */
export const Person = [Grammeme.per1, Grammeme.per2, Grammeme.per3];

/**
 * Represents complete list of language concepts.
 *
 * Implemented as a list of lists of {@link Grammeme}s.
 */
export const GrammemeGroups = [
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
];

/**
 * Represents NOUN-ish list of language concepts.
 *
 * Represented concepts can be target of inflection or coalition in a sentence.
 *
 * Implemented as a list of lists of {@link Grammeme}s.
 */
export const NounGrams = [Grammeme.NOUN, Grammeme.ADJF, Grammeme.ADJS, ...Case, ...Plurality];

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
];

/**
 * Represents {@link Grammeme} parse data.
 */
export type GramData = Grammeme | string;

/**
 * Represents specific wordform attached to {@link Grammeme}s.
 */
export interface IWordForm {
  text: string;
  grams: GramData[];
}

/**
 * Represents list of {@link Grammeme}s available in reference construction.
 */
// prettier-ignore
export const supportedGrammemes = [
  Grammeme.sing, Grammeme.plur,
  Grammeme.nomn, Grammeme.gent, Grammeme.datv,
  Grammeme.accs, Grammeme.ablt, Grammeme.loct,
];

/**
 * Represents single option for {@link Grammeme} selector.
 */
export interface IGrammemeOption {
  value: GramData;
  label: string;
}

// ====== Reference resolution =====

/**
 * Represents text reference type.
 */
export enum ReferenceType {
  ENTITY = 'entity',
  SYNTACTIC = 'syntax'
}

/**
 * Represents entity reference payload.
 */
export interface IEntityReference {
  entity: string;
  form: string;
}

/**
 * Represents syntactic reference payload.
 */
export interface ISyntacticReference {
  offset: number;
  nominal: string;
}

export const schemaReference = z.strictObject({
  type: z.nativeEnum(ReferenceType),
  data: z.union([
    z.strictObject({ entity: z.string(), form: z.string() }),
    z.strictObject({ offset: z.number(), nominal: z.string() })
  ])
});

/**
 * Represents abstract reference data.
 */
export type IReference = z.infer<typeof schemaReference>;
