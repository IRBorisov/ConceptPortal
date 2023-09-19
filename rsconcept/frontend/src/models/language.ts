// Module: Natural language model declarations.


// ====== Morphology ========
export enum Grammeme {
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
  PNCT = 'PNCT',

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
  Grammeme.PREP, Grammeme.CONJ, Grammeme.PRCL, Grammeme.INTJ,
  Grammeme.PNCT
];

export const Gender = [
  Grammeme.masc, Grammeme.femn, Grammeme.neut
];

export const Case = [
  Grammeme.nomn, Grammeme.gent, Grammeme.datv,
  Grammeme.accs, Grammeme.ablt, Grammeme.loct
];

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
