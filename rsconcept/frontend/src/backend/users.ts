/**
 * Endpoints: users.
 */

import {
  ICurrentUser,
  IPasswordTokenData,
  IRequestPasswordData,
  IResetPasswordData,
  IUserInfo,
  IUserLoginData,
  IUserProfile,
  IUserSignupData,
  IUserUpdateData,
  IUserUpdatePassword
} from '@/models/user';

import { AxiosGet, AxiosPatch, AxiosPost, FrontAction, FrontExchange, FrontPull, FrontPush } from './apiTransport';

export function getAuth(request: FrontPull<ICurrentUser>) {
  AxiosGet({
    endpoint: `/users/api/auth`,
    request: request
  });
}

export function postLogin(request: FrontPush<IUserLoginData>) {
  AxiosPost({
    endpoint: '/users/api/login',
    request: request
  });
}

export function postLogout(request: FrontAction) {
  AxiosPost({
    endpoint: '/users/api/logout',
    request: request
  });
}

export function postSignup(request: FrontExchange<IUserSignupData, IUserProfile>) {
  AxiosPost({
    endpoint: '/users/api/signup',
    request: request
  });
}

export function getProfile(request: FrontPull<IUserProfile>) {
  AxiosGet({
    endpoint: '/users/api/profile',
    request: request
  });
}

export function patchProfile(request: FrontExchange<IUserUpdateData, IUserProfile>) {
  AxiosPatch({
    endpoint: '/users/api/profile',
    request: request
  });
}

export function patchPassword(request: FrontPush<IUserUpdatePassword>) {
  AxiosPatch({
    endpoint: '/users/api/change-password',
    request: request
  });
}

export function postRequestPasswordReset(request: FrontPush<IRequestPasswordData>) {
  // title: 'Request password reset',
  AxiosPost({
    endpoint: '/users/api/password-reset',
    request: request
  });
}

export function postValidatePasswordToken(request: FrontPush<IPasswordTokenData>) {
  // title: 'Validate password token',
  AxiosPost({
    endpoint: '/users/api/password-reset/validate',
    request: request
  });
}

export function postResetPassword(request: FrontPush<IResetPasswordData>) {
  // title: 'Reset password',
  AxiosPost({
    endpoint: '/users/api/password-reset/confirm',
    request: request
  });
}

export function getActiveUsers(request: FrontPull<IUserInfo[]>) {
  // title: 'Active users list',
  AxiosGet({
    endpoint: '/users/api/active-users',
    request: request
  });
}
