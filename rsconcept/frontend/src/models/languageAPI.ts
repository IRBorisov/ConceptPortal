/**
 * Module: Natural language model API.
 */

import { GramData, Grammeme, GrammemeGroups, IEntityReference, ISyntacticReference, IWordForm, NounGrams, VerbGrams } from './language';

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