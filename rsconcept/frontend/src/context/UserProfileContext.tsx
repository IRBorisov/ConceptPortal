import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { ErrorInfo } from '../components/BackendError';
import { DataCallback, getProfile, patchProfile } from '../utils/backendAPI';
import { IUserProfile, IUserUpdateData } from '../utils/models';

interface IUserProfileContext {
  user: IUserProfile | undefined
  loading: boolean
  processing: boolean
  error: ErrorInfo
  setError: (error: ErrorInfo) => void
  updateUser: (data: IUserUpdateData, callback?: DataCallback<IUserProfile>) => void
}

const ProfileContext = createContext<IUserProfileContext | null>(null);

export const useUserProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error(
      'useUserProfile has to be used within <UserProfileState.Provider>'
    );
  }
  return context;
}

interface UserProfileStateProps {
  children: React.ReactNode
}

export const UserProfileState = ({ children }: UserProfileStateProps) => {
  const [user, setUser] = useState<IUserProfile | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<ErrorInfo>(undefined);

  const reload = useCallback(
    () => {
      setError(undefined);
      setUser(undefined);
      getProfile({
        showError: true,
        setLoading: setLoading,
        onError: error => { setError(error); },
        onSuccess: newData => { setUser(newData); }
      });
    }, [setUser]
  );
  
  const updateUser = useCallback(
    (data: IUserUpdateData, callback?: DataCallback<IUserProfile>) => {
      setError(undefined);
      patchProfile({
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: error => { setError(error); },
        onSuccess: newData => {
          setUser(newData);
          if (callback) callback(newData);
        }
      });
    }, [setUser]
  );

  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <ProfileContext.Provider
      value={{user, updateUser, error, loading, setError, processing}}
    >
      {children}
    </ProfileContext.Provider>
  );
};
