import { PromptVariableType } from '../models/prompting';

import { useAIStore } from './ai-context';

export function useAvailableVariables(): PromptVariableType[] {
  const hasCurrentOSS = useAIStore(state => !!state.currentOSS);
  const hasCurrentSchema = useAIStore(state => !!state.currentSchema);
  const hasCurrentBlock = useAIStore(state => !!state.currentBlock);
  const hasCurrentConstituenta = useAIStore(state => !!state.currentConstituenta);

  return [
    ...(hasCurrentOSS ? [PromptVariableType.OSS] : []),
    ...(hasCurrentSchema ? [PromptVariableType.SCHEMA] : []),
    ...(hasCurrentBlock ? [PromptVariableType.BLOCK] : []),
    ...(hasCurrentConstituenta ? [PromptVariableType.CONSTITUENTA] : [])
  ];
}
