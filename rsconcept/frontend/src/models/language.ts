// Module: Natural language model declarations.

/**
 * Represents single unit of language Morphology.
*/
export enum Grammeme {
  // Неизвестная граммема
  UNKN = 'UNKN',

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
 * Implemented as a list of mututally exclusive {@link Grammeme}s.
*/
export const PartOfSpeech = [
  Grammeme.NOUN, Grammeme.ADJF, Grammeme.ADJS, Grammeme.COMP,
  Grammeme.VERB, Grammeme.INFN, Grammeme.PRTF, Grammeme.PRTS,
  Grammeme.GRND, Grammeme.ADVB, Grammeme.NPRO, Grammeme.PRED,
  Grammeme.PREP, Grammeme.CONJ, Grammeme.PRCL, Grammeme.INTJ
];

/**
 * Represents gender language concept.
 * 
 * Implemented as a list of mututally exclusive {@link Grammeme}s.
*/
export const Gender = [
  Grammeme.masc, Grammeme.femn, Grammeme.neut
];

/**
 * Represents case language concept.
 * 
 * Implemented as a list of mututally exclusive {@link Grammeme}s.
*/
export const Case = [
  Grammeme.nomn, Grammeme.gent, Grammeme.datv,
  Grammeme.accs, Grammeme.ablt, Grammeme.loct
];

/**
 * Represents plurality language concept.
 * 
 * Implemented as a list of mututally exclusive {@link Grammeme}s.
*/
export const Plurality = [ Grammeme.sing, Grammeme.plur ];

/**
 * Represents verb perfectivity language concept.
 * 
 * Implemented as a list of mututally exclusive {@link Grammeme}s.
*/
export const Perfectivity = [ Grammeme.perf, Grammeme.impf ];

/**
 * Represents verb transitivity language concept.
 * 
 * Implemented as a list of mututally exclusive {@link Grammeme}s.
*/
export const Transitivity = [ Grammeme.tran, Grammeme.intr ];

/**
 * Represents verb mood language concept.
 * 
 * Implemented as a list of mututally exclusive {@link Grammeme}s.
*/
export const Mood = [ Grammeme.indc, Grammeme.impr ];

/**
 * Represents verb self-inclusion language concept.
 * 
 * Implemented as a list of mututally exclusive {@link Grammeme}s.
*/
export const Inclusion = [ Grammeme.incl, Grammeme.excl ];

/**
 * Represents verb voice language concept.
 * 
 * Implemented as a list of mututally exclusive {@link Grammeme}s.
*/
export const Voice = [ Grammeme.actv, Grammeme.pssv ];

/**
 * Represents verb tense language concept.
 * 
 * Implemented as a list of mututally exclusive {@link Grammeme}s.
*/
export const Tense = [
  Grammeme.pres,
  Grammeme.past,
  Grammeme.futr
];

/**
 * Represents verb person language concept.
 * 
 * Implemented as a list of mututally exclusive {@link Grammeme}s.
*/
export const Person = [
  Grammeme.per1,
  Grammeme.per2,
  Grammeme.per3
];

/**
 * Represents complete list of language concepts.
 * 
 * Implemented as a list of lists of {@link Grammeme}s.
*/
export const GrammemeGroups = [
  PartOfSpeech, Gender, Case, Plurality, Perfectivity,
  Transitivity, Mood, Inclusion, Voice, Tense, Person
];

/**
 * Represents NOUN-ish list of language concepts.
 * 
 * Represented concepts can be target of inflection or coalition in a sentence.
 * 
 * Implemented as a list of lists of {@link Grammeme}s.
*/
export const NounGrams = [
  Grammeme.NOUN, Grammeme.ADJF, Grammeme.ADJS,
  ...Gender,
  ...Case,
  ...Plurality
];

/**
 * Represents VERB-ish list of language concepts.
 * 
 * Represented concepts can be target of inflection or coalition in a sentence.
 * 
 * Implemented as a list of lists of {@link Grammeme}s.
*/
export const VerbGrams = [
  Grammeme.VERB, Grammeme.INFN, Grammeme.PRTF, Grammeme.PRTS,
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
export interface IGramData {
  type: Grammeme
  data: string
}

/**
 * Represents specific wordform attached to {@link Grammeme}s.
*/
export interface IWordForm {
  text: string
  grams: IGramData[]
}

/**
 * Equality comparator for {@link IGramData}. Compares text data for unknown grammemes
 */
export function matchGrammeme(left: IGramData, right: IGramData): boolean {
  if (left.type !== right.type) {
    return false;
  }
  return left.type !== Grammeme.UNKN || left.data === right.data;
}

/**
 * Equality comparator for {@link IWordForm}. Compares a set of Grammemes attached to wordforms
 */
export function matchWordForm(left: IWordForm, right: IWordForm): boolean {
  if (left.grams.length !== right.grams.length) {
    return false;
  }
  for (let index = 0; index < left.grams.length; ++index) {
    if (!matchGrammeme(left.grams[index], right.grams[index])) {
      return false;
    }
  }
  return true;
}

function parseSingleGrammeme(text: string): IGramData {
  if (Object.values(Grammeme).includes(text as Grammeme)) {
    return {
      data: text,
      type: text as Grammeme
    }
  } else {
    return {
      data: text,
      type: Grammeme.UNKN
    }
  }
}

export function sortGrammemes<TData extends IGramData>(input: TData[]): TData[] {
  const result: TData[] = [];
  Object.values(Grammeme).forEach(
  gram => {
    const item = input.find(data => data.type === gram);
    if (item) {
      result.push(item);
    }
  });
  return result;
}

export function parseGrammemes(termForm: string): IGramData[] {
  const result: IGramData[] = [];
  const chunks = termForm.split(',');
  chunks.forEach(chunk => {
    chunk = chunk.trim();
    if (chunk !== '') {
      result.push(parseSingleGrammeme(chunk));
    }
  });
  return sortGrammemes(result);
}

// ====== Reference resolution =====
export interface IRefsText {
  text: string
}

export enum ReferenceType {
  ENTITY = 'entity',
  SYNTACTIC = 'syntax'
}

export interface IEntityReference {
  entity: string
  form: string
}

export interface ISyntacticReference {
  offset: number
  nominal: string
}

export interface ITextPosition {
  start: number
  finish: number
}

export interface IResolvedReference {
  type: ReferenceType
  data: IEntityReference | ISyntacticReference
  pos_input: ITextPosition
  pos_output: ITextPosition
}

export interface IReferenceData {
  input: string
  output: string
  refs: IResolvedReference[]
}
