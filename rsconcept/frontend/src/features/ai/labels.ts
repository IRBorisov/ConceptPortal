import { PromptVariableType } from './models/prompting';

const describePromptVariableRecord: Record<PromptVariableType, string> = {
  [PromptVariableType.BLOCK]: 'Текущий блок операционной схемы',
  [PromptVariableType.OSS]: 'Текущая операционная схема',
  [PromptVariableType.SCHEMA]: 'Текущая концептуальная схема',
  [PromptVariableType.CONSTITUENTA]: 'Текущая конституента'
};

const mockPromptVariableRecord: Record<PromptVariableType, string> = {
  [PromptVariableType.BLOCK]: 'Пример: Текущий блок операционной схемы',
  [PromptVariableType.OSS]: 'Пример: Текущая операционная схема',
  [PromptVariableType.SCHEMA]: 'Пример: Текущая концептуальная схема',
  [PromptVariableType.CONSTITUENTA]: 'Пример: Текущая конституента'
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
