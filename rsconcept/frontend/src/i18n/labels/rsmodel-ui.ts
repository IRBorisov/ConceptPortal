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
