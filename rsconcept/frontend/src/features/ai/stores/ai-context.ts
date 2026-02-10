import { create } from 'zustand';

import { type IBlock, type IOperation, type IOperationSchema } from '@/features/oss/models/oss';
import { type IConstituenta, type IRSForm } from '@/features/rsform';

import { PromptVariableType } from '../models/prompting';
import {
  varBlock,
  varConstituenta,
  varOSS,
  varSchema,
  varSchemaGraph,
  varSchemaThesaurus,
  varSchemaTypeGraph,
  varSyntaxTree
} from '../models/prompting-api';

interface AIContextStore {
  currentOSS: IOperationSchema | null;
  setCurrentOSS: (value: IOperationSchema | null) => void;

  currentSchema: IRSForm | null;
  setCurrentSchema: (value: IRSForm | null) => void;

  currentBlock: IBlock | null;
  setCurrentBlock: (value: IBlock | null) => void;

  currentOperation: IOperation | null;
  setCurrentOperation: (value: IOperation | null) => void;

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

  currentOperation: null,
  setCurrentOperation: value => set({ currentOperation: value }),

  currentConstituenta: null,
  setCurrentConstituenta: value => set({ currentConstituenta: value })
}));

/** Returns a selector function for Zustand based on variable type */
export function makeVariableSelector(variableType: PromptVariableType) {
  switch (variableType) {
    case PromptVariableType.OSS:
      return (state: AIContextStore) => ({ currentOSS: state.currentOSS });
    case PromptVariableType.SCHEMA:
    case PromptVariableType.SCHEMA_THESAURUS:
      return (state: AIContextStore) => ({ currentSchema: state.currentSchema });
    case PromptVariableType.BLOCK:
      return (state: AIContextStore) => ({ currentBlock: state.currentBlock, currentOSS: state.currentOSS });
    case PromptVariableType.CONSTITUENTA:
      return (state: AIContextStore) => ({ currentConstituenta: state.currentConstituenta });
    case PromptVariableType.CONSTITUENTA_SYNTAX_TREE:
      return (state: AIContextStore) => ({
        currentConstituenta: state.currentConstituenta,
        currentSchema: state.currentSchema
      });
    default:
      return () => ({});
  }
}

/** Evaluates a prompt variable */
export function evaluatePromptVariable(variableType: PromptVariableType, context: Partial<AIContextStore>): string {
  switch (variableType) {
    case PromptVariableType.OSS:
      return context.currentOSS ? varOSS(context.currentOSS) : `!${variableType}!`;
    case PromptVariableType.SCHEMA:
      return context.currentSchema ? varSchema(context.currentSchema) : `!${variableType}!`;
    case PromptVariableType.SCHEMA_THESAURUS:
      return context.currentSchema ? varSchemaThesaurus(context.currentSchema) : `!${variableType}!`;
    case PromptVariableType.SCHEMA_GRAPH:
      return context.currentSchema ? varSchemaGraph(context.currentSchema) : `!${variableType}!`;
    case PromptVariableType.SCHEMA_TYPE_GRAPH:
      return context.currentSchema ? varSchemaTypeGraph(context.currentSchema) : `!${variableType}!`;
    case PromptVariableType.BLOCK:
      return context.currentBlock && context.currentOSS
        ? varBlock(context.currentBlock, context.currentOSS)
        : `!${variableType}!`;
    case PromptVariableType.CONSTITUENTA:
      return context.currentConstituenta ? varConstituenta(context.currentConstituenta) : `!${variableType}!`;
    case PromptVariableType.CONSTITUENTA_SYNTAX_TREE:
      return context.currentConstituenta && context.currentSchema ?
        varSyntaxTree(context.currentConstituenta, context.currentSchema) : `!${variableType}!`;
  }
}
