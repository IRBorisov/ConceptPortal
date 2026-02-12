import { queryOptions } from '@tanstack/react-query';
import { z } from 'zod';

import { axiosGet, axiosPatch, axiosPost } from '@/backend/api-transport';
import { DELAYS, KEYS } from '@/backend/configuration';
import { infoMsg } from '@/utils/labels';

import {
  schemaUserInfo,
  schemaUserProfile,
  type UpdateProfileDTO,
  type UserInfo,
  type UserProfile,
  type UserSignupDTO
} from './types';

export const usersApi = {
  baseKey: KEYS.users,

  getUsersQueryOptions: () =>
    queryOptions({
      queryKey: [usersApi.baseKey, 'list'],
      staleTime: DELAYS.staleMedium,
      queryFn: meta =>
        axiosGet<UserInfo[]>({
          schema: z.array(schemaUserInfo),
          endpoint: '/users/api/active-users',
          options: { signal: meta.signal }
        })
    }),
  getProfileQueryOptions: () =>
    queryOptions({
      queryKey: [usersApi.baseKey, 'profile'],
      staleTime: DELAYS.staleShort,
      queryFn: meta =>
        axiosGet<UserProfile>({
          schema: schemaUserProfile,
          endpoint: '/users/api/profile',
          options: { signal: meta.signal }
        })
    }),

  signup: (data: UserSignupDTO) =>
    axiosPost<UserSignupDTO, UserProfile>({
      schema: schemaUserProfile,
      endpoint: '/users/api/signup',
      request: {
        data: data,
        successMessage: createdUser => infoMsg.newUser(createdUser.username)
      }
    }),

  updateProfile: (data: UpdateProfileDTO) =>
    axiosPatch<UpdateProfileDTO, UserProfile>({
      schema: schemaUserProfile,
      endpoint: '/users/api/profile',
      request: {
        data: data,
        successMessage: infoMsg.changesSaved
      }
    })
} as const;
