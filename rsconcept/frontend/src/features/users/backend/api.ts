import { queryOptions } from '@tanstack/react-query';

import { axiosGet, axiosPatch, axiosPost } from '@/backend/apiTransport';
import { DELAYS, KEYS } from '@/backend/configuration';
import { infoMsg } from '@/utils/labels';

import { type IUserInfo, type IUserProfile } from '../models/user';

import { type IUpdateProfileDTO, type IUserSignupDTO } from './types';

export const usersApi = {
  baseKey: KEYS.users,

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
        successMessage: createdUser => infoMsg.newUser(createdUser.username)
      }
    }),

  updateProfile: (data: IUpdateProfileDTO) =>
    axiosPatch<IUpdateProfileDTO, IUserProfile>({
      endpoint: '/users/api/profile',
      request: {
        data: data,
        successMessage: infoMsg.changesSaved
      }
    })
};
