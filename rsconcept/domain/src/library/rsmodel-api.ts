import { type ExpressionType, TypeID, type Typification, type Value } from '../rslang';
import { compare, tuple, TUPLE_ID, VALUE_TRUE, type ValuePath } from '../rslang/eval/value';
import { extractValue, isTupleValue, makeDefaultValue, setNestedValue } from '../rslang/eval/value-api';
import { type EchelonCollection } from '../rslang/semantic/typification';

import { modelStatusCstDiagnostic } from './diagnostics';
import { type RSEngine } from './rsengine';
import { type Constituenta, CstType, type RSForm } from './rsform';
import { calculateSchemaStats, isBaseSet, isBasicConcept } from './rsform-api';
import { type BasicBinding, EvalStatus, type RSModelStats } from './rsmodel';

const RANDOM_INTEGER_MIN = -100;
const RANDOM_INTEGER_MAX = 100;
const DEFAULT_RANDOM_SET_ELEMENTS_COUNT = 5;

/** Evaluate if parsed data is a basic binding data. */
export function validateBasicBindingData(data: unknown): data is Record<string, string> {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return false;
  }
  return Object.entries(data).every(([key, value]) => typeof value === 'string' && Number.isInteger(Number(key)));
}

/** Convert parsed data to a basic binding. */
export function toBasicBinding(data: Record<string | number, string>): BasicBinding {
  const result: BasicBinding = {};
  for (const [k, v] of Object.entries(data)) {
    result[Number(k)] = v;
  }
  return result;
}

/** Evaluate if parsed data is a {@link Value} data. */
export function validateValueData(data: unknown): data is Value {
  if (typeof data === 'number') {
    return Number.isFinite(data);
  }
  if (!Array.isArray(data)) {
    return false;
  }
  return data.every(item => validateValueData(item));
}

export function generateRandomValue(
  type: Typification,
  basics: Map<number, BasicBinding>,
  cstByAlias: Map<string, Constituenta>,
  setElementsCount: number = DEFAULT_RANDOM_SET_ELEMENTS_COUNT
): Value | null {
  switch (type.typeID) {
    case TypeID.integer:
      return Math.floor(Math.random() * (RANDOM_INTEGER_MAX - RANDOM_INTEGER_MIN + 1)) + RANDOM_INTEGER_MIN;
    case TypeID.basic: {
      const cst = cstByAlias.get(type.baseID);
      const binding = cst ? basics.get(cst.id) : undefined;
      const ids = Object.keys(binding ?? {}).map(Number);
      if (ids.length === 0) {
        return null;
      }
      return ids[Math.floor(Math.random() * ids.length)];
    }
    case TypeID.tuple: {
      const factors: Value[] = [];
      for (const factor of type.factors) {
        const sample = generateRandomValue(factor, basics, cstByAlias, setElementsCount);
        if (sample === null) {
          return null;
        }
        factors.push(sample);
      }
      return tuple(factors);
    }
    case TypeID.collection: {
      const result: Value[] = [];
      const randomElementsCount = Math.floor(Math.random() * (setElementsCount + 1));
      for (let i = 0; i < randomElementsCount; i++) {
        const sample = generateRandomValue(type.base, basics, cstByAlias, setElementsCount);
        if (sample === null) {
          return null;
        }
        result.push(sample);
      }
      return result;
    }
    case TypeID.anyTypification:
      return null;
  }
}

/** Calculate statistics for {@link RSModel}. */
export function calculateModelStats(schema: RSForm, engine: RSEngine, _engineGeneration?: number): RSModelStats {
  const items = schema.items;
  const statusByID = new Map<number, EvalStatus>();
  for (const cst of items) {
    statusByID.set(cst.id, engine.getCstStatus(cst.id));
  }
  return {
    ...calculateSchemaStats(schema),
    base_elements: items.reduce((sum, cst) => sum + countBaseElements(cst, engine), 0),
    count_missing_base: items.reduce(
      (sum, cst) => sum + (statusByID.get(cst.id) === EvalStatus.EMPTY && isBasicConcept(cst.cst_type) ? 1 : 0),
      0
    ),
    count_false_axioms: items.reduce(
      (sum, cst) => sum + (statusByID.get(cst.id) === EvalStatus.AXIOM_FALSE ? 1 : 0),
      0
    ),
    count_invalid_data: items.reduce(
      (sum, cst) => sum + (statusByID.get(cst.id) === EvalStatus.INVALID_DATA ? 1 : 0),
      0
    ),
    count_invalid_calculations: items.reduce(
      (sum, cst) =>
        sum +
        (statusByID.get(cst.id) === EvalStatus.EVAL_FAIL || statusByID.get(cst.id) === EvalStatus.NOT_PROCESSED
          ? 1
          : 0),
      0
    ),
    count_empty_terms: items.reduce(
      (sum, cst) => sum + (statusByID.get(cst.id) === EvalStatus.EMPTY && cst.cst_type === CstType.TERM ? 1 : 0),
      0
    )
  };
}

/** Checks whether evaluation status contributes to model status issues. */
export function isModelIssue(engine: RSEngine, cst: Constituenta): boolean {
  return modelStatusCstDiagnostic(engine.getCstStatus(cst.id), cst.cst_type) !== null;
}

/** Evaluate if {@link CstType} is interpretable. */
export function isInterpretable(type: CstType): boolean {
  switch (type) {
    case CstType.BASE:
    case CstType.CONSTANT:
    case CstType.STRUCTURED:
    case CstType.AXIOM:
    case CstType.TERM:
    case CstType.STATEMENT:
      return true;

    case CstType.NOMINAL:
    case CstType.FUNCTION:
    case CstType.PREDICATE:
      return false;
  }
}

