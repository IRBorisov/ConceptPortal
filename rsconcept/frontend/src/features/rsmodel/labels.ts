import { globalTx } from '@/i18n';
import { type BasicBinding, type BasicsContext, EvalStatus, type RSForm } from '@rsconcept/domain/library';
import { type ExpressionType, printValue, TypeID, type TypePath, type Typification } from '@rsconcept/domain/rslang';
import { TUPLE_ID, type Value, VALUE_FALSE, VALUE_TRUE } from '@rsconcept/domain/rslang/eval/value';
import { valueStub } from '@rsconcept/domain/rslang/eval/value-api';
import { labelType } from '@rsconcept/domain/rslang/labels';

import { limits } from '@/utils/constants';
import { concat, type Doc, group, indent, join, line, render, text } from '@/utils/text-printer';

const EVAL_LABEL_LID: Record<EvalStatus, string> = {
  [EvalStatus.NO_EVAL]: 'tx.evaluation.status.noEval',
  [EvalStatus.NOT_PROCESSED]: 'tx.evaluation.status.notProcessed',
  [EvalStatus.INVALID_DATA]: 'tx.evaluation.status.invalidData',
  [EvalStatus.EVAL_FAIL]: 'tx.evaluation.status.error',
  [EvalStatus.AXIOM_FALSE]: 'tx.evaluation.status.axiomFalse',
  [EvalStatus.EMPTY]: 'tx.evaluation.status.empty',
  [EvalStatus.HAS_DATA]: 'tx.evaluation.status.hasData'
};

