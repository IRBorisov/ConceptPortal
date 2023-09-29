/**
 * Module: Natural language model declarations.
 */

/**
 * Represents API result for text output.
*/
export interface ITextResult {
  result: string
}

/**
 * Represents single unit of language Morphology.
*/
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
export type GramData = Grammeme | string;

/**
 * Represents specific wordform attached to {@link Grammeme}s.
*/
export interface IWordForm {
  text: string
  grams: GramData[]
}

/**
 * Represents wordform data used for backend communication.
*/
export interface IWordFormPlain {
  text: string
  grams: string
}

/**
 * Represents lexeme response containing multiple {@link Wordform}s.
*/
export interface ILexemeData {
  items: IWordFormPlain[]
}

/**
 * Equality comparator for {@link IWordForm}. Compares a set of Grammemes attached to wordforms
 */
export function matchWordForm(left: IWordForm, right: IWordForm): boolean {
  if (left.grams.length !== right.grams.length) {
    return false;
  }
  for (let index = 0; index < left.grams.length; ++index) {
    if (left.grams[index] !== right.grams[index]) {
      return false;
    }
  }
  return true;
}

function parseSingleGrammeme(text: string): GramData {
  if (Object.values(Grammeme).includes(text as Grammeme)) {
    return text as Grammeme;
  } else {
    return text;
  }
}

/**
 * Compares {@link GramData} based on Grammeme enum and alpha order for strings.
 */
export function compareGrammemes(left: GramData, right: GramData): number {
  const indexLeft = Object.values(Grammeme).findIndex(gram => gram === left as Grammeme);
  const indexRight = Object.values(Grammeme).findIndex(gram => gram === right as Grammeme);
  if (indexLeft === -1 && indexRight === -1) {
    return left.localeCompare(right);
  } else if (indexLeft === -1 && indexRight !== -1) {
    return 1;
  } else if (indexLeft !== -1 && indexRight === -1) {
    return -1;
  } else {
    return indexLeft - indexRight;
  }
}

/**
 * Transforms {@link Grammeme} enumeration to {@link GramData}.
 */
export function parseGrammemes(termForm: string): GramData[] {
  const result: GramData[] = [];
  const chunks = termForm.split(',');
  chunks.forEach(chunk => {
    chunk = chunk.trim();
    if (chunk !== '') {
      result.push(parseSingleGrammeme(chunk));
    }
  });
  return result.sort(compareGrammemes);
}

/**
 * Creates a list of compatible {@link Grammeme}s.
 */
export function getCompatibleGrams(input: Grammeme[]): Grammeme[] {
  let result: Grammeme[] = [];
  input.forEach(
  (gram) => {
    if (!result.includes(gram)) {
      if (NounGrams.includes(gram)) {
        result.push(...NounGrams);
      }
      if (VerbGrams.includes(gram)) {
        result.push(...VerbGrams);
      }
    }
  });

  input.forEach(
  (gram) => GrammemeGroups.forEach(
  (group) => {
    if (group.includes(gram)) {
      result = result.filter(item => !group.includes(item));
    }
  }));
  
  if (result.length === 0) {
    return [... new Set<Grammeme>([...VerbGrams, ...NounGrams])];
  } else {
    return result;
  }
}


// ====== Reference resolution =====
/**
 * Represents text request.
*/
export interface ITextRequest {
  text: string
}

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
  entity: string
  form: string
}

/**
 * Represents syntactic reference payload.
*/
export interface ISyntacticReference {
  offset: number
  nominal: string
}

/**
 * Represents text 0-indexed position inside another text.
*/
export interface ITextPosition {
  start: number
  finish: number
}

/**
 * Represents abstract reference data.
*/
export interface IReference {
  type: ReferenceType
  data: IEntityReference | ISyntacticReference
}

/**
 * Represents single resolved reference data.
*/
export interface IResolvedReference extends IReference {
  pos_input: ITextPosition
  pos_output: ITextPosition
}

/**
 * Represents resolved references data for the whole text.
*/
export interface IResolutionData {
  input: string
  output: string
  refs: IResolvedReference[]
}

/**
 * Extracts {@link IEntityReference} from string representation.
 * 
 * @param text - Reference text in a valid pattern. Must fit format '\@\{GLOBAL_ID|GRAMMEMES\}'
 */
export function parseEntityReference(text: string): IEntityReference {
  const blocks = text.slice(2, text.length - 1).split('|');
  return {
    entity: blocks[0].trim(),
    form: blocks[1].trim()
  }
}

/**
 * Extracts {@link ISyntacticReference} from string representation.
 * 
 * @param text - Reference text in a valid pattern. Must fit format '\@\{OFFSET|NOMINAL_FORM\}'
 */
export function parseSyntacticReference(text: string): ISyntacticReference {
  const blocks = text.slice(2, text.length - 1).split('|');
  return {
    offset: Number(blocks[0].trim()),
    nominal: blocks[1].trim()
  }
}