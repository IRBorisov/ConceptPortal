
import { toast } from 'react-toastify';

import { CstType, type RSForm } from '@/features/rsform';
import { calculateSchemaStats, getAnalysisFor, isBaseSet, isBasicConcept } from '@/features/rsform/models/rsform-api';
import { type CalculatorResult, type ExpressionType, type RSCalculator, TypeID, type Value } from '@/features/rslang';
import { TUPLE_ID, VALUE_TRUE } from '@/features/rslang/eval/value';
import { printValue } from '@/features/rslang/eval/value-api';

import { limits } from '@/utils/constants';
import { type RO } from '@/utils/meta';
import { concat, type Doc, group, indent, join, line, render, text } from '@/utils/text-printer';

import { type RSEngine } from './rsengine';
import { type BasicBinding, type BasicsContext, EvalStatus, type RSModelStats } from './rsmodel';

/** Calculate statistics for {@link RSModel}. */
export function calculateModelStats(schema: RSForm, engine: RSEngine): RSModelStats {
  const items = schema.items;
  const statusByID = new Map<number, EvalStatus>();
  for (const cst of items) {
    statusByID.set(cst.id, engine.getCstStatus(cst.id));
  }
  return {
    ...calculateSchemaStats(schema),
    count_missing_base: items.reduce(
      (sum, cst) => sum +
        (statusByID.get(cst.id) === EvalStatus.EMPTY && isBasicConcept(cst.cst_type) ? 1 : 0),
      0),
    count_false_axioms: items.reduce(
      (sum, cst) => sum +
        (statusByID.get(cst.id) === EvalStatus.AXIOM_FALSE ? 1 : 0),
      0),
    count_invalid_calculations: items.reduce(
      (sum, cst) => sum +
        (statusByID.get(cst.id) === EvalStatus.EVAL_FAIL || statusByID.get(cst.id) === EvalStatus.NOT_PROCESSED ? 1 : 0),
      0),
    count_empty_terms: items.reduce(
      (sum, cst) => sum +
        (statusByID.get(cst.id) === EvalStatus.EMPTY && cst.cst_type === CstType.TERM ? 1 : 0),
      0),
  };
}

/** Evaluate if {@link CstType} is interpretable. */
export function isInterpretable(type: CstType): boolean {
  switch (type) {
    case CstType.NOMINAL: return false;
    case CstType.BASE: return true;
    case CstType.CONSTANT: return true;
    case CstType.STRUCTURED: return true;
    case CstType.AXIOM: return true;
    case CstType.TERM: return true;
    case CstType.FUNCTION: return false;
    case CstType.PREDICATE: return false;
    case CstType.THEOREM: return true;
  }
}

/** Evaluate if {@link CstType} is inferrable. */
export function isInferrable(type: CstType): boolean {
  switch (type) {
    case CstType.NOMINAL: return false;
    case CstType.BASE: return false;
    case CstType.CONSTANT: return false;
    case CstType.STRUCTURED: return false;
    case CstType.AXIOM: return true;
    case CstType.TERM: return true;
    case CstType.FUNCTION: return false;
    case CstType.PREDICATE: return false;
    case CstType.THEOREM: return true;
  }
}

/** Infers status of a given {@link Value} and {@link CstType}. */
export function inferStatus(value: RO<Value | null>, cstType: CstType, wasCalculated: boolean = true): EvalStatus {
  if (isBaseSet(cstType) || cstType === CstType.STRUCTURED) {
    if (value === null || Array.isArray(value) && value.length === 0) {
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

/** Evaluates expression for {@link Constituenta}, including error handling. */
export function getEvaluationFor(
  expression: string, cstType: CstType, schema: RSForm, calculator: RSCalculator
): CalculatorResult {
  const parse = getAnalysisFor(expression, cstType, schema);
  if (!parse.success || !parse.ast) {
    return {
      value: null,
      iterations: 0,
      errors: parse.errors
    };
  } else {
    try {
      const result = calculator.evaluateFull(parse.ast);
      return {
        value: result.value,
        iterations: result.iterations,
        errors: [...parse.errors, ...result.errors]
      };
    } catch (error) {
      toast.error((error as Error).message);
      console.error(expression, error);
      return {
        value: null,
        iterations: 0,
        errors: []
      };
    }
  }
}

/** Evaluates expression for {@link RSModel}. */
export function fastEvaluation(
  expression: string, cstType: CstType, schema: RSForm, calculator: RSCalculator
): Value | null {
  const parse = getAnalysisFor(expression, cstType, schema);
  if (!parse.success || !parse.ast) {
    return null;
  } else {
    try {
      return calculator.evaluateFast(parse.ast);
    } catch (error) {
      toast.error((error as Error).message);
      console.error(expression, error);
      return null;
    }
  }
}

/** Prepares string representation for {@link Value}. */
export function prepareValueString(
  value: RO<Value | null | BasicBinding>,
  type: ExpressionType | null,
  schema: RSForm,
  dataContext: BasicsContext,
  dataText: boolean
): string {
  if (value === null) {
    return '';
  }
  if (!dataText || type === null || (value !== null && typeof value === 'object' && !Array.isArray(value))) {
    return JSON.stringify(value, null, 2).replace(
      /\[\s*((?:\[\]|-?\d+(?:\.\d+)?)(?:,\s*(?:\[\]|-?\d+(?:\.\d+)?))*)\s*\]/g,
      (_match: string, inner: string) => `[${inner.replace(/\s+/g, ' ')}]`
    );
  }
  return render(prepareValueInternal(value as Value, type, schema, dataContext), limits.data_line_width);
}

// ========= Internal functions ==========
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
        return text(`MISSING_ELEMENT ${value}`);
      }
    case TypeID.logic:
      if (Array.isArray(value)) {
        return text(`EXPECTED_LOGIC ${printValue(value)}`);
      }
      return value === VALUE_TRUE ? text('Истина') : text('Ложь');
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
  return group(
    concat(
      text("("),
      indent(concat(line, join(concat(text(","), line), elements))),
      line,
      text(")")
    )
  );
}

function collectionDoc(elements: Doc[]): Doc {
  if (elements.length === 0) {
    return text("{}");
  };
  return group(
    concat(
      text("{"),
      indent(concat(line, join(concat(text(","), line), elements))),
      line,
      text("}")
    )
  );
}