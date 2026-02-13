import { create } from 'zustand';

import { type Block, type Operation, type OperationSchema } from '@/features/oss/models/oss';
import { type Constituenta, type RSForm } from '@/features/rsform';
import { type RSModel } from '@/features/rsform/models/rsmodel';

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
  oss: OperationSchema | null;
  setOSS: (value: OperationSchema | null) => void;

  schema: RSForm | null;
  setSchema: (value: RSForm | null) => void;

  model: RSModel | null;
  setModel: (value: RSModel | null) => void;

  block: Block | null;
  setBlock: (value: Block | null) => void;

  operation: Operation | null;
  setOperation: (value: Operation | null) => void;

  constituenta: Constituenta | null;
  setConstituenta: (value: Constituenta | null) => void;
}

export const useAIStore = create<AIContextStore>()(set => ({
  oss: null,
  setOSS: value => set({ oss: value }),

  schema: null,
  setSchema: value => set({ schema: value }),

  model: null,
  setModel: value => set({ model: value }),

  block: null,
  setBlock: value => set({ block: value }),

  operation: null,
  setOperation: value => set({ operation: value }),

  constituenta: null,
  setConstituenta: value => set({ constituenta: value })
}));

/** Returns a selector function for Zustand based on variable type */
export function makeVariableSelector(variableType: PromptVariableType) {
  switch (variableType) {
    case PromptVariableType.OSS:
      return (state: AIContextStore) => ({ oss: state.oss });

    case PromptVariableType.SCHEMA:
    case PromptVariableType.SCHEMA_THESAURUS:
      return (state: AIContextStore) => ({ schema: state.schema });

    case PromptVariableType.BLOCK:
      return (state: AIContextStore) => ({ block: state.block, oss: state.oss });

    case PromptVariableType.CONSTITUENTA:
      return (state: AIContextStore) => ({ constituenta: state.constituenta });

    case PromptVariableType.CONSTITUENTA_SYNTAX_TREE:
      return (state: AIContextStore) => ({
        constituenta: state.constituenta,
        schema: state.schema
      });
  }
}

/** Evaluates a prompt variable */
export function evaluatePromptVariable(variableType: PromptVariableType, context: Partial<AIContextStore>): string {
  switch (variableType) {
    case PromptVariableType.OSS:
      return context.oss ? varOSS(context.oss) : `!${variableType}!`;
    case PromptVariableType.SCHEMA:
      return context.schema ? varSchema(context.schema) : `!${variableType}!`;
    case PromptVariableType.SCHEMA_THESAURUS:
      return context.schema ? varSchemaThesaurus(context.schema) : `!${variableType}!`;
    case PromptVariableType.SCHEMA_GRAPH:
      return context.schema ? varSchemaGraph(context.schema) : `!${variableType}!`;
    case PromptVariableType.SCHEMA_TYPE_GRAPH:
      return context.schema ? varSchemaTypeGraph(context.schema) : `!${variableType}!`;
    case PromptVariableType.BLOCK:
      return context.block && context.oss
        ? varBlock(context.block, context.oss)
        : `!${variableType}!`;
    case PromptVariableType.CONSTITUENTA:
      return context.constituenta ? varConstituenta(context.constituenta) : `!${variableType}!`;
    case PromptVariableType.CONSTITUENTA_SYNTAX_TREE:
      return context.constituenta && context.schema ?
        varSyntaxTree(context.constituenta, context.schema) : `!${variableType}!`;
  }
}
