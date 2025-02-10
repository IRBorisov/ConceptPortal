import { queryOptions } from '@tanstack/react-query';
import { z } from 'zod';

import { axiosGet, axiosPatch, axiosPost } from '@/backend/apiTransport';
import { DELAYS } from '@/backend/configuration';
import { patterns } from '@/utils/constants';
import { errors, information } from '@/utils/labels';

import { IUserInfo, IUserProfile } from '../models/user';

/**
 * Represents signup data, used to create new users.
 */
export const schemaUserSignup = z
  .object({
    username: z.string().nonempty(errors.requiredField).regex(RegExp(patterns.login), errors.loginFormat),
    email: z.string().email(errors.emailField),
    first_name: z.string(),
    last_name: z.string(),

    password: z.string().nonempty(errors.requiredField),
    password2: z.string().nonempty(errors.requiredField)
  })
  .refine(schema => schema.password === schema.password2, { path: ['password2'], message: errors.passwordsMismatch });

/**
 * Represents signup data, used to create new users.
 */
export type IUserSignupDTO = z.infer<typeof schemaUserSignup>;

/**
 * Represents user data, intended to update user profile in persistent storage.
 */
export const schemaUpdateProfile = z.object({
  email: z.string().email(errors.emailField),
  first_name: z.string(),
  last_name: z.string()
});

/**
 * Represents user data, intended to update user profile in persistent storage.
 */
export type IUpdateProfileDTO = z.infer<typeof schemaUpdateProfile>;

export const usersApi = {
  baseKey: 'users',
  getUsersQueryOptions: () =>
    queryOptions({
      queryKey: [usersApi.baseKey, 'list'],
      staleTime: DELAYS.staleMedium,
      queryFn: meta =>
        axiosGet<IUserInfo[]>({
          endpoint: '/users/api/active-users',
          options: { signal: meta.signal }
        })
    }),
  getProfileQueryOptions: () =>
    queryOptions({
      queryKey: [usersApi.baseKey, 'profile'],
      staleTime: DELAYS.staleShort,
      queryFn: meta =>
        axiosGet<IUserProfile>({
          endpoint: '/users/api/profile',
          options: { signal: meta.signal }
        })
    }),

  signup: (data: IUserSignupDTO) =>
    axiosPost<IUserSignupDTO, IUserProfile>({
      endpoint: '/users/api/signup',
      request: {
        data: data,
        successMessage: createdUser => information.newUser(createdUser.username)
      }
    }),

  updateProfile: (data: IUpdateProfileDTO) =>
    axiosPatch<IUpdateProfileDTO, IUserProfile>({
      endpoint: '/users/api/profile',
      request: {
        data: data,
        successMessage: information.changesSaved
      }
    })
};
