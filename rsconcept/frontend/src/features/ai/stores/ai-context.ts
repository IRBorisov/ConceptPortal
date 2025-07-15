import { create } from 'zustand';

import { type IBlock, type IOperationSchema } from '@/features/oss/models/oss';
import { type IConstituenta, type IRSForm } from '@/features/rsform';
import { labelCstTypification } from '@/features/rsform/labels';

import { PromptVariableType } from '../models/prompting';

interface AIContextStore {
  currentOSS: IOperationSchema | null;
  setCurrentOSS: (value: IOperationSchema | null) => void;

  currentSchema: IRSForm | null;
  setCurrentSchema: (value: IRSForm | null) => void;

  currentBlock: IBlock | null;
  setCurrentBlock: (value: IBlock | null) => void;

  currentConstituenta: IConstituenta | null;
  setCurrentConstituenta: (value: IConstituenta | null) => void;
}

export const useAIStore = create<AIContextStore>()(set => ({
  currentOSS: null,
  setCurrentOSS: value => set({ currentOSS: value }),

  currentSchema: null,
  setCurrentSchema: value => set({ currentSchema: value }),

  currentBlock: null,
  setCurrentBlock: value => set({ currentBlock: value }),

  currentConstituenta: null,
  setCurrentConstituenta: value => set({ currentConstituenta: value })
}));

/** Returns a selector function for Zustand based on variable type */
export function makeVariableSelector(variableType: PromptVariableType) {
  switch (variableType) {
    case PromptVariableType.OSS:
      return (state: AIContextStore) => ({ currentOSS: state.currentOSS });
    case PromptVariableType.SCHEMA:
      return (state: AIContextStore) => ({ currentSchema: state.currentSchema });
    case PromptVariableType.BLOCK:
      return (state: AIContextStore) => ({ currentBlock: state.currentBlock });
    case PromptVariableType.CONSTITUENTA:
      return (state: AIContextStore) => ({ currentConstituenta: state.currentConstituenta });
    default:
      return () => ({});
  }
}

/** Evaluates a prompt variable */
export function evaluatePromptVariable(variableType: PromptVariableType, context: Partial<AIContextStore>): string {
  switch (variableType) {
    case PromptVariableType.OSS:
      return context.currentOSS?.title ?? '';
    case PromptVariableType.SCHEMA:
      return context.currentSchema ? generateSchemaPrompt(context.currentSchema) : '';
    case PromptVariableType.BLOCK:
      return context.currentBlock?.title ?? '';
    case PromptVariableType.CONSTITUENTA:
      return context.currentConstituenta?.alias ?? '';
  }
}

// ====== Internals =========
function generateSchemaPrompt(schema: IRSForm): string {
  let body = `Название концептуальной схемы: ${schema.title}\n`;
  body += `[${schema.alias}] Описание: "${schema.description}"\n\n`;
  body += 'Понятия:\n';
  schema.items.forEach(item => {
    body += `${item.alias} - "${labelCstTypification(item)}" - "${item.term_resolved}" - "${
      item.definition_formal
    }" - "${item.definition_resolved}" - "${item.convention}"\n`;
  });
  return body;
}