const EVAL_DESC_LID: Record<EvalStatus, string> = {
  [EvalStatus.NO_EVAL]: 'tx.evaluation.status.noEval.hint',
  [EvalStatus.NOT_PROCESSED]: 'tx.evaluation.status.notProcessed.hint',
  [EvalStatus.INVALID_DATA]: 'tx.evaluation.status.invalidData.hint',
  [EvalStatus.EVAL_FAIL]: 'tx.evaluation.status.error.hint',
  [EvalStatus.AXIOM_FALSE]: 'tx.evaluation.status.axiomFalse.hint',
  [EvalStatus.EMPTY]: 'tx.evaluation.status.empty.hint',
  [EvalStatus.HAS_DATA]: 'tx.evaluation.status.hasData.hint'
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
export function labelValue(value: Value | null, type: ExpressionType | null): string {
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
    return 'E';
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
  return globalTx('tx.rslang.value.stub.status', {
    n: String((data as Value[]).length),
    stub
  });
}

/** Prints type with selected path. */
export function printTypeCrumbs(type: Typification, path: TypePath, index: number = 0): string {
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

/**
 * Prepares string representation for {@link Value}.
 *
 * @returns `null` when the value structure exceeds size limits (caller should show a short UI hint instead
 *   of calling {@link JSON.stringify} / pretty-print, which can overflow the stack).
 */
export function prepareValueString(
  value: Value | null | BasicBinding,
  type: ExpressionType | null,
  schema: RSForm,
  dataContext: BasicsContext,
  dataText: boolean
): string | null {
  if (value === null) {
    return '';
  }
  if (valuePrepareExceedsLimits(value, type, dataText)) {
    return null;
  }
  if (!dataText || type === null || (value !== null && typeof value === 'object' && !Array.isArray(value))) {
    return JSON.stringify(value, null, 2).replace(
      /\[\s*((?:\[\]|-?\d+(?:\.\d+)?)(?:,\s*(?:\[\]|-?\d+(?:\.\d+)?))*)\s*\]/g,
      (_match: string, inner: string) => `[${inner.replace(/\s+/g, ' ')}]`
    );
  }
  return render(prepareValueInternal(value, type, schema, dataContext), limits.data_line_width);
}

// ======= Internal functions =======
/** Iterative walk: same branching as {@link prepareValueInternal} without building docs (avoids stack overflow). */
function valuePrepareExceedsLimits(
  value: Value | null | BasicBinding,
  type: ExpressionType | null,
  dataText: boolean
): boolean {
  if (!dataText || type === null || (value !== null && typeof value === 'object' && !Array.isArray(value))) {
    return jsonTreeExceedsPrepareLimits(value);
  }
  return typedValuePrepareExceedsLimits(value!, type);
}

function jsonTreeExceedsPrepareLimits(root: unknown): boolean {
  const maxDepth = limits.value_render_max_depth;
  const maxNodes = limits.value_render_max_nodes;
  if (root === null || typeof root !== 'object') {
    return false;
  }
  const stack: { v: unknown; depth: number }[] = [{ v: root, depth: 0 }];
  let nodes = 0;
  while (stack.length > 0) {
    const { v, depth } = stack.pop()!;
    if (++nodes > maxNodes || depth > maxDepth) {
      return true;
    }
    if (Array.isArray(v)) {
      for (let i = v.length - 1; i >= 0; i--) {
        const el = v[i] as unknown;
        if (el !== null && typeof el === 'object') {
          stack.push({ v: el, depth: depth + 1 });
        } else if (depth + 1 > maxDepth || ++nodes > maxNodes) {
          return true;
        }
      }
    } else {
      for (const key of Object.keys(v as object)) {
        const el = (v as Record<string, unknown>)[key];
        if (el !== null && typeof el === 'object') {
          stack.push({ v: el, depth: depth + 1 });
        } else if (depth + 1 > maxDepth || ++nodes > maxNodes) {
          return true;
        }
      }
    }
  }
  return false;
}

function typedValuePrepareExceedsLimits(root: Value, rootType: ExpressionType): boolean {
  const maxDepth = limits.value_render_max_depth;
  const maxNodes = limits.value_render_max_nodes;
  const stack: { value: Value; type: ExpressionType; depth: number }[] = [{ value: root, type: rootType, depth: 0 }];
  let nodes = 0;
  while (stack.length > 0) {
    const frame = stack.pop()!;
    if (++nodes > maxNodes || frame.depth > maxDepth) {
      return true;
    }
    const { value, type, depth } = frame;
    switch (type.typeID) {
      case TypeID.integer:
      case TypeID.basic:
      case TypeID.logic:
        break;
      case TypeID.tuple: {
        if (!Array.isArray(value) || value.length !== type.factors.length + 1 || value[0] !== TUPLE_ID) {
          break;
        }
        const nextDepth = depth + 1;
        for (let i = type.factors.length - 1; i >= 0; i--) {
          stack.push({ value: value[i + 1], type: type.factors[i], depth: nextDepth });
        }
        break;
      }
      case TypeID.collection: {
        if (!Array.isArray(value) || (value.length > 1 && value[0] === TUPLE_ID)) {
          break;
        }
        const nextDepth = depth + 1;
        for (let i = value.length - 1; i >= 0; i--) {
          stack.push({ value: value[i], type: type.base, depth: nextDepth });
        }
        break;
      }
      case TypeID.anyTypification:
      case TypeID.predicate:
      case TypeID.function:
        break;
      default:
        break;
    }
  }
  return false;
}

function prepareValueInternal(value: Value, type: ExpressionType, schema: RSForm, dataContext: BasicsContext): Doc {
  switch (type.typeID) {
    case TypeID.integer:
      return text(String(value));
    case TypeID.basic:
      const cst = schema.cstByAlias.get(type.baseID);
      if (!cst) {
        return text(`UNKNOWN_ALIAS ${type.baseID}`);
      }
      if (typeof value !== 'number') {
        return text(`EXPECTED_BASIC ${printValue(value)}`);
      }
      const binding = dataContext.get(cst.id);
      if (!binding) {
        return text(`NO BINDING FOR ${cst.alias}`);
      }
      if (value in binding) {
        const basicValue = binding[value];
        return text(basicValue);
      } else {
        return text(`NO_ELEM ${value}`);
      }
    case TypeID.logic:
      if (Array.isArray(value)) {
        return text(`EXPECTED_LOGIC ${printValue(value)}`);
      }
      return value === VALUE_TRUE ? text('True') : text('False');
    case TypeID.tuple:
      if (!Array.isArray(value) || value.length !== type.factors.length + 1 || value[0] !== TUPLE_ID) {
        return text(`EXPECTED_TUPLE ${printValue(value)}`);
      }
      const components: Doc[] = [];
      for (let i = 0; i < type.factors.length; i++) {
        components.push(prepareValueInternal(value[i + 1], type.factors[i], schema, dataContext));
      }
      return tupleDoc(components);
    case TypeID.collection:
      if (!Array.isArray(value) || (value.length > 1 && value[0] === TUPLE_ID)) {
        return text(`EXPECTED_COLLECTION ${printValue(value)}`);
      }
      const elements: Doc[] = [];
      for (const item of value) {
        elements.push(prepareValueInternal(item, type.base, schema, dataContext));
      }
      return collectionDoc(elements);

    case TypeID.anyTypification:
    case TypeID.predicate:
    case TypeID.function:
      return text('UNEXPECTED_TYPE');
  }
}

function tupleDoc(elements: Doc[]): Doc {
  return group(concat(text('('), indent(concat(line, join(concat(text(','), line), elements))), line, text(')')));
}

function collectionDoc(elements: Doc[]): Doc {
  if (elements.length === 0) {
    return text('{}');
  }
  return group(concat(text('{'), indent(concat(line, join(concat(text(','), line), elements))), line, text('}')));
}
