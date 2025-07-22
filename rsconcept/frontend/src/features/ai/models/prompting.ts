/** Represents prompt variable type. */
export const PromptVariableType = {
  SCHEMA: 'schema',
  SCHEMA_THESAURUS: 'schema.thesaurus',
  // SCHEMA_GRAPH: 'schema.graph',
  // SCHEMA_TYPE_GRAPH: 'schema.type-graph',

  CONSTITUENTA: 'constituenta',
  CONSTITUENTA_SYNTAX_TREE: 'constituent.ast',

  OSS: 'oss',

  BLOCK: 'block'
} as const;
export type PromptVariableType = (typeof PromptVariableType)[keyof typeof PromptVariableType];
