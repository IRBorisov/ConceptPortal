/**
 * Module: API for formal representation for systems of concepts.
 */

import {
  type AnalysisFull,
  RSErrorCode,
  TypeClass,
  TypeID,
  type TypePath,
  type Typification,
  ValueClass
} from '../rslang';
import { basic, bool, constant, type EchelonFunctional, isTypification } from '../rslang/semantic/typification';
import { applyPath } from '../rslang/semantic/typification-api';

import { type LibraryItem } from './library';
import {
  type ArgumentValue,
  type Constituenta,
  CstClass,
  CstStatus,
  CstType,
  type RSForm,
  type RSFormStats
} from './rsform';

/** Record of {@link CstType} prefixes. */
const CST_TYPE_PREFIX: Record<CstType, string> = {
  [CstType.NOMINAL]: 'N',
  [CstType.BASE]: 'X',
  [CstType.CONSTANT]: 'C',
  [CstType.STRUCTURED]: 'S',
  [CstType.AXIOM]: 'A',
  [CstType.TERM]: 'D',
  [CstType.FUNCTION]: 'F',
  [CstType.PREDICATE]: 'P',
  [CstType.STATEMENT]: 'T'
};

/** Record of {@link CstType} to {@link CstClass} mapping. */
const CST_TYPE_TO_CLASS: Record<CstType, CstClass> = {
  [CstType.NOMINAL]: CstClass.NOMINAL,
  [CstType.BASE]: CstClass.BASIC,
  [CstType.CONSTANT]: CstClass.BASIC,
  [CstType.STRUCTURED]: CstClass.BASIC,
  [CstType.TERM]: CstClass.DERIVED,
  [CstType.FUNCTION]: CstClass.DERIVED,
  [CstType.AXIOM]: CstClass.STATEMENT,
  [CstType.PREDICATE]: CstClass.DERIVED,
  [CstType.STATEMENT]: CstClass.STATEMENT
};

/** Checks if {@link Constituenta} is a schema issue. */
export function isSchemaIssue(cst: Constituenta): boolean {
  if (
    cst.homonyms.length > 0 ||
    cst.formalDuplicates.length > 0 ||
    cst.status === CstStatus.INCORRECT ||
    cst.status === CstStatus.INCALCULABLE ||
    cst.is_type_mismatch
  ) {
    return true;
  }
  if (isBasicConcept(cst.cst_type) && !isLogical(cst.cst_type)) {
    if (!cst.convention || !cst.term_resolved) {
      return true;
    }
  }
  return false;
}

/** Infers the status of an expression based on parsing and value information. */
export function inferStatus(parse: boolean, value?: ValueClass | null): CstStatus {
  if (!parse) {
    return CstStatus.INCORRECT;
  }
  if (value === null) {
    return CstStatus.INCALCULABLE;
  }
  if (value === ValueClass.PROPERTY) {
    return CstStatus.PROPERTY;
  }
  return CstStatus.VERIFIED;
}

/** Infers type of constituent for a given template and arguments. */
export function inferTemplatedType(templateType: CstType, args: ArgumentValue[]): CstType {
  if (args.length === 0 || args.some(arg => !arg.value)) {
    return templateType;
  } else if (templateType === CstType.PREDICATE) {
    return CstType.AXIOM;
  } else {
    return CstType.TERM;
  }
}

/** Checks if given expression is a template. */
export function inferTemplate(expression: string): boolean {
  const match = expression.match(/R\d+/g);
  return (match && match?.length > 0) ?? false;
}

/** Infers the {@link CstClass} based on the provided {@link CstType} and template status. */
export function inferClass(type: CstType, isTemplate: boolean = false): CstClass {
  if (isTemplate) {
    return CstClass.TEMPLATE;
  }
  return CST_TYPE_TO_CLASS[type];
}

