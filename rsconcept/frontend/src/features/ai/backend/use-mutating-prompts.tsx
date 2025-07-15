import { useIsMutating } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';

import { promptsApi } from './api';

export const useMutatingPrompts = () => {
  const countMutations = useIsMutating({ mutationKey: [KEYS.global_mutation, promptsApi.baseKey] });
  return countMutations !== 0;
};
