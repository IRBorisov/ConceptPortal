
import { CstType, type RSForm } from '@/features/rsform';
import { calculateSchemaStats, getAnalysisFor, isBasicConcept } from '@/features/rsform/models/rsform-api';
import { type CalculatorResult, type Value } from '@/features/rslang';
import { VALUE_TRUE } from '@/features/rslang/eval/value';

import { EvalStatus, type RSModel, type RSModelStats } from './rsmodel';

/** Calculate statistics for {@link RSModel}. */
export function calculateModelStats(schema: RSForm, evalStatus: (cstID: number) => EvalStatus): RSModelStats {
  const items = schema.items;
  return {
    ...calculateSchemaStats(schema),
    count_missing_base: items.reduce(
      (sum, cst) => sum +
        (evalStatus(cst.id) === EvalStatus.EMPTY && isBasicConcept(cst.cst_type) ? 1 : 0),
      0),
    count_false_axioms: items.reduce(
      (sum, cst) => sum +
        (evalStatus(cst.id) === EvalStatus.AXIOM_FALSE ? 1 : 0),
      0),
    count_invalid_calculations: items.reduce(
      (sum, cst) => sum +
        (evalStatus(cst.id) === EvalStatus.EVAL_FAIL || evalStatus(cst.id) === EvalStatus.NOT_PROCESSED ? 1 : 0),
      0),
    count_empty_terms: items.reduce(
      (sum, cst) => sum +
        (evalStatus(cst.id) === EvalStatus.EMPTY && cst.cst_type === CstType.TERM ? 1 : 0),
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
export function inferStatus(value: Value | null, cstType: CstType, wasCalculated: boolean = true): EvalStatus {
  if (isBasicConcept(cstType)) {
    if (value === null || Array.isArray(value) && value.length === 0) {
      return EvalStatus.EMPTY;
    }
    if (cstType === CstType.AXIOM && value !== VALUE_TRUE) {
      return EvalStatus.AXIOM_FALSE;
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
  if (Array.isArray(value) && value.length === 0) {
    return EvalStatus.EMPTY;
  }
  return EvalStatus.HAS_DATA;
}

/** Evaluates expression for {@link RSModel}, including error handling. */
export function getEvaluationFor(
  expression: string, cstType: CstType, schema: RSForm, model: RSModel
): CalculatorResult {
  const parse = getAnalysisFor(expression, cstType, schema);
  if (!parse.success || !parse.ast) {
    return {
      value: null,
      iterations: 0,
      errors: parse.errors
    };
  } else {
    return model.calculator.evaluateFull(parse.ast);
  }
}

/** Evaluates expression for {@link RSModel}. */
export function fastEvaluation(
  expression: string, cstType: CstType, schema: RSForm, model: RSModel
): Value | null {
  const parse = getAnalysisFor(expression, cstType, schema);
  if (!parse.success || !parse.ast) {
    return null;
  } else {
    return model.calculator.evaluateFast(parse.ast);
  }
}

/** Recalculate model for all inferrable expressions. */
export function recalculateModel(schema: RSForm, model: RSModel): number[] {
  const processedIDs = [];
  for (const cst of schema.cstByID.values()) {
    if (isInferrable(cst.cst_type)) {
      model.calculator.resetValue(cst.alias);
    }
  }

  for (const cstID of schema.graph.topologicalOrder()) {
    processedIDs.push(cstID);
    const cst = schema.cstByID.get(cstID)!;
    if (isInferrable(cst.cst_type)) {
      const value = fastEvaluation(cst.definition_formal, cst.cst_type, schema, model);
      if (value !== null) {
        model.calculator.setValue(cst.alias, value);
      }
    }
  }
  return processedIDs;
}

export function prepareEvaluation(target: number, schema: RSForm, model: RSModel): number[] {
  const calculatedCst: number[] = [];
  const predecessors = schema.graph.expandAllInputs([target]);
  for (const cstID of schema.graph.topologicalOrder()) {
    if (predecessors.includes(cstID)) {
      const cst = schema.cstByID.get(cstID)!;
      if (isInferrable(cst.cst_type)) {
        calculatedCst.push(cstID);
        const value = fastEvaluation(cst.definition_formal, cst.cst_type, schema, model);
        if (value !== null) {
          model.calculator.setValue(cst.alias, value);
        }
      }
    }
    calculatedCst.push(cstID);
  }
  return predecessors;
}
