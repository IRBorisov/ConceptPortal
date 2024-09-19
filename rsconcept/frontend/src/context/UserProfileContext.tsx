'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { DataCallback } from '@/backend/apiTransport';
import { getProfile, patchProfile } from '@/backend/users';
import { ErrorData } from '@/components/info/InfoError';
import { IUserProfile, IUserUpdateData } from '@/models/user';
import { contextOutsideScope } from '@/utils/labels';

import { useUsers } from './UsersContext';

interface IUserProfileContext {
  user: IUserProfile | undefined;
  loading: boolean;
  processing: boolean;
  error: ErrorData;
  errorProcessing: ErrorData;
  setError: (error: ErrorData) => void;
  updateUser: (data: IUserUpdateData, callback?: DataCallback<IUserProfile>) => void;
}

const ProfileContext = createContext<IUserProfileContext | null>(null);

export const useUserProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error(contextOutsideScope('useUserProfile', 'UserProfileState'));
  }
  return context;
};

export const UserProfileState = ({ children }: React.PropsWithChildren) => {
  const { users } = useUsers();
  const [user, setUser] = useState<IUserProfile | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<ErrorData>(undefined);
  const [errorProcessing, setErrorProcessing] = useState<ErrorData>(undefined);

  const reload = useCallback(() => {
    setError(undefined);
    setUser(undefined);
    getProfile({
      showError: true,
      setLoading: setLoading,
      onError: setError,
      onSuccess: newData => setUser(newData)
    });
  }, [setUser]);

  const updateUser = useCallback(
    (data: IUserUpdateData, callback?: DataCallback<IUserProfile>) => {
      setErrorProcessing(undefined);
      patchProfile({
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: setErrorProcessing,
        onSuccess: newData => {
          setUser(newData);
          const libraryUser = users.find(item => item.id === user?.id);
          if (libraryUser) {
            libraryUser.first_name = newData.first_name;
            libraryUser.last_name = newData.last_name;
          }
          if (callback) callback(newData);
        }
      });
    },
    [setUser, users, user?.id]
  );

  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <ProfileContext.Provider value={{ user, updateUser, error, loading, setError, processing, errorProcessing }}>
      {children}
    </ProfileContext.Provider>
  );
};
