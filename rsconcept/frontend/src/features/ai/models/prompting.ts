/** Represents prompt variable type. */
export const PromptVariableType = {
  BLOCK: 'block',
  BLOCK_TITLE: 'block.title',
  BLOCK_DESCRIPTION: 'block.description',
  BLOCK_CONTENTS: 'block.contents',

  OSS: 'oss',
  OSS_CONTENTS: 'oss.contents',
  OSS_ALIAS: 'oss.alias',
  OSS_TITLE: 'oss.title',
  OSS_DESCRIPTION: 'oss.description',

  SCHEMA: 'schema',
  SCHEMA_ALIAS: 'schema.alias',
  SCHEMA_TITLE: 'schema.title',
  SCHEMA_DESCRIPTION: 'schema.description',
  SCHEMA_THESAURUS: 'schema.thesaurus',
  SCHEMA_GRAPH: 'schema.graph',
  SCHEMA_TYPE_GRAPH: 'schema.type-graph',

  CONSTITUENTA: 'constituent',
  CONSTITUENTA_ALIAS: 'constituent.alias',
  CONSTITUENTA_CONVENTION: 'constituent.convention',
  CONSTITUENTA_DEFINITION: 'constituent.definition',
  CONSTITUENTA_DEFINITION_FORMAL: 'constituent.definition-formal',
  CONSTITUENTA_EXPRESSION_TREE: 'constituent.expression-tree'
} as const;
export type PromptVariableType = (typeof PromptVariableType)[keyof typeof PromptVariableType];
