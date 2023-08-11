import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { ErrorInfo } from '../components/BackendError';
import { DataCallback, getProfile, patchPassword,patchProfile } from '../utils/backendAPI';
import { IUserProfile, IUserUpdateData, IUserUpdatePassword } from '../utils/models';
import { useAuth } from './AuthContext';

interface IUserProfileContext {
  user: IUserProfile | undefined
  loading: boolean
  processing: boolean
  error: ErrorInfo
  setError: (error: ErrorInfo) => void
  updateUser: (data: IUserUpdateData, callback?: DataCallback<IUserProfile>) => void
  updatePassword: (data: IUserUpdatePassword, callback?: () => void) => void
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
  const auth = useAuth()

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

  const updatePassword = useCallback(
    (data: IUserUpdatePassword, callback?: () => void) => {
      setError(undefined);
      patchPassword({
        data: data,
        showError: true,
        setLoading: setProcessing,
        onError: error => { setError(error); },
        onSuccess: () => {
          setUser(undefined);
          auth.reload();
          if (callback) callback();       
      }});
    }, [setUser, auth]
  );

  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <ProfileContext.Provider
      value={{user, updateUser, updatePassword, error, loading, setError, processing}}
    >
      {children}
    </ProfileContext.Provider>
  );
};
