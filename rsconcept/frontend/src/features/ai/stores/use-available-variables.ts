import { PromptVariableType } from '../models/prompting';

import { useAIStore } from './ai-context';

export function useAvailableVariables(): PromptVariableType[] {
  const hasCurrentOSS = useAIStore(state => !!state.currentOSS);
  const hasCurrentSchema = useAIStore(state => !!state.currentSchema);
  const hasCurrentBlock = useAIStore(state => !!state.currentBlock);
  const hasCurrentConstituenta = useAIStore(state => !!state.currentConstituenta);

  return [
    ...(hasCurrentOSS ? [PromptVariableType.OSS] : []),
    ...(hasCurrentSchema
      ? [
          PromptVariableType.SCHEMA, //
          PromptVariableType.SCHEMA_THESAURUS,
          PromptVariableType.SCHEMA_GRAPH,
          PromptVariableType.SCHEMA_TYPE_GRAPH
        ]
      : []),
    ...(hasCurrentBlock ? [PromptVariableType.BLOCK] : []),
    ...(hasCurrentConstituenta
      ? [
          PromptVariableType.CONSTITUENTA, //
          PromptVariableType.CONSTITUENTA_SYNTAX_TREE
        ]
      : [])
  ];
}
