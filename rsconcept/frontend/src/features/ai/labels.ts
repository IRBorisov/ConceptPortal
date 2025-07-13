import { PromptVariableType } from './models/prompting';

const describePromptVariableRecord: Record<PromptVariableType, string> = {
  [PromptVariableType.BLOCK]: 'Текущий блок операционной схемы',
  [PromptVariableType.OSS]: 'Текущая операционная схема',
  [PromptVariableType.SCHEMA]: 'Текущая концептуальный схема',
  [PromptVariableType.CONSTITUENTA]: 'Текущая конституента'
};

/** Retrieves description for {@link PromptVariableType}. */
export function describePromptVariable(itemType: PromptVariableType): string {
  return describePromptVariableRecord[itemType] ?? `UNKNOWN VARIABLE TYPE: ${itemType}`;
}
