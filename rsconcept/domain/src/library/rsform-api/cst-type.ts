/**
 * CstType classification, prefixes, and capability predicates.
 */

import { TypeClass, TypeID, type Typification } from '../../rslang';
import { type EchelonFunctional, isTypification } from '../../rslang/semantic/typification';
import { type Constituenta, CstClass, CstType } from '../rsform';

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

/** Checks whether a constituenta type supports formal definitions. */
export function canHaveFormalDefinition(cstType: CstType): boolean {
  return cstType !== CstType.BASE && cstType !== CstType.CONSTANT;
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
