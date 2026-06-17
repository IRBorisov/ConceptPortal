import { queryOptions } from '@tanstack/react-query';

import { globalTx } from '@/i18n';

import { axiosGet, axiosPatch, axiosPost } from '@/backend/api-transport';
import { DELAYS, KEYS } from '@/backend/configuration';
import { cacheCsrfFromAuth } from '@/backend/csrf-token';
import { getRetryDelay, isTransientNetworkError } from '@/backend/query-client';

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
  changePassword: (data: IChangePasswordDTO) =>
    axiosPatch({
      endpoint: '/users/api/change-password',
      request: {
        data: data,
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

async function getCurrentUserOrAnonymous(signal: AbortSignal | undefined): Promise<ICurrentUser> {
  for (let attemptIndex = 0; attemptIndex < 3; attemptIndex += 1) {
    try {
      return await axiosGet<ICurrentUser>({
        endpoint: '/users/api/auth',
        options: { signal },
        notifyOnError: false
      });
    } catch (error) {
      if (!isTransientNetworkError(error) || attemptIndex === 2) {
        if (isTransientNetworkError(error)) {
          return anonymousCurrentUser;
        }
        throw error;
      }
      await delay(getRetryDelay(attemptIndex));
    }
  }

  return anonymousCurrentUser;
}

function delay(milliseconds: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, milliseconds);
  });
}
