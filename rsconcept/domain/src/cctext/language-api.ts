/**
 * Module: Natural language model API.
 */

import {
  Case,
  type EntityReference,
  Grammeme,
  type IReference,
  Plurality,
  ReferenceType,
  type SyntacticReference,
  type TermContext,
  type TermContextItem,
  type WordForm
} from './language';

interface Position {
  from: number;
  to: number;
}

interface ResolvedReference {
  ref: IReference;
  resolved: string;
  posInput: Position;
}

const REFERENCE_PATTERN = /@{[^{}]*?}/g;
const ENTITY_REFERENCE_PATTERN = /@{([^0-9\-][^}|{]*?)\|([^}|{]*?)}/g;

/** Represents generated lexeme forms. */
export interface Lexeme {
  items: { text: string; grams: string }[];
}

/** Equality comparator for {@link WordForm}. Compares a set of Grammemes attached to wordforms. */
export function wordFormEquals(left: WordForm, right: WordForm): boolean {
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

/** Transforms {@link Grammeme} enumeration to {@link Grammeme}. */
export function parseGrammemes(termForm: string): Grammeme[] {
  const result: Grammeme[] = [];
  for (const chunk of termForm.split(',')) {
    const gram = chunk.trim();
    if (gram !== '') {
      result.push(gram as Grammeme);
    }
  }
  return result.sort(grammemeCompare);
}

/** Generates all supported noun forms using nominal text for every form. */
export function generateNominalLexeme(data: { text: string }): Lexeme {
  return {
    items: Plurality.flatMap(plurality =>
      Case.map(gramCase => ({
        text: data.text,
        grams: `${plurality},${gramCase}`
      }))
    )
  };
}

/**
 * Extracts {@link EntityReference} from string representation.
 *
 * @param text - Reference text in a valid pattern. Must fit format '\@\{GLOBAL_ID|GRAMMEMES\}'
 */
export function parseEntityReference(text: string): EntityReference {
  const ref = parseReference(text);
  if (ref?.type !== ReferenceType.ENTITY) {
    throw new Error(`Invalid entity reference: ${text}`);
  }
  return ref.data as EntityReference;
}

/**
 * Extracts {@link SyntacticReference} from string representation.
 *
 * @param text - Reference text in a valid pattern. Must fit format '\@\{OFFSET|NOMINAL_FORM\}'
 */
export function parseSyntacticReference(text: string): SyntacticReference {
  const ref = parseReference(text);
  if (ref?.type !== ReferenceType.SYNTACTIC) {
    throw new Error(`Invalid syntactic reference: ${text}`);
  }
  return ref.data as SyntacticReference;
}

/** Extracts a validated reference from string representation. */
export function parseReference(text: string): IReference | null {
  if (text.length < 4 || !text.startsWith('@{') || !text.endsWith('}')) {
    return null;
  }

  const blocks = text
    .slice(2, text.length - 1)
    .split('|')
    .map(block => block.trim());
  if (blocks.length !== 2 || blocks[0] === '' || blocks[0].startsWith('0')) {
    return null;
  }

  if (blocks[0].startsWith('-') || /^[1-9]/.test(blocks[0])) {
    const offset = Number(blocks[0]);
    if (!Number.isInteger(offset) || offset === 0 || blocks[1] === '') {
      return null;
    }
    return {
      type: ReferenceType.SYNTACTIC,
      data: { offset, nominal: blocks[1] }
    };
  }

  return {
    type: ReferenceType.ENTITY,
    data: { entity: blocks[0], tags: parseGrammemes(blocks[1].replaceAll(' ', '')) }
  };
}

/** Apply alias mapping to entity references in terminological text. */
export function applyEntityReferenceMapping(text: string, mapping: Record<string, string>): string {
  if (text === '' || Object.keys(mapping).length === 0) {
    return text;
  }

  let posInput = 0;
  let output = '';
  for (const segment of text.matchAll(ENTITY_REFERENCE_PATTERN)) {
    const entity = segment[1];
    const entityKey = entity.trim();
    const start = segment.index ?? 0;
    if (entityKey in mapping) {
      output += text.substring(posInput, start + 2);
      output += mapping[entityKey];
      output += text.substring(start + 2 + entity.length, start + segment[0].length);
      posInput = start + segment[0].length;
    }
  }
  output += text.substring(posInput);
  return output;
}

/** Extracts unique entity aliases referenced by text. */
export function extractEntities(text: string): string[] {
  const result: string[] = [];
  for (const segment of text.matchAll(ENTITY_REFERENCE_PATTERN)) {
    const entity = segment[1].trim();
    if (!result.includes(entity)) {
      result.push(entity);
    }
  }
  return result;
}

/** Resolves text references using nominal terms and optional manually edited forms. */
export function resolveTextReferences(text: string, context: TermContext): string {
  const references = parseReferences(text);
  if (references.length === 0) {
    return text;
  }

  for (const ref of references) {
    if (ref.ref.type === ReferenceType.ENTITY) {
      ref.resolved = resolveEntity(ref.ref.data as EntityReference, context);
    }
  }
  references.forEach((ref, index) => {
    if (ref.ref.type === ReferenceType.SYNTACTIC) {
      ref.resolved = resolveSyntactic(ref.ref.data as SyntacticReference, index, references);
    }
  });

  let posInput = 0;
  let output = '';
  for (const ref of references) {
    output += text.substring(posInput, ref.posInput.from);
    output += ref.resolved;
    posInput = ref.posInput.to;
  }
  output += text.substring(posInput);
  return output;
}

/** Transforms {@link IReference} to string representation. */
export function referenceToString(ref: IReference): string {
  switch (ref.type) {
    case ReferenceType.ENTITY: {
      const entity = ref.data as EntityReference;
      return `@{${entity.entity}|${entity.tags.join(',')}}`;
    }
    case ReferenceType.SYNTACTIC: {
      const syntactic = ref.data as SyntacticReference;
      return `@{${syntactic.offset}|${syntactic.nominal}}`;
    }
  }
}

// ===== Internals =======

/** Compares {@link Grammeme} based on Grammeme enum and alpha order for strings. */
function grammemeCompare(left: Grammeme, right: Grammeme): number {
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

function parseReferences(text: string): ResolvedReference[] {
  const result: ResolvedReference[] = [];
  for (const segment of text.matchAll(REFERENCE_PATTERN)) {
    const ref = parseReference(segment[0]);
    if (ref) {
      result.push({
        ref,
        resolved: '',
        posInput: { from: segment.index ?? 0, to: (segment.index ?? 0) + segment[0].length }
      });
    }
  }
  return result;
}

function resolveEntity(ref: EntityReference, context: TermContext): string {
  const entity = context[ref.entity];
  if (!entity) {
    return `!Неизвестная сущность: ${ref.entity}!`;
  }

  const resolved = getEntityForm(entity, ref.tags);
  return resolved === '' ? `!Отсутствует термин: ${ref.entity}!` : resolved;
}

function getEntityForm(entity: TermContextItem, grams: Grammeme[]): string {
  if (grams.length === 0) {
    return entity.nominal;
  }

  const manual = entity.forms?.find(form => matchGrams(grams, form.grams));
  return manual?.text ?? entity.nominal;
}

function matchGrams(query: Grammeme[], candidate: Grammeme[]): boolean {
  for (const gram of candidate) {
    if (!query.includes(gram)) {
      return false;
    }
  }
  return true;
}

function resolveSyntactic(ref: SyntacticReference, index: number, references: ResolvedReference[]): string {
  const master = findSyntacticMaster(ref.offset, index, references);
  if (!master) {
    return `!Некорректное смещение: ${ref.offset}!`;
  }
  return ref.nominal;
}

function findSyntacticMaster(
  offset: number,
  index: number,
  references: ResolvedReference[]
): ResolvedReference | undefined {
  if (offset > 0) {
    let position = index + 1;
    let left = offset;
    while (position < references.length) {
      if (references[position].ref.type === ReferenceType.ENTITY) {
        if (left === 1) {
          return references[position];
        }
        left -= 1;
      }
      position += 1;
    }
  } else {
    let position = index - 1;
    let left = offset;
    while (position >= 0) {
      if (references[position].ref.type === ReferenceType.ENTITY) {
        if (left === -1) {
          return references[position];
        }
        left += 1;
      }
      position -= 1;
    }
  }
  return undefined;
}
