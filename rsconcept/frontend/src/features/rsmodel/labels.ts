import { EvalStatus } from '@/domain/library';
import { type ExpressionType, TypeID, type TypePath, type Typification } from '@/domain/rslang';
import { TUPLE_ID, type Value, VALUE_FALSE, VALUE_TRUE } from '@/domain/rslang/eval/value';
import { valueStub } from '@/domain/rslang/eval/value-api';
import { labelType } from '@/domain/rslang/labels';
import { globalTx } from '@/i18n';

import { type RO } from '@/utils/meta';

const EVAL_LABEL_LID: Record<EvalStatus, string> = {
  [EvalStatus.NO_EVAL]: 'tx.lib.evalStatus.noEval',
  [EvalStatus.NOT_PROCESSED]: 'tx.lib.evalStatus.notProcessed',
  [EvalStatus.INVALID_DATA]: 'tx.lib.evalStatus.invalidData',
  [EvalStatus.EVAL_FAIL]: 'tx.lib.evalStatus.error',
  [EvalStatus.AXIOM_FALSE]: 'tx.lib.evalStatus.axiomFalse',
  [EvalStatus.EMPTY]: 'tx.lib.evalStatus.empty',
  [EvalStatus.HAS_DATA]: 'tx.lib.evalStatus.hasData'
};

const EVAL_DESC_LID: Record<EvalStatus, string> = {
  [EvalStatus.NO_EVAL]: 'tx.lib.evalStatus.noEval.hint',
  [EvalStatus.NOT_PROCESSED]: 'tx.lib.evalStatus.notProcessed.hint',
  [EvalStatus.INVALID_DATA]: 'tx.lib.evalStatus.invalidData.hint',
  [EvalStatus.EVAL_FAIL]: 'tx.lib.evalStatus.error.hint',
  [EvalStatus.AXIOM_FALSE]: 'tx.lib.evalStatus.axiomFalse.hint',
  [EvalStatus.EMPTY]: 'tx.lib.evalStatus.empty.hint',
  [EvalStatus.HAS_DATA]: 'tx.lib.evalStatus.hasData.hint'
};

/** Retrieves label for {@link EvalStatus}. */
export function labelEvalStatus(status: EvalStatus): string {
  const id = EVAL_LABEL_LID[status];
  return id ? globalTx(id) : 'UNKNOWN STATUS: ' + String(status);
}

/** Retrieves description for {@link EvalStatus}. */
export function describeEvalStatus(status: EvalStatus): string {
  const id = EVAL_DESC_LID[status];
  return id ? globalTx(id) : 'UNKNOWN STATUS: ' + String(status);
}

/** Generates label for {@link Value}. */
export function labelValue(value: RO<Value | null>, type: ExpressionType | null): string {
  if (value === null || type === null) {
    return 'N/A';
  }
  if (type.typeID === TypeID.logic) {
    if (value === VALUE_TRUE) {
      return globalTx('tx.general.boolean.true');
    } else if (value === VALUE_FALSE) {
      return globalTx('tx.general.boolean.false');
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
  return globalTx('labels.rsmodel.valueDesc.cardinalityPrefix', {
    n: String((data as Value[]).length),
    stub
  });
}

/** Prints type with selected path. */
export function printTypeCrumbs(type: RO<Typification>, path: TypePath, index: number = 0): string {
  switch (type.typeID) {
    case TypeID.anyTypification:
    case TypeID.integer:
    case TypeID.basic:
      return labelType(type);

    case TypeID.tuple: {
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
    }

    case TypeID.collection:
      if ((path.length === 0 && index === 0) || path.length === index) {
        return `->${labelType(type)}<-`;
      } else {
        const baseStr = printTypeCrumbs(type.base, path, index + 1);
        return type.base.typeID === TypeID.collection ? `ℬ${baseStr}` : `ℬ(${baseStr})`;
      }
  }
}