/** Check if {@link Constituenta} is a template or a category. */
export function isTemplateCst(cst: Constituenta): boolean {
  return cst.cst_type === CstType.FUNCTION || cst.cst_type === CstType.PREDICATE || cst.cst_type === CstType.STATEMENT;
}

/** Apply filter based on start {@link Constituenta} type. */
export function applyFilterCategory(start: Constituenta, items: Constituenta[]): Constituenta[] {
  const startIndex = items.indexOf(start);
  if (startIndex === -1) {
    return [];
  }
  const nextCategoryIndex = items.findIndex((cst, index) => index > startIndex && cst.cst_type === CstType.STATEMENT);

  return items.filter((_, index) => index >= startIndex && (nextCategoryIndex === -1 || index < nextCategoryIndex));
}

/** Prefix for alias indicating {@link CstType}. */
export function getCstTypePrefix(type: CstType): string {
  return CST_TYPE_PREFIX[type];
}

/** Guess {@link CstType} from user input hint. */
export function guessCstType(hint: string): CstType | null {
  if (hint.length !== 1) {
    return null;
  }
  for (const [type, prefix] of Object.entries(CST_TYPE_PREFIX)) {
    if (hint === prefix) {
      return type as CstType;
    }
  }
  return null;
}

/** Evaluate if {@link CstType} is basic concept. */
export function isBasicConcept(type: CstType): boolean {
  switch (type) {
    case CstType.NOMINAL:
    case CstType.BASE:
    case CstType.CONSTANT:
    case CstType.STRUCTURED:
    case CstType.AXIOM:
      return true;

    case CstType.TERM:
    case CstType.FUNCTION:
    case CstType.PREDICATE:
    case CstType.STATEMENT:
      return false;
  }
}

/** Evaluate if {@link CstType} is base set or constant set. */
export function isBaseSet(type: CstType): boolean {
  switch (type) {
    case CstType.BASE:
    case CstType.CONSTANT:
      return true;

    case CstType.NOMINAL:
    case CstType.STRUCTURED:
    case CstType.AXIOM:
    case CstType.TERM:
    case CstType.FUNCTION:
    case CstType.PREDICATE:
    case CstType.STATEMENT:
      return false;
  }
}

/** Evaluate if {@link CstType} is a function. */
export function isFunctional(type: CstType): boolean {
  switch (type) {
    case CstType.FUNCTION:
    case CstType.PREDICATE:
      return true;

    case CstType.NOMINAL:
    case CstType.BASE:
    case CstType.CONSTANT:
    case CstType.STRUCTURED:
    case CstType.AXIOM:
    case CstType.TERM:
    case CstType.STATEMENT:
      return false;
  }
}

/** Evaluate if {@link CstType} is logical. */
export function isLogical(type: CstType): boolean {
  switch (type) {
    case CstType.AXIOM:
    case CstType.STATEMENT:
      return true;

    case CstType.NOMINAL:
    case CstType.BASE:
    case CstType.CONSTANT:
    case CstType.STRUCTURED:
    case CstType.TERM:
    case CstType.FUNCTION:
    case CstType.PREDICATE:
      return false;
  }
}

/** Evaluate if {@link Constituenta} can be used produce structure. */
export function canProduceStructure(cst: Constituenta): boolean {
  switch (cst.cst_type) {
    case CstType.NOMINAL:
    case CstType.BASE:
    case CstType.CONSTANT:
    case CstType.AXIOM:
    case CstType.STATEMENT:
    case CstType.PREDICATE:
      return false;
  }
  if (!cst.effectiveType) {
    return false;
  }
  if (cst.cst_type === CstType.FUNCTION) {
    const result = (cst.effectiveType as EchelonFunctional).result;
    return typeCanProduceStructure(result);
  }
  if (!isTypification(cst.effectiveType)) {
    return false;
  }
  return typeCanProduceStructure(cst.effectiveType as Typification);
}

/** Evaluate if {@link CstType} can have manual typification. */
export function canHaveManualTypification(type: CstType): boolean {
  switch (type) {
    case CstType.STRUCTURED:
    case CstType.TERM:
    case CstType.FUNCTION:
    case CstType.PREDICATE:
      return true;

    case CstType.NOMINAL:
    case CstType.BASE:
    case CstType.CONSTANT:
    case CstType.AXIOM:
    case CstType.STATEMENT:
      return false;
  }
}

/** Validate alias format for a given {@link CstType} (prefix + digits, min length 2). */
export function validateAliasFormat(alias: string, type: CstType): boolean {
  if (alias.length < 2) {
    return false;
  }
  const prefix = getCstTypePrefix(type);
  if (!alias.startsWith(prefix)) {
    return false;
  }
  if (!/^\d+$/.exec(alias.substring(prefix.length))) {
    return false;
  }
  return true;
}

/** Validate new alias against {@link CstType} and {@link RSForm}. */
export function validateNewAlias(alias: string, type: CstType, schema: RSForm): boolean {
  if (!validateAliasFormat(alias, type)) {
    return false;
  }
  if (schema.cstByAlias.has(alias)) {
    return false;
  }
  return true;
}

/** Generate alias for new {@link Constituenta} of a given {@link CstType} for current {@link RSForm}. */
export function generateAlias(type: CstType, schema: RSForm, takenAliases: string[] = []): string {
  const prefix = getCstTypePrefix(type);
  if (schema.items.length <= 0) {
    return `${prefix}1`;
  }
  let index = schema.items.reduce((prev, cst, index) => {
    if (cst.cst_type !== type) {
      return prev;
    }
    index = Number(cst.alias.slice(1 - cst.alias.length)) + 1;
    return Math.max(prev, index);
  }, 1);
  let alias = `${prefix}${index}`;
  while (takenAliases.includes(alias)) {
    index = index + 1;
    alias = `${prefix}${index}`;
  }
  return alias;
}

/**
 * Id to pass as `insert_after` when creating a new {@link Constituenta} spawned by `targetId`:
 * after the last existing child of that spawner, or after the spawner itself if none.
 */
export function inferNewSpawnPosition(schema: RSForm, targetId: number): number {
  let last: number | null = null;
  for (const cst of schema.items) {
    if (cst.spawner === targetId) {
      last = cst.id;
    }
  }
  return last ?? targetId;
}

/** Sorts library items relevant for InlineSynthesis with specified {@link RSForm}. */
export function sortItemsForInlineSynthesis(receiver: RSForm, items: readonly LibraryItem[]): LibraryItem[] {
  const result = items.filter(item => item.location === receiver.location);
  for (const item of items) {
    if (item.visible && item.owner === item.owner && !result.includes(item)) {
      result.push(item);
    }
  }
  for (const item of items) {
    if (item.visible && !result.includes(item)) {
      result.push(item);
    }
  }
  for (const item of items) {
    if (!result.includes(item)) {
      result.push(item);
    }
  }
  return result;
}

/** Remove alias from expression. */
export function removeAliasReference(expression: string, alias: string): string {
  const result = expression.replaceAll(new RegExp(`\\b${alias}\\b`, 'g'), 'DEL');
  return result === 'DEL' ? '' : result;
}

/** Add alias to expression. */
export function addAliasReference(expression: string, alias: string): string {
  return expression + ' ' + alias;
}

/** Returns expected {@link TypeClass} of formal definition for {@link CstType}. */
export function typeClassForCstType(cstType: CstType): TypeClass {
  switch (cstType) {
    case CstType.NOMINAL:
    case CstType.BASE:
    case CstType.CONSTANT:
    case CstType.STRUCTURED:
    case CstType.TERM:
      return TypeClass.typification;
    case CstType.FUNCTION:
      return TypeClass.function;
    case CstType.PREDICATE:
      return TypeClass.predicate;
    case CstType.AXIOM:
    case CstType.STATEMENT:
      return TypeClass.logic;
  }
}

