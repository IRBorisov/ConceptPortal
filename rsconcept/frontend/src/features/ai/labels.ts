import { PromptVariableType } from './models/prompting';

const describePromptVariableRecord: Record<PromptVariableType, string> = {
  [PromptVariableType.BLOCK]: 'Текущий блок операционной схемы',
  [PromptVariableType.OSS]: 'Текущая операционная схема',
  [PromptVariableType.SCHEMA]: 'Текущая концептуальная схема',
  [PromptVariableType.SCHEMA_THESAURUS]: 'Термины и определения текущей концептуальной схемы',
  [PromptVariableType.CONSTITUENTA]: 'Текущая конституента',
  [PromptVariableType.CONSTITUENTA_SYNTAX_TREE]: 'Синтаксическое дерево конституенты'
};

const mockPromptVariableRecord: Record<PromptVariableType, string> = {
  [PromptVariableType.BLOCK]: 'Пример: Текущий блок операционной схемы',
  [PromptVariableType.OSS]: 'Пример: Текущая операционная схема',
  [PromptVariableType.SCHEMA]: 'Пример: Текущая концептуальная схема',
  [PromptVariableType.SCHEMA_THESAURUS]: 'Пример\nТермин1 - Определение1\nТермин2 - Определение2',
  [PromptVariableType.CONSTITUENTA]: 'Пример: Текущая конституента',
  [PromptVariableType.CONSTITUENTA_SYNTAX_TREE]: 'Пример синтаксического дерева конституенты'
};

/** Retrieves description for {@link PromptVariableType}. */
export function describePromptVariable(itemType: PromptVariableType): string {
  return describePromptVariableRecord[itemType] ?? `UNKNOWN VARIABLE TYPE: ${itemType}`;
}

/** Retrieves mock text for {@link PromptVariableType}. */
export function mockPromptVariable(variable: string): string {
  if (!Object.values(PromptVariableType).includes(variable as PromptVariableType)) {
    return variable;
  }
  return mockPromptVariableRecord[variable as PromptVariableType] ?? `UNKNOWN VARIABLE: ${variable}`;
}
