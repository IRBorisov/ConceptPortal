import { queryOptions } from '@tanstack/react-query';

import { DELAYS } from '@/backend/configuration';
import { ICurrentUser } from '@/models/user';
import { information } from '@/utils/labels';

import { axiosGet, axiosPost } from '../apiTransport';

/**
 * Represents login data, used to authenticate users.
 */
export interface IUserLoginDTO {
  username: string;
  password: string;
}

/**
 * Represents data needed to update password for current user.
 */
export interface IChangePasswordDTO {
  old_password: string;
  new_password: string;
}

/**
 * Represents password reset request data.
 */
export interface IRequestPasswordDTO {
  email: string;
}

/**
 * Represents password reset data.
 */
export interface IResetPasswordDTO {
  password: string;
  token: string;
}

/**
 * Represents password token data.
 */
export interface IPasswordTokenDTO {
  token: string;
}

/**
 * Authentication API.
 */
export const authApi = {
  baseKey: 'auth',

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
    axiosPost({
      endpoint: '/users/api/change-password',
      request: {
        data: data,
        successMessage: information.changesSaved
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
};
