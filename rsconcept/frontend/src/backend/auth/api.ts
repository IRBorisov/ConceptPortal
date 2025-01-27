import { queryOptions } from '@tanstack/react-query';

import { axiosInstance } from '@/backend/axiosInstance';
import { DELAYS } from '@/backend/configuration';
import { ICurrentUser } from '@/models/user';

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
        axiosInstance
          .get<ICurrentUser>('/users/api/auth', {
            signal: meta.signal
          })
          .then(response => (response.data.id === null ? null : response.data)),
      placeholderData: null
    });
  },

  logout: () => axiosInstance.post('/users/api/logout'),
  login: (data: IUserLoginDTO) => axiosInstance.post('/users/api/login', data),
  changePassword: (data: IChangePasswordDTO) => axiosInstance.post('/users/api/change-password', data),
  requestPasswordReset: (data: IRequestPasswordDTO) => axiosInstance.post('/users/api/password-reset', data),
  validatePasswordToken: (data: IPasswordTokenDTO) => axiosInstance.post('/users/api/password-reset/validate', data),
  resetPassword: (data: IResetPasswordDTO) => axiosInstance.post('/users/api/password-reset/confirm', data)
};