/** Evaluate if {@link CstType} is inferrable. */
export function isInferrable(type: CstType): boolean {
  switch (type) {
    case CstType.AXIOM:
    case CstType.STATEMENT:
    case CstType.TERM:
      return true;

    case CstType.NOMINAL:
    case CstType.BASE:
    case CstType.CONSTANT:
    case CstType.STRUCTURED:
    case CstType.FUNCTION:
    case CstType.PREDICATE:
      return false;
  }
}

/** Infers status of a given {@link Value} and {@link CstType}. */
export function inferEvalStatus(
  value: Value | null,
  cstType: CstType,
  wasCalculated: boolean = true,
  isInvalid: boolean = false
): EvalStatus {
  if (isBaseSet(cstType) || cstType === CstType.STRUCTURED) {
    if (isInvalid) {
      return EvalStatus.INVALID_DATA;
    }
    if (value === null || (Array.isArray(value) && value.length === 0)) {
      return EvalStatus.EMPTY;
    }
    return EvalStatus.HAS_DATA;
  }
  if (!isInferrable(cstType)) {
    return EvalStatus.NO_EVAL;
  }
  if (!wasCalculated) {
    return EvalStatus.NOT_PROCESSED;
  }
  if (value === null) {
    return EvalStatus.EVAL_FAIL;
  }
  if (cstType === CstType.AXIOM && value !== VALUE_TRUE) {
    return EvalStatus.AXIOM_FALSE;
  }
  if (Array.isArray(value) && value.length === 0) {
    return EvalStatus.EMPTY;
  }
  return EvalStatus.HAS_DATA;
}

/** Tries to fix value removing invalid base elements not present in the target value.
 * returns null if no fixing is possible.
 * returns true if fixing was successful.
 * returns false if fixing was not needed.
 */
export function tryFixValue(
  value: Value,
  type: ExpressionType,
  targetAlias: string,
  targetValue: Value[]
): boolean | null {
  switch (type.typeID) {
    case TypeID.integer:
      return false;
    case TypeID.basic:
      if (type.baseID !== targetAlias) {
        return false;
      }
      if (typeof value !== 'number') {
        return null;
      }
      if (!targetValue.includes(value)) {
        return null;
      }
      return false;
    case TypeID.tuple: {
      if (!isTupleValue(value)) {
        return null;
      }
      let wasChanged = false;
      for (let i = 0; i < type.factors.length; i++) {
        const componentChanged = tryFixValue(value[i + 1], type.factors[i], targetAlias, targetValue);
        if (componentChanged === null) {
          return null;
        }
        if (componentChanged) {
          wasChanged = true;
        }
      }
      return wasChanged;
    }
    case TypeID.collection:
      if (!Array.isArray(value) || (value.length > 1 && value[0] === TUPLE_ID)) {
        return null;
      }
      let wasChanged = false;
      const removeElements: Value[] = [];
      for (const item of value) {
        const elementChanged = tryFixValue(item, type.base, targetAlias, targetValue);
        if (elementChanged === null || elementChanged === true) {
          wasChanged = true;
          if (elementChanged === null) {
            removeElements.push(item);
          }
        }
      }
      for (const item of removeElements) {
        const index = value.indexOf(item);
        if (index !== -1) {
          value.splice(index, 1);
        }
      }
      if (wasChanged) {
        value.sort((a, b) => compare(a, b));
        let i = 1;
        while (i < value.length) {
          if (compare(value[i], value[i - 1]) === 0) {
            value.splice(i, 1);
          } else {
            i++;
          }
        }
      }
      return wasChanged;

    case TypeID.logic:
    case TypeID.anyTypification:
    case TypeID.predicate:
    case TypeID.function:
      return null;
  }
}

export function updateValueElement(value: Value | null, path: ValuePath, newValue: number): Value | null {
  return setNestedValue(value, path, newValue);
}

export function deleteValueElement(
  value: Value | null,
  path: ValuePath,
  type: Typification,
  target: number
): Value | null {
  if (value === null) {
    return null;
  }
  if (path.length === 0 && type.typeID !== TypeID.collection) {
    return null;
  }

  const arrayValue = extractValue(value, path);
  if (!Array.isArray(arrayValue)) {
    return null;
  }
  const updatedArray = [...arrayValue.slice(0, target), ...arrayValue.slice(target + 1)];
  return setNestedValue(value, path, updatedArray);
}

export function addValueElement(
  value: Value | null,
  path: ValuePath,
  type: Typification,
  currentType: Typification
): Value | null {
  if (path.length === 0 && type.typeID !== TypeID.collection) {
    return makeDefaultValue(type);
  }

  const newElem = makeDefaultValue((currentType as EchelonCollection).base);
  const arrayValue = (extractValue(value!, path) as Value[] | null) ?? [];
  const updatedArray = [newElem, ...arrayValue];
  return setNestedValue(value, path, updatedArray);
}

// ========= Internal functions ==========

function countBaseElements(cst: Constituenta, engine: RSEngine): number {
  if (!isBasicConcept(cst.cst_type)) {
    return 0;
  }
  const value = engine.getCstValue(cst.id);
  if (value === null) {
    return 0;
  }
  if (!Array.isArray(value) || value[0] === TUPLE_ID) {
    return 1;
  }
  return value.length;
}
