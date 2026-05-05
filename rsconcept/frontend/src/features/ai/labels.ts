import { globalTx } from '@/i18n';

import { PromptVariableType } from './models/prompting';

const DESCRIBE_VAR_LID: Record<PromptVariableType, string> = {
  [PromptVariableType.BLOCK]: 'labels.ai.variable.block',
  [PromptVariableType.OSS]: 'labels.ai.variable.oss',
  [PromptVariableType.SCHEMA]: 'labels.ai.variable.schema',
  [PromptVariableType.SCHEMA_THESAURUS]: 'labels.ai.variable.schemaThesaurus',
  [PromptVariableType.SCHEMA_GRAPH]: 'labels.ai.variable.schemaGraph',
  [PromptVariableType.SCHEMA_TYPE_GRAPH]: 'labels.ai.variable.schemaTypeGraph',
  [PromptVariableType.CONSTITUENTA]: 'labels.ai.variable.constituenta',
  [PromptVariableType.CONSTITUENTA_SYNTAX_TREE]: 'labels.ai.variable.constituentaSyntaxTree'
};

const MOCK_VAR_LID: Record<PromptVariableType, string> = {
  [PromptVariableType.BLOCK]: 'labels.ai.variableMock.block',
  [PromptVariableType.OSS]: 'labels.ai.variableMock.oss',
  [PromptVariableType.SCHEMA]: 'labels.ai.variableMock.schema',
  [PromptVariableType.SCHEMA_THESAURUS]: 'labels.ai.variableMock.schemaThesaurus',
  [PromptVariableType.SCHEMA_GRAPH]: 'labels.ai.variableMock.schemaGraph',
  [PromptVariableType.SCHEMA_TYPE_GRAPH]: 'labels.ai.variableMock.schemaTypeGraph',
  [PromptVariableType.CONSTITUENTA]: 'labels.ai.variableMock.constituenta',
  [PromptVariableType.CONSTITUENTA_SYNTAX_TREE]: 'labels.ai.variableMock.constituentaSyntaxTree'
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
