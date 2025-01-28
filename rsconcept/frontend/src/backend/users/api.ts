import { queryOptions } from '@tanstack/react-query';

import { axiosGet, axiosPatch, axiosPost } from '@/backend/apiTransport';
import { DELAYS } from '@/backend/configuration';
import { IUser, IUserInfo, IUserProfile, IUserSignupData } from '@/models/user';
import { information } from '@/utils/labels';

/**
 * Represents user data, intended to update user profile in persistent storage.
 */
export interface IUpdateProfileDTO extends Omit<IUser, 'is_staff' | 'id'> {}

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

  signup: (data: IUserSignupData) =>
    axiosPost<IUserSignupData, IUserProfile>({
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
