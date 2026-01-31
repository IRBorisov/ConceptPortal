/** 
 * Module: Typification API for RSLang.
 */
import {
  bool,
  type EchelonBase, type EchelonCollection,
  type EchelonTuple, type ExpressionType, IntegerT, isRadical, isTypification,
  tuple, TypeClass, TypeID, type Typification
} from './typification';

/** Record map from typeID to typeClass. */
const TypeIDToClass: Record<TypeID, TypeClass> = {
  [TypeID.anyTypification]: TypeClass.typification,
  [TypeID.integer]: TypeClass.typification,
  [TypeID.basic]: TypeClass.typification,
  [TypeID.tuple]: TypeClass.typification,
  [TypeID.collection]: TypeClass.typification,
  [TypeID.logic]: TypeClass.logic,
  [TypeID.function]: TypeClass.function,
  [TypeID.predicate]: TypeClass.predicate
};

/** Returns the TypeClass associated with the given TypeID. */
export function getTypeClass(typeID: TypeID): TypeClass {
  return TypeIDToClass[typeID];
}

/** Returns true if the given typification is generic. */
export function hasGenerics(type: Typification): boolean {
  switch (type.typeID) {
    case TypeID.anyTypification:
      return true;
    case TypeID.integer:
      return false;
    case TypeID.basic:
      return isRadical(type.baseID);
    case TypeID.collection:
      return hasGenerics(type.base);
    case TypeID.tuple:
      for (const factor of type.factors) {
        if (hasGenerics(factor)) {
          return true;
        }
      }
      return false;
  }
}

/** Checks if two typifications are equal. */
export function checkEquality(type1: Typification, type2: Typification): boolean {
  if (type1 === type2) {
    return true;
  }
  if (type1.typeID !== type2.typeID) {
    return false;
  }
  switch (type1.typeID) {
    case TypeID.integer:
    case TypeID.anyTypification:
      return true;
    case TypeID.basic:
      return type1.baseID === (type2 as EchelonBase).baseID;
    case TypeID.collection:
      return checkEquality(type1.base, (type2 as EchelonCollection).base);
    case TypeID.tuple: {
      if (type1.factors.length !== (type2 as EchelonTuple).factors.length) {
        return false;
      }
      for (let index = 0; index < type1.factors.length; ++index) {
        if (!checkEquality(type1.factors[index], (type2 as EchelonTuple).factors[index])) {
          return false;
        }
      }
      return true;
    }
  }
}

/** Merge two types to get result of binary operation. */
export function mergeTypifications(type1: Typification, type2: Typification): Typification | null {
  if (type1 === type2) {
    return type1;
  }
  if (type1.typeID === TypeID.anyTypification) {
    return isTypification(type2) ? type2 : null;
  }
  if (type2.typeID === TypeID.anyTypification) {
    return isTypification(type1) ? type1 : null;
  }

  switch (type1.typeID) {
    case TypeID.integer:
    case TypeID.basic:
      return commonType(type1, type2);
    case TypeID.collection:
      if (type2.typeID !== TypeID.collection) {
        return null;
      }
      const base = mergeTypifications(type1.base, type2.base);
      return base ? bool(base) : null;
    case TypeID.tuple:
      if (type2.typeID !== TypeID.tuple) {
        return null;
      }
      if (type1.factors.length !== type2.factors.length) {
        return null;
      }
      const components: Typification[] = [];
      for (let index = 0; index < type1.factors.length; ++index) {
        const component = mergeTypifications(type1.factors[index], (type2).factors[index]);
        if (component === null) {
          return null;
        }
        components.push(component);
      }
      return tuple(components);
  }
}

export function checkCompatibility(type1: ExpressionType, type2: ExpressionType): boolean {
  if (type1 === type2) {
    return true;
  }
  if (type1.typeID === TypeID.anyTypification) {
    return isTypification(type2);
  }
  if (type2.typeID === TypeID.anyTypification) {
    return isTypification(type1);
  }
  if (isTypification(type1) !== isTypification(type2)) {
    return false;
  }
  if (type1.typeID === TypeID.integer || type1.typeID === TypeID.basic ||
    type2.typeID === TypeID.integer || type2.typeID === TypeID.basic
  ) {
    return commonType(type1 as Typification, type2 as Typification) !== null;
  }

  if (type1.typeID !== type2.typeID) {
    return false;
  }
  switch (type1.typeID) {
    case TypeID.collection:
      return checkCompatibility(type1.base, (type2 as EchelonCollection).base);
    case TypeID.tuple:
      if (type1.factors.length !== (type2 as EchelonTuple).factors.length) {
        return false;
      }
      for (let index = 0; index < type1.factors.length; ++index) {
        if (!checkCompatibility(type1.factors[index], (type2 as EchelonTuple).factors[index])) {
          return false;
        }
      }
      return true;
    case TypeID.logic:
    case TypeID.predicate:
    case TypeID.function:
      return false;
  }
}

export function compareTemplated(
  substitutes: Map<string, Typification>,
  arg: Typification,
  value: Typification
): boolean {
  if (arg === value) {
    return true;
  }
  if (arg.typeID === TypeID.basic && isRadical(arg.baseID)) {
    if (!substitutes.has(arg.baseID)) {
      substitutes.set(arg.baseID, value);
      return true;
    } else {
      const mergeType = mergeTypifications(substitutes.get(arg.baseID)!, value);
      if (mergeType === null) {
        return false;
      }
      substitutes.set(arg.baseID, mergeType);
      return true;
    }
  }
  if (value.typeID === TypeID.anyTypification) {
    return true;
  }
  if (arg.typeID === TypeID.integer || arg.typeID === TypeID.basic ||
    value.typeID === TypeID.integer || value.typeID === TypeID.basic
  ) {
    return commonType(arg, value) !== null;
  }
  if (arg.typeID !== value.typeID) {
    return false;
  }
  switch (arg.typeID) {
    case TypeID.collection:
      return compareTemplated(substitutes, arg.base, (value as EchelonCollection).base);
    case TypeID.tuple: {
      if (arg.factors.length !== (value as EchelonTuple).factors.length) {
        return false;
      }
      for (let index = 0; index < arg.factors.length; ++index) {
        if (!compareTemplated(substitutes, arg.factors[index], (value as EchelonTuple).factors[index])) {
          return false;
        }
      }
      return true;
    }
  }
}

/** Apply substitutions to typification. */
export function substituteBase(target: Typification, substitutes: Map<string, Typification>): void {
  switch (target.typeID) {
    case TypeID.basic: {
      if (substitutes.has(target.baseID)) {
        Object.assign(target, substitutes.get(target.baseID)!);
      }
      return;
    }
    case TypeID.collection: {
      substituteBase(target.base, substitutes);
      return;
    }
    case TypeID.tuple: {
      for (const factor of target.factors) {
        substituteBase(factor, substitutes);
      }

      return;
    }
  }
}

// ===== Internals =====
function commonType(type1: Typification, type2: Typification): Typification | null {
  if (type1 === type2) {
    return type1;
  }
  const int1 = 'isIntegerCompatible' in type1 && type1.isIntegerCompatible;
  const int2 = 'isIntegerCompatible' in type2 && type2.isIntegerCompatible;
  if (!int1 || !int2) {
    if (type1.typeID === TypeID.basic && type2.typeID === TypeID.basic) {
      return type1.baseID === type2.baseID ? type1 : null;
    }
    return null;
  }
  if (type1.typeID === TypeID.integer) {
    return type2;
  } else if (type2.typeID === TypeID.integer) {
    return type1;
  } else {
    return IntegerT;
  }
}
