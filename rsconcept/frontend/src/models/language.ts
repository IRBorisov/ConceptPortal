// Module: Natural language model declarations.


// ====== Morphology ========
export enum Grammeme {
  // Неизвестная граммема
  UNKN = 'UNKN',

  // Части речи
  NOUN = 'NOUN',
  ADJF = 'ADJF',
  ADJS = 'ADJS',
  COMP = 'COMP',
  VERB = 'VERB',
  INFN = 'INFN',
  PRTF = 'PRTF',
  PRTS = 'PRTS',
  GRND = 'GRND',
  NUMR = 'NUMR',
  ADVB = 'ADVB',
  NPRO = 'NPRO',
  PRED = 'PRED',
  PREP = 'PREP',
  CONJ = 'CONJ',
  PRCL = 'PRCL',
  INTJ = 'INTJ',

  // Одушевленность
  anim = 'anim',
  inan = 'inan',

  // Род
  masc = 'masc',
  femn = 'femn',
  neut = 'neut',

  // Число
  sing = 'sing',
  plur = 'plur',

  // Падеж (основные)
  nomn = 'nomn',
  gent = 'gent',
  datv = 'datv',
  accs = 'accs',
  ablt = 'ablt',
  loct = 'loct',

  // Совершенный / несовершенный вид
  perf = 'perf',
  impf = 'impf',

  // Переходность
  tran = 'tran',
  intr = 'intr',

  // Время
  pres = 'pres',
  past = 'past',
  futr = 'futr',

  // Лицо
  per1 = '1per',
  per2 = '2per',
  per3 = '3per',

  // Наклонение
  indc = 'indc',
  impr = 'impr',

  // Включение говорящего в действие
  incl = 'incl',
  excl = 'excl',

  // Залог
  actv = 'actv',
  pssv = 'pssv',

  // Стиль речи
  Infr = 'Infr', // Неформальный
  Slng = 'Slng', // Жаргон
  Arch = 'Arch', // Устаревший
  Litr = 'Litr', // Литературный

  // Аббревиатура
  Abbr = 'Abbr'
}

export const PartOfSpeech = [
  Grammeme.NOUN, Grammeme.ADJF, Grammeme.ADJS, Grammeme.COMP,
  Grammeme.VERB, Grammeme.INFN, Grammeme.PRTF, Grammeme.PRTS,
  Grammeme.GRND, Grammeme.ADVB, Grammeme.NPRO, Grammeme.PRED,
  Grammeme.PREP, Grammeme.CONJ, Grammeme.PRCL, Grammeme.INTJ
];

export const Gender = [
  Grammeme.masc, Grammeme.femn, Grammeme.neut
];

export const Case = [
  Grammeme.nomn, Grammeme.gent, Grammeme.datv,
  Grammeme.accs, Grammeme.ablt, Grammeme.loct
];

export const Plurality = [ Grammeme.sing, Grammeme.plur ];

export const Perfectivity = [ Grammeme.perf, Grammeme.impf ];
export const Transitivity = [ Grammeme.tran, Grammeme.intr ];
export const Mood = [ Grammeme.indc, Grammeme.impr ];
export const Inclusion = [ Grammeme.incl, Grammeme.excl ];
export const Voice = [ Grammeme.actv, Grammeme.pssv ];

export const Tense = [
  Grammeme.pres,
  Grammeme.past,
  Grammeme.futr
];

export const Person = [
  Grammeme.per1,
  Grammeme.per2,
  Grammeme.per3
];

export const GrammemeGroups = [
  PartOfSpeech, Gender, Case, Plurality, Perfectivity,
  Transitivity, Mood, Inclusion, Voice, Tense, Person
];

export const NounGrams = [
  Grammeme.NOUN, Grammeme.ADJF, Grammeme.ADJS,
  ...Gender,
  ...Case,
  ...Plurality
];

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

// Grammeme parse data
export interface IGramData {
  type: Grammeme
  data: string
}

// Equality comparator for IGramData
export function matchGrammeme(value: IGramData, test: IGramData): boolean {
  if (value.type !== test.type) {
    return false;
  }
  return value.type !== Grammeme.UNKN || value.data === test.data;
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

export function parseGrammemes(termForm: string): IGramData[] {
  const result: IGramData[] = [];
  const chunks = termForm.split(',');
  chunks.forEach(chunk => {
    chunk = chunk.trim();
    if (chunk !== '') {
      result.push(parseSingleGrammeme(chunk));
    }
  });
  return result;
}

export interface IWordForm {
  text: string
  grams: IGramData[]
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
