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
