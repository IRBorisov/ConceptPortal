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
