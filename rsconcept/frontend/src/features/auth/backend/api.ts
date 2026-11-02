import { queryOptions } from '@tanstack/react-query';

import { globalTx } from '@/i18n';
import { syncSentryUser } from '@/services/sentry';

import { axiosGet, axiosPatch, axiosPost } from '@/backend/api-transport';
import { DELAYS, KEYS } from '@/backend/configuration';
import { cacheCsrfFromAuth } from '@/backend/csrf-token';
import { isUnauthenticatedAxiosError } from '@/backend/unauthenticated-error';

import {
  anonymousCurrentUser,
  type IChangePasswordDTO,
  type ICurrentUser,
  type IPasswordTokenDTO,
  type IRequestPasswordDTO,
  type IResetPasswordDTO,
  type IUserLoginDTO
} from './types';

/** Authentication API. */
export const authApi = {
  baseKey: KEYS.auth,

  getAuthQueryOptions: () => {
    return queryOptions({
      queryKey: [authApi.baseKey, 'user'],
      staleTime: DELAYS.staleLong,
      refetchOnWindowFocus: 'always',
      refetchOnReconnect: 'always',
      queryFn: meta =>
        getCurrentUserOrAnonymous(meta.signal).then(user => {
          cacheCsrfFromAuth(user);
          syncSentryUser(user);
          return user;
        })
    });
  },

  logout: () => axiosPost({ endpoint: '/users/api/logout' }),

  login: (data: IUserLoginDTO) =>
    axiosPost({
      endpoint: '/users/api/login',
      request: { data: data }
    }),
  changePassword: ({ old_password, new_password }: IChangePasswordDTO) =>
    axiosPatch({
      endpoint: '/users/api/change-password',
      request: {
        data: { old_password, new_password },
        successMessage: globalTx('tx.general.changes.save.success')
      }
    }),
  requestPasswordReset: (data: IRequestPasswordDTO) =>
    axiosPost({
      endpoint: '/users/api/password-reset',
      request: { data: data }
    }),
  validatePasswordToken: (data: IPasswordTokenDTO) =>
    axiosPost({
      endpoint: '/users/api/password-reset/validate',
      request: { data: data }
    }),
  resetPassword: (data: IResetPasswordDTO) =>
    axiosPost({
      endpoint: '/users/api/password-reset/confirm',
      request: { data: data }
    })
} as const;

// ======= Internal =========

/**
 * Signed-in user, or the anonymous payload when the server reports that nobody is signed in.
 * A transport failure is thrown so a refetch leaves the previous cached user in place.
 */
async function getCurrentUserOrAnonymous(signal: AbortSignal | undefined): Promise<ICurrentUser> {
  try {
    return await axiosGet<ICurrentUser>({
      endpoint: '/users/api/auth',
      options: { signal },
      notifyOnError: false
    });
  } catch (error) {
    if (isUnauthenticatedAxiosError(error)) {
      return anonymousCurrentUser;
    }
    throw error;
  }
}
