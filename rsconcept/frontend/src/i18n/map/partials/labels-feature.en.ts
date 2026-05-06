/** English overrides for feature UI bundles (library, OSS, RS model, users, AI, cctext, RSLang). */
export const labelsFeatureEn: Record<string, string> = {
  'labels.rsform.cstClassLabel.nominal': 'nominal',
  'labels.rsform.cstClassLabel.basic': 'basic',
  'labels.rsform.cstClassLabel.derived': 'derived',
  'labels.rsform.cstClassLabel.statement': 'statement',
  'labels.rsform.cstClassLabel.template': 'template',

  'labels.rsform.cstClassDesc.nominal': 'nominal entity',
  'labels.rsform.cstClassDesc.basic': 'undefined notion',
  'labels.rsform.cstClassDesc.derived': 'defined notion',
  'labels.rsform.cstClassDesc.statement': 'logical statement',
  'labels.rsform.cstClassDesc.template': 'definition template',

  'labels.rsform.graphMode.explore': 'Mode: Browse',
  'labels.rsform.graphMode.edit': 'Mode: Editor',

  'labels.rsform.coloring.none': 'Color: Mono',
  'labels.rsform.coloring.status': 'Color: Status',
  'labels.rsform.coloring.type': 'Color: Class',
  'labels.rsform.coloring.schemas': 'Color: Schemas',

  'labels.rsform.edgeType.full': 'Links: All',
  'labels.rsform.edgeType.definition': 'Links: Definition',
  'labels.rsform.edgeType.attribution': 'Links: Attribution',

  'labels.rsform.exprStatus.verified': 'valid',
  'labels.rsform.exprStatus.incorrect': 'error',
  'labels.rsform.exprStatus.incalculable': 'not computable',
  'labels.rsform.exprStatus.property': 'non-measurable',
  'labels.rsform.exprStatus.unknown': 'not checked',

  'labels.rsform.exprStatusDesc.verified': 'valid and computable',
  'labels.rsform.exprStatusDesc.incorrect': 'error detected',
  'labels.rsform.exprStatusDesc.incalculable': 'interpretation does not evaluate',
  'labels.rsform.exprStatusDesc.property': 'membership check only',
  'labels.rsform.exprStatusDesc.unknown': 'verification required',

  'labels.rsform.rsExpression.nominal': 'Defining constituents',
  'labels.rsform.rsExpression.structure': 'Domain of definition',
  'labels.rsform.rsExpression.function': 'Function definition',

  'labels.oss.substitution.invalidIDs': 'Schema identifier error',
  'labels.oss.substitution.incorrectCst': 'Error {from} → {to}: invalid constituenta expression',
  'labels.oss.substitution.invalidBasic': 'Error {from} → {to}: replacing a generic notion with a base set',
  'labels.oss.substitution.invalidConstant':
    'Error {from} → {to}: a constant set may only substitute another constant set',
  'labels.oss.substitution.invalidNominal': 'Error {from} → {to}: a nominal may only substitute another nominal',
  'labels.oss.substitution.invalidClasses': 'Error {from} → {to}: constituenta classes do not match',
  'labels.oss.substitution.typificationCycle': 'Error: substitution cycle in typifications {detail}',
  'labels.oss.substitution.baseSubstitutionNotSet': 'Error: typification does not specify set {from} ∈ {to}',
  'labels.oss.substitution.unequalTypification': 'Error {from} → {to}: structural operand typifications differ',
  'labels.oss.substitution.unequalArgsCount': 'Error {from} → {to}: argument counts differ',
  'labels.oss.substitution.unequalArgs': 'Error {from} → {to}: argument typifications differ',
  'labels.oss.substitution.unequalExpressions': 'Warning {from} → {to}: notion definitions differ',

  'labels.rsmodel.valueDesc.cardinalityPrefix': 'Cardinality: {n} | {stub}',

  'labels.ai.variable.block': 'Current operational-schema block',
  'labels.ai.variable.oss': 'Current operational schema',
  'labels.ai.variable.schema': 'Current conceptual schema',
  'labels.ai.variable.schemaThesaurus': 'Terms and definitions of the current conceptual schema',
  'labels.ai.variable.schemaGraph': 'Constituenta definition link graph',
  'labels.ai.variable.schemaTypeGraph': 'Conceptual schema type-tier graph',
  'labels.ai.variable.constituenta': 'Current constituenta',
  'labels.ai.variable.constituentaSyntaxTree': 'Constituenta syntax tree',

  'labels.ai.variableMock.block': 'Example: current operational-schema block',
  'labels.ai.variableMock.oss': 'Example: current operational schema',
  'labels.ai.variableMock.schema': 'Example: current conceptual schema',
  'labels.ai.variableMock.schemaThesaurus': 'Example\nTerm1 — Definition1\nTerm2 — Definition2',
  'labels.ai.variableMock.schemaGraph': 'Example: constituenta definition link graph',
  'labels.ai.variableMock.schemaTypeGraph': 'Example: conceptual schema type-tier graph',
  'labels.ai.variableMock.constituenta': 'Example: current constituenta',
  'labels.ai.variableMock.constituentaSyntaxTree': 'Example constituenta syntax tree'
};
