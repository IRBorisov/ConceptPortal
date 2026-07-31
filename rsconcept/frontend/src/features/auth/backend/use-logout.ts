import { useMutation, useQueryClient } from '@tanstack/react-query';

import { syncSentryUser } from '@/services/sentry';

import { KEYS } from '@/backend/configuration';
import { clearCachedCsrfToken } from '@/backend/csrf-token';

import { authApi } from './api';
import { notifyAuthSync } from './auth-sync';
import { anonymousCurrentUser } from './types';

export const useLogout = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.auth, 'logout'],
    mutationFn: authApi.logout,
    onMutate: async () => {
      await client.cancelQueries();
    },
    onSuccess: () => {
      clearCachedCsrfToken();
      client.setQueryData(authApi.getAuthQueryOptions().queryKey, anonymousCurrentUser);
      syncSentryUser(anonymousCurrentUser);
      notifyAuthSync('logout');
    }
  });
  return { logout: mutation.mutateAsync };
};