/** Checks whether a constituenta type supports formal definitions. */
export function canHaveFormalDefinition(cstType: CstType): boolean {
  return cstType !== CstType.BASE && cstType !== CstType.CONSTANT;
}

/** Analyze expression for {@link RSForm}. */
export function getAnalysisFor(expression: string, cstType: CstType, schema: RSForm, alias?: string): AnalysisFull {
  if (!canHaveFormalDefinition(cstType)) {
    if (expression.trim().length === 0) {
      const fallbackAlias = alias && alias.length > 0 ? alias : 'X0';
      const type = cstType === CstType.BASE ? bool(basic(fallbackAlias)) : bool(constant(fallbackAlias));
      return {
        success: true,
        type,
        valueClass: ValueClass.VALUE,
        errors: [],
        ast: null
      };
    }
    return {
      success: false,
      type: null,
      valueClass: null,
      errors: [
        {
          code: RSErrorCode.definitionNotAllowed,
          from: 0,
          to: Math.max(0, expression.length - 1)
        }
      ],
      ast: null
    };
  }
  return schema.analyzer.checkFull(expression, {
    expected: typeClassForCstType(cstType),
    isDomain: cstType === CstType.STRUCTURED
  });
}

/** Calculate statistics for {@link RSForm}. */
export function calculateSchemaStats(target: RSForm): RSFormStats {
  const items = target.items;
  return {
    count_all: items.length,
    count_crucial: items.reduce((sum, cst) => sum + (cst.crucial ? 1 : 0), 0),

    step_complexity: items.reduce((sum, cst) => sum + calculateStepComplexity(cst), 0),

    count_problematic: items.reduce((sum, cst) => sum + (isSchemaIssue(cst) ? 1 : 0), 0),
    count_homonyms: items.reduce((sum, cst) => sum + (cst.homonyms.length > 0 ? 1 : 0), 0),
    count_formal_duplicates: items.reduce((sum, cst) => sum + (cst.formalDuplicates.length > 0 ? 1 : 0), 0),
    count_missing_convention: items.reduce((sum, cst) => sum + (isMissingConvention(cst) ? 1 : 0), 0),
    count_type_mismatch: items.reduce((sum, cst) => sum + (cst.is_type_mismatch ? 1 : 0), 0),

    count_incorrect: items.reduce((sum, cst) => sum + (cst.status === CstStatus.INCORRECT ? 1 : 0), 0),
    count_property: items.reduce((sum, cst) => sum + (cst.analysis?.valueClass === ValueClass.PROPERTY ? 1 : 0), 0),
    count_incalculable: items.reduce(
      (sum, cst) => sum + (cst.analysis?.success && cst.analysis.valueClass === null ? 1 : 0),
      0
    ),
    count_inherited: items.reduce((sum, cst) => sum + (cst.is_inherited ? 1 : 0), 0),

    count_text_term: items.reduce((sum, cst) => sum + (cst.term_raw ? 1 : 0), 0),
    count_definition: items.reduce((sum, cst) => sum + (cst.definition_raw ? 1 : 0), 0),
    count_convention: items.reduce((sum, cst) => sum + (isBasicConcept(cst.cst_type) && cst.convention ? 1 : 0), 0),
    count_comment: items.reduce((sum, cst) => sum + (!isBasicConcept(cst.cst_type) && !cst.convention ? 1 : 0), 0),

    count_base: items.reduce((sum, cst) => sum + (cst.cst_type === CstType.BASE ? 1 : 0), 0),
    count_constant: items.reduce((sum, cst) => sum + (cst.cst_type === CstType.CONSTANT ? 1 : 0), 0),
    count_structured: items.reduce((sum, cst) => sum + (cst.cst_type === CstType.STRUCTURED ? 1 : 0), 0),
    count_axiom: items.reduce((sum, cst) => sum + (cst.cst_type === CstType.AXIOM ? 1 : 0), 0),
    count_term: items.reduce((sum, cst) => sum + (cst.cst_type === CstType.TERM ? 1 : 0), 0),
    count_function: items.reduce((sum, cst) => sum + (cst.cst_type === CstType.FUNCTION ? 1 : 0), 0),
    count_predicate: items.reduce((sum, cst) => sum + (cst.cst_type === CstType.PREDICATE ? 1 : 0), 0),
    count_statement: items.reduce((sum, cst) => sum + (cst.cst_type === CstType.STATEMENT ? 1 : 0), 0),
    count_nominal: items.reduce((sum, cst) => sum + (cst.cst_type === CstType.NOMINAL ? 1 : 0), 0)
  };
}

