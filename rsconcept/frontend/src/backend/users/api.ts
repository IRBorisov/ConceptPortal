import { queryOptions } from '@tanstack/react-query';

import { axiosInstance } from '@/backend/axiosInstance';
import { DELAYS } from '@/backend/configuration';
import { IUser, IUserInfo, IUserProfile, IUserSignupData } from '@/models/user';

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
        axiosInstance
          .get<IUserInfo[]>('/users/api/active-users', {
            signal: meta.signal
          })
          .then(response => response.data)
    }),
  getProfileQueryOptions: () =>
    queryOptions({
      queryKey: [usersApi.baseKey, 'profile'],
      staleTime: DELAYS.staleShort,
      queryFn: meta =>
        axiosInstance
          .get<IUserProfile>('/users/api/profile', {
            signal: meta.signal
          })
          .then(response => response.data)
    }),

  signup: (data: IUserSignupData) => axiosInstance.post('/users/api/signup', data),
  updateProfile: (data: IUpdateProfileDTO) => axiosInstance.patch('/users/api/profile', data)
};
