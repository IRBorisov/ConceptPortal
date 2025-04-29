import { queryOptions } from '@tanstack/react-query';

import { axiosGet, axiosPatch, axiosPost } from '@/backend/api-transport';
import { DELAYS, KEYS } from '@/backend/configuration';
import { infoMsg } from '@/utils/labels';

import {
  type IChangePasswordDTO,
  type ICurrentUser,
  type IPasswordTokenDTO,
  type IRequestPasswordDTO,
  type IResetPasswordDTO,
  type IUserLoginDTO
} from './types';

/**
 * Authentication API.
 */
export const authApi = {
  baseKey: KEYS.auth,

  getAuthQueryOptions: () => {
    return queryOptions({
      queryKey: [authApi.baseKey, 'user'],
      staleTime: DELAYS.staleLong,
      queryFn: meta =>
        axiosGet<ICurrentUser>({
          endpoint: '/users/api/auth',
          options: { signal: meta.signal }
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
        successMessage: infoMsg.changesSaved
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