/** Finds {@link Constituenta} by structure path. */
export function findCstByStructure(schema: RSForm, target: Constituenta, path: TypePath): Constituenta | null {
  for (const cst of schema.items) {
    if (cst.spawner === target.id && cst.spawner_path) {
      if (cst.spawner_path.length === path.length && cst.spawner_path.every((v, i) => v === path[i])) {
        return cst;
      }
    }
  }
  return null;
}

/** Retrieves name for piece of target {@link Constituenta} structure. */
export function getStructureName(schema: RSForm, target: Constituenta, path: TypePath): string {
  const representation = findCstByStructure(schema, target, path);
  if (representation) {
    return `${representation.alias}: ${representation.term_resolved}`;
  }
  if (!isTypification(target.effectiveType)) {
    return '';
  }
  const type = applyPath(target.effectiveType as Typification, path);
  if (type?.typeID === TypeID.basic) {
    const cst = schema.cstByAlias.get(type.baseID);
    if (cst?.term_resolved) {
      return `${cst.alias}: ${cst.term_resolved}`;
    }
  }
  return '';
}

// ========= Internals =====
function calculateStepComplexity(cst: Constituenta): number {
  if (cst.cst_type === CstType.AXIOM || cst.cst_type === CstType.NOMINAL || !isBasicConcept(cst.cst_type)) {
    return 0;
  }
  if (cst.cst_type === CstType.BASE || cst.cst_type === CstType.CONSTANT || !cst.effectiveType) {
    return 1;
  }

  const type = cst.effectiveType as Typification;
  return calculateTypificationComplexity(type) + 1;
}

function calculateTypificationComplexity(type: Typification): number {
  switch (type.typeID) {
    case TypeID.basic:
    case TypeID.integer:
    case TypeID.anyTypification:
      return 0;
    case TypeID.tuple:
      return (
        type.factors.length + type.factors.reduce((sum, factor) => sum + calculateTypificationComplexity(factor), 0)
      );
    case TypeID.collection:
      if (type.base.typeID === TypeID.tuple) {
        let sum = 0;
        type.base.factors.forEach(factor => {
          sum += calculateTypificationComplexity(factor);
        });
        return sum + type.base.factors.length;
      } else if (type.base.typeID === TypeID.collection) {
        return calculateTypificationComplexity(type.base) + 1;
      }
      return 0;
  }
}

function isMissingConvention(cst: Constituenta): boolean {
  if (isBasicConcept(cst.cst_type) && !isLogical(cst.cst_type)) {
    if (!cst.convention || !cst.term_resolved) {
      return true;
    }
  }
  return false;
}

/** Evaluate if {@link Typification} can be used to produce structure. */
function typeCanProduceStructure(type: Typification): boolean {
  if (type.typeID === TypeID.basic || type.typeID === TypeID.integer || type.typeID === TypeID.anyTypification) {
    return false;
  } else if (type.typeID === TypeID.tuple) {
    return true;
  } else {
    return (
      type.base.typeID !== TypeID.basic &&
      type.base.typeID !== TypeID.integer &&
      type.base.typeID !== TypeID.anyTypification
    );
  }
}
