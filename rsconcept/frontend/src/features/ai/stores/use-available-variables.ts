import { PromptVariableType } from '../models/prompting';

import { useAIStore } from './ai-context';

export function useAvailableVariables(): PromptVariableType[] {
  const hasCurrentOSS = useAIStore(state => !!state.oss);
  const hasCurrentSchema = useAIStore(state => !!state.schema);
  const hasCurrentBlock = useAIStore(state => !!state.block);
  const hasCurrentConstituenta = useAIStore(state => !!state.constituenta);

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
