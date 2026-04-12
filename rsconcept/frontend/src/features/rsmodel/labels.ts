import { type RO } from '@/utils/meta';

import { type ExpressionType, TypeID, type TypePath, type Typification } from '../../domain/rslang';
import { TUPLE_ID, type Value, VALUE_FALSE, VALUE_TRUE } from '../../domain/rslang/eval/value';
import { valueStub } from '../../domain/rslang/eval/value-api';
import { labelType } from '../../domain/rslang/labels';

import { EvalStatus } from './models/rsmodel';

const labelEvalStatusRecord: Record<EvalStatus, string> = {
  [EvalStatus.NO_EVAL]: 'Без вычисления',
  [EvalStatus.NOT_PROCESSED]: 'Не вычислено',
  [EvalStatus.INVALID_DATA]: 'Неверные данные',
  [EvalStatus.EVAL_FAIL]: 'Ошибка',
  [EvalStatus.AXIOM_FALSE]: 'Нарушена аксиома',
  [EvalStatus.EMPTY]: 'Пустое значение',
  [EvalStatus.HAS_DATA]: 'ОК'
};

const describeEvalStatusRecord: Record<EvalStatus, string> = {
  [EvalStatus.NO_EVAL]: 'вычисление не требуется',
  [EvalStatus.NOT_PROCESSED]: 'вычисление не проводилось',
  [EvalStatus.INVALID_DATA]: 'данные не соответствуют типу',
  [EvalStatus.EVAL_FAIL]: 'ошибка при вычислении',
  [EvalStatus.AXIOM_FALSE]: 'значение аксиомы ложно',
  [EvalStatus.EMPTY]: 'значение равно пустому множеству',
  [EvalStatus.HAS_DATA]: 'значение вычислено и не пусто'
};

/** Retrieves label for {@link EvalStatus}. */
export function labelEvalStatus(status: EvalStatus): string {
  return labelEvalStatusRecord[status] ?? `UNKNOWN EVALUATION STATUS: ${status}`;
}

/** Retrieves description for {@link EvalStatus}. */
export function describeEvalStatus(status: EvalStatus): string {
  return describeEvalStatusRecord[status] ?? `UNKNOWN EVALUATION STATUS: ${status}`;
}

/** Generates label for {@link Value}. */
export function labelValue(value: RO<Value | null>, type: ExpressionType | null): string {
  if (value === null || type === null) {
    return 'N/A';
  }
  if (type.typeID === TypeID.logic) {
    if (value === VALUE_TRUE) {
      return 'Истина';
    } else if (value === VALUE_FALSE) {
      return 'Ложь';
    }
  }
  if (!Array.isArray(value)) {
    return '1';
  } else if (value.length === 0) {
    return '∅';
  } else if (value[0] === TUPLE_ID) {
    return 'C';
  } else {
    return value.length.toString();
  }
}

/** Generates small description for {@link Value}. */
export function describeValue(data: Value | null, currentType: Typification): string {
  const stub = valueStub(data);
  if (currentType.typeID !== TypeID.collection) {
    return stub;
  }
  return `${stub} | ${(data as Value[]).length}`;
}

/** Prints type with selected path. */
export function printTypeCrumbs(type: RO<Typification>, path: TypePath, index: number = 0): string {
  switch (type.typeID) {
    case TypeID.anyTypification:
    case TypeID.integer:
    case TypeID.basic:
      return labelType(type);

    case TypeID.tuple:
      const componentIndex = index < path.length ? path[index] : null;
      let result = '';
      for (let i = 0; i < type.factors.length; i++) {
        if (i > 0) {
          result += '×';
        }
        if (type.factors[i].typeID === TypeID.tuple) {
          result += '(';
        }
        if (i + 1 !== componentIndex) {
          result += labelType(type.factors[i]);
        } else {
          if (index + 1 === path.length) {
            result += '->' + labelType(type.factors[i]) + '<-';
          } else {
            result += printTypeCrumbs(type.factors[i], path, index + 1);
          }
        }
        if (type.factors[i].typeID === TypeID.tuple) {
          result += ')';
        }
      }
      return result;

    case TypeID.collection:
      if ((path.length === 0 && index === 0) || path.length === index) {
        return `->${labelType(type)}<-`;
      } else {
        const baseStr = printTypeCrumbs(type.base, path, index + 1);
        return type.base.typeID === TypeID.collection ? `ℬ${baseStr}` : `ℬ(${baseStr})`;
      }
  }
}
