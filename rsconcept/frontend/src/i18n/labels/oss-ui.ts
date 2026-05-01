/**
 * OSS operation types, substitution errors, item labels.
 */
export const ossLid = {
  operation: {
    input: 'labels.oss.operation.input',
    synthesis: 'labels.oss.operation.synthesis',
    replica: 'labels.oss.operation.replica'
  },
  operationDesc: {
    input: 'labels.oss.operationDesc.input',
    synthesis: 'labels.oss.operationDesc.synthesis',
    replica: 'labels.oss.operationDesc.replica'
  },
  item: {
    blockTitle: 'labels.oss.item.blockTitle'
  },
  substitution: {
    invalidIDs: 'labels.oss.substitution.invalidIDs',
    incorrectCst: 'labels.oss.substitution.incorrectCst',
    invalidBasic: 'labels.oss.substitution.invalidBasic',
    invalidConstant: 'labels.oss.substitution.invalidConstant',
    invalidNominal: 'labels.oss.substitution.invalidNominal',
    invalidClasses: 'labels.oss.substitution.invalidClasses',
    typificationCycle: 'labels.oss.substitution.typificationCycle',
    baseSubstitutionNotSet: 'labels.oss.substitution.baseSubstitutionNotSet',
    unequalTypification: 'labels.oss.substitution.unequalTypification',
    unequalArgsCount: 'labels.oss.substitution.unequalArgsCount',
    unequalArgs: 'labels.oss.substitution.unequalArgs',
    unequalExpressions: 'labels.oss.substitution.unequalExpressions'
  },
  fallback: {
    unknownOperationType: 'labels.oss.fallback.unknownOperationType',
    unknownSubstitutionError: 'labels.oss.fallback.unknownSubstitutionError'
  }
} as const;

export const OSS_UI_DEFAULTS: Record<string, string> = {
  [ossLid.operation.input]: 'Load',
  [ossLid.operation.synthesis]: 'Synthesis',
  [ossLid.operation.replica]: 'Replication',

  [ossLid.operationDesc.input]: 'Load a conceptual schema into the OSS',
  [ossLid.operationDesc.synthesis]: 'Synthesis of conceptual schemas',
  [ossLid.operationDesc.replica]: 'Create a link to the operation result',

  [ossLid.item.blockTitle]: 'Block: {title}',

  [ossLid.substitution.invalidIDs]: 'Schema identifier error',
  [ossLid.substitution.incorrectCst]:
    'Error {from} → {to}: invalid constituenta expression',
  [ossLid.substitution.invalidBasic]:
    'Error {from} → {to}: replacing a generic notion with a base set',
  [ossLid.substitution.invalidConstant]:
    'Error {from} → {to}: a constant set may only substitute another constant set',
  [ossLid.substitution.invalidNominal]:
    'Error {from} → {to}: a nominal may only substitute another nominal',
  [ossLid.substitution.invalidClasses]: 'Error {from} → {to}: constituenta classes do not match',
  [ossLid.substitution.typificationCycle]: 'Error: substitution cycle in typifications {detail}',
  [ossLid.substitution.baseSubstitutionNotSet]:
    'Error: typification does not specify set {from} ∈ {to}',
  [ossLid.substitution.unequalTypification]:
    'Error {from} → {to}: structural operand typifications differ',
  [ossLid.substitution.unequalArgsCount]: 'Error {from} → {to}: argument counts differ',
  [ossLid.substitution.unequalArgs]: 'Error {from} → {to}: argument typifications differ',
  [ossLid.substitution.unequalExpressions]:
    'Warning {from} → {to}: notion definitions differ',

  [ossLid.fallback.unknownOperationType]: 'UNKNOWN OPERATION TYPE: {type}',
  [ossLid.fallback.unknownSubstitutionError]: 'UNKNOWN ERROR'
};
