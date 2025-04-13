/**
 * Module: Natural language model API.
 */

import {
  Grammeme,
  GrammemeGroups,
  type IEntityReference,
  type IReference,
  type ISyntacticReference,
  type IWordForm,
  NounGrams,
  ReferenceType,
  VerbGrams
} from './language';

/**
 * Equality comparator for {@link IWordForm}. Compares a set of Grammemes attached to wordforms
 */
export function wordFormEquals(left: IWordForm, right: IWordForm): boolean {
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

/**
 * Compares {@link Grammeme} based on Grammeme enum and alpha order for strings.
 */
export function grammemeCompare(left: Grammeme, right: Grammeme): number {
  const indexLeft = Object.values(Grammeme).findIndex(gram => gram === left);
  const indexRight = Object.values(Grammeme).findIndex(gram => gram === right);
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
 * Transforms {@link Grammeme} enumeration to {@link Grammeme}.
 */
export function parseGrammemes(termForm: string): Grammeme[] {
  const result: Grammeme[] = [];
  const chunks = termForm.split(',');
  chunks.forEach(chunk => {
    const gram = chunk.trim();
    if (gram !== '') {
      result.push(gram as Grammeme);
    }
  });
  return result.sort(grammemeCompare);
}

/**
 * Creates a list of compatible {@link Grammeme}s.
 */
export function getCompatibleGrams(input: Grammeme[]): Grammeme[] {
  let result: Grammeme[] = [];
  input.forEach(gram => {
    if (!result.includes(gram)) {
      if (NounGrams.includes(gram)) {
        result.push(...NounGrams);
      }
      if (VerbGrams.includes(gram)) {
        result.push(...VerbGrams);
      }
    }
  });

  input.forEach(gram =>
    GrammemeGroups.forEach(group => {
      if (group.includes(gram)) {
        result = result.filter(item => !group.includes(item));
      }
    })
  );

  if (result.length === 0) {
    return [...new Set<Grammeme>([...VerbGrams, ...NounGrams])];
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
  };
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
  };
}

/**
 * Transforms {@link IReference} to string representation.
 */
export function referenceToString(ref: IReference): string {
  switch (ref.type) {
    case ReferenceType.ENTITY: {
      const entity = ref.data as IEntityReference;
      return `@{${entity.entity}|${entity.form}}`;
    }
    case ReferenceType.SYNTACTIC: {
      const syntactic = ref.data as ISyntacticReference;
      return `@{${syntactic.offset}|${syntactic.nominal}}`;
    }
  }
}
