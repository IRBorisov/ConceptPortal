/**
 * RS model evaluation status and value display strings.
 */
export const rsmodelLid = {
  eval: {
    noEval: 'labels.rsmodel.eval.noEval',
    notProcessed: 'labels.rsmodel.eval.notProcessed',
    invalidData: 'labels.rsmodel.eval.invalidData',
    evalFail: 'labels.rsmodel.eval.evalFail',
    axiomFalse: 'labels.rsmodel.eval.axiomFalse',
    empty: 'labels.rsmodel.eval.empty',
    hasData: 'labels.rsmodel.eval.hasData'
  },
  evalDesc: {
    noEval: 'labels.rsmodel.evalDesc.noEval',
    notProcessed: 'labels.rsmodel.evalDesc.notProcessed',
    invalidData: 'labels.rsmodel.evalDesc.invalidData',
    evalFail: 'labels.rsmodel.evalDesc.evalFail',
    axiomFalse: 'labels.rsmodel.evalDesc.axiomFalse',
    empty: 'labels.rsmodel.evalDesc.empty',
    hasData: 'labels.rsmodel.evalDesc.hasData'
  },
  value: {
    na: 'labels.rsmodel.value.na',
    logicTrue: 'labels.rsmodel.value.logicTrue',
    logicFalse: 'labels.rsmodel.value.logicFalse',
    singleton: 'labels.rsmodel.value.singleton',
    tupleMarker: 'labels.rsmodel.value.tupleMarker'
  },
  valueDesc: {
    cardinalityPrefix: 'labels.rsmodel.valueDesc.cardinalityPrefix'
  },
  fallback: {
    unknownEvalStatus: 'labels.rsmodel.fallback.unknownEvalStatus'
  }
} as const;

export const RSMODEL_UI_DEFAULTS: Record<string, string> = {
  [rsmodelLid.eval.noEval]: 'No evaluation',
  [rsmodelLid.eval.notProcessed]: 'Not evaluated',
  [rsmodelLid.eval.invalidData]: 'Invalid data',
  [rsmodelLid.eval.evalFail]: 'Error',
  [rsmodelLid.eval.axiomFalse]: 'Axiom violated',
  [rsmodelLid.eval.empty]: 'Empty value',
  [rsmodelLid.eval.hasData]: 'OK',

  [rsmodelLid.evalDesc.noEval]: 'evaluation not required',
  [rsmodelLid.evalDesc.notProcessed]: 'evaluation was not run',
  [rsmodelLid.evalDesc.invalidData]: 'data does not match the type',
  [rsmodelLid.evalDesc.evalFail]: 'evaluation error',
  [rsmodelLid.evalDesc.axiomFalse]: 'axiom value is false',
  [rsmodelLid.evalDesc.empty]: 'value is the empty set',
  [rsmodelLid.evalDesc.hasData]: 'value computed and non-empty',

  [rsmodelLid.value.na]: 'N/A',
  [rsmodelLid.value.logicTrue]: 'True',
  [rsmodelLid.value.logicFalse]: 'False',
  [rsmodelLid.value.singleton]: '1',
  [rsmodelLid.value.tupleMarker]: 'C',

  [rsmodelLid.valueDesc.cardinalityPrefix]: 'Cardinality: {n} | {stub}',

  [rsmodelLid.fallback.unknownEvalStatus]: 'UNKNOWN EVALUATION STATUS: {status}'
};
