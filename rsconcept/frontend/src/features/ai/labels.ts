import { formatLabel } from '@/i18n';
import { aiLid } from '@/i18n/labels/ai-ui';

import { PromptVariableType } from './models/prompting';

const DESCRIBE_VAR_LID: Record<PromptVariableType, string> = {
  [PromptVariableType.BLOCK]: aiLid.variable.block,
  [PromptVariableType.OSS]: aiLid.variable.oss,
  [PromptVariableType.SCHEMA]: aiLid.variable.schema,
  [PromptVariableType.SCHEMA_THESAURUS]: aiLid.variable.schemaThesaurus,
  [PromptVariableType.SCHEMA_GRAPH]: aiLid.variable.schemaGraph,
  [PromptVariableType.SCHEMA_TYPE_GRAPH]: aiLid.variable.schemaTypeGraph,
  [PromptVariableType.CONSTITUENTA]: aiLid.variable.constituenta,
  [PromptVariableType.CONSTITUENTA_SYNTAX_TREE]: aiLid.variable.constituentaSyntaxTree
};

const MOCK_VAR_LID: Record<PromptVariableType, string> = {
  [PromptVariableType.BLOCK]: aiLid.variableMock.block,
  [PromptVariableType.OSS]: aiLid.variableMock.oss,
  [PromptVariableType.SCHEMA]: aiLid.variableMock.schema,
  [PromptVariableType.SCHEMA_THESAURUS]: aiLid.variableMock.schemaThesaurus,
  [PromptVariableType.SCHEMA_GRAPH]: aiLid.variableMock.schemaGraph,
  [PromptVariableType.SCHEMA_TYPE_GRAPH]: aiLid.variableMock.schemaTypeGraph,
  [PromptVariableType.CONSTITUENTA]: aiLid.variableMock.constituenta,
  [PromptVariableType.CONSTITUENTA_SYNTAX_TREE]: aiLid.variableMock.constituentaSyntaxTree
};

/** Retrieves description for {@link PromptVariableType}. */
export function describePromptVariable(itemType: PromptVariableType): string {
  const id = DESCRIBE_VAR_LID[itemType];
  return id ? formatLabel(id) : formatLabel(aiLid.fallback.unknownVariableType, { type: String(itemType) });
}

/** Retrieves mock text for {@link PromptVariableType}. */
export function mockPromptVariable(variable: string): string {
  if (!Object.values(PromptVariableType).includes(variable as PromptVariableType)) {
    return variable;
  }
  const id = MOCK_VAR_LID[variable as PromptVariableType];
  return id ? formatLabel(id) : formatLabel(aiLid.fallback.unknownVariable, { name: variable });
}
