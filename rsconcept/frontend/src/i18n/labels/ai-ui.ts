/**
 * AI prompt variable tooltips and mock samples.
 * Keys align with {@link PromptVariableType} in `features/ai/models/prompting`.
 */
export const aiLid = {
  variable: {
    block: 'labels.ai.variable.block',
    oss: 'labels.ai.variable.oss',
    schema: 'labels.ai.variable.schema',
    schemaThesaurus: 'labels.ai.variable.schemaThesaurus',
    schemaGraph: 'labels.ai.variable.schemaGraph',
    schemaTypeGraph: 'labels.ai.variable.schemaTypeGraph',
    constituenta: 'labels.ai.variable.constituenta',
    constituentaSyntaxTree: 'labels.ai.variable.constituentaSyntaxTree'
  },
  variableMock: {
    block: 'labels.ai.variableMock.block',
    oss: 'labels.ai.variableMock.oss',
    schema: 'labels.ai.variableMock.schema',
    schemaThesaurus: 'labels.ai.variableMock.schemaThesaurus',
    schemaGraph: 'labels.ai.variableMock.schemaGraph',
    schemaTypeGraph: 'labels.ai.variableMock.schemaTypeGraph',
    constituenta: 'labels.ai.variableMock.constituenta',
    constituentaSyntaxTree: 'labels.ai.variableMock.constituentaSyntaxTree'
  },
  fallback: {
    unknownVariableType: 'labels.ai.fallback.unknownVariableType',
    unknownVariable: 'labels.ai.fallback.unknownVariable'
  }
} as const;

export const AI_UI_DEFAULTS: Record<string, string> = {
  [aiLid.variable.block]: 'Current operational-schema block',
  [aiLid.variable.oss]: 'Current operational schema',
  [aiLid.variable.schema]: 'Current conceptual schema',
  [aiLid.variable.schemaThesaurus]: 'Terms and definitions of the current conceptual schema',
  [aiLid.variable.schemaGraph]: 'Constituenta definition link graph',
  [aiLid.variable.schemaTypeGraph]: 'Conceptual schema type-tier graph',
  [aiLid.variable.constituenta]: 'Current constituenta',
  [aiLid.variable.constituentaSyntaxTree]: 'Constituenta syntax tree',

  [aiLid.variableMock.block]: 'Example: current operational-schema block',
  [aiLid.variableMock.oss]: 'Example: current operational schema',
  [aiLid.variableMock.schema]: 'Example: current conceptual schema',
  [aiLid.variableMock.schemaThesaurus]: 'Example\nTerm1 — Definition1\nTerm2 — Definition2',
  [aiLid.variableMock.schemaGraph]: 'Example: constituenta definition link graph',
  [aiLid.variableMock.schemaTypeGraph]: 'Example: conceptual schema type-tier graph',
  [aiLid.variableMock.constituenta]: 'Example: current constituenta',
  [aiLid.variableMock.constituentaSyntaxTree]: 'Example constituenta syntax tree',

  [aiLid.fallback.unknownVariableType]: 'UNKNOWN VARIABLE TYPE: {type}',
  [aiLid.fallback.unknownVariable]: 'UNKNOWN VARIABLE: {name}'
};
