import { type RO } from '@/utils/meta';

import { type ExpressionType, TypeID } from '../rslang';
import { TUPLE_ID, type Value, VALUE_FALSE, VALUE_TRUE } from '../rslang/eval/value';

import { EvalStatus } from './models/rsmodel';

const labelEvalStatusRecord: Record<EvalStatus, string> = {
  [EvalStatus.NO_EVAL]: 'Без вычисления',
  [EvalStatus.NOT_PROCESSED]: 'Не вычислено',
  [EvalStatus.EVAL_FAIL]: 'Ошибка',
  [EvalStatus.AXIOM_FALSE]: 'Нарушена аксиома',
  [EvalStatus.EMPTY]: 'Пустое значение',
  [EvalStatus.HAS_DATA]: 'Вычислено'
};

/** Retrieves label for {@link EvalStatus}. */
export function labelEvalStatus(status: EvalStatus): string {
  return labelEvalStatusRecord[status] ?? `UNKNOWN EVALUATION STATUS: ${status}`;
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