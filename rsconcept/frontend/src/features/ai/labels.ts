import { globalTx } from '@/i18n';

import { PromptVariableType } from './models/prompting';

const DESCRIBE_VAR_LID: Record<PromptVariableType, string> = {
  [PromptVariableType.BLOCK]: 'tx.ai.variable.block',
  [PromptVariableType.OSS]: 'tx.ai.variable.oss',
  [PromptVariableType.SCHEMA]: 'tx.ai.variable.schema',
  [PromptVariableType.SCHEMA_THESAURUS]: 'tx.ai.variable.schema.thesaurus',
  [PromptVariableType.SCHEMA_GRAPH]: 'tx.ai.variable.schema.graph',
  [PromptVariableType.SCHEMA_TYPE_GRAPH]: 'tx.ai.variable.schema.typeGraph',
  [PromptVariableType.CONSTITUENTA]: 'tx.ai.variable.constituenta',
  [PromptVariableType.CONSTITUENTA_SYNTAX_TREE]: 'tx.ai.variable.constituenta.ast'
};

const MOCK_VAR_LID: Record<PromptVariableType, string> = {
  [PromptVariableType.BLOCK]: 'tx.ai.variable.block.mock',
  [PromptVariableType.OSS]: 'tx.ai.variable.oss.mock',
  [PromptVariableType.SCHEMA]: 'tx.ai.variable.schema.mock',
  [PromptVariableType.SCHEMA_THESAURUS]: 'tx.ai.variable.schema.thesaurus.mock',
  [PromptVariableType.SCHEMA_GRAPH]: 'tx.ai.variable.schema.graph.mock',
  [PromptVariableType.SCHEMA_TYPE_GRAPH]: 'tx.ai.variable.schema.typeGraph.mock',
  [PromptVariableType.CONSTITUENTA]: 'tx.ai.variable.constituenta.mock',
  [PromptVariableType.CONSTITUENTA_SYNTAX_TREE]: 'tx.ai.variable.constituenta.ast.mock'
};

/** Retrieves description for {@link PromptVariableType}. */
export function describePromptVariable(itemType: PromptVariableType): string {
  const id = DESCRIBE_VAR_LID[itemType];
  return id ? globalTx(id) : 'UNKNOWN VARIABLE TYPE: ' + String(itemType);
}

/** Retrieves mock text for {@link PromptVariableType}. */
export function mockPromptVariable(variable: string): string {
  if (!Object.values(PromptVariableType).includes(variable as PromptVariableType)) {
    return variable;
  }
  const id = MOCK_VAR_LID[variable as PromptVariableType];
  return id ? globalTx(id) : 'UNKNOWN VARIABLE: ' + variable;
}
