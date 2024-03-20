'use client';

import { createContext, useCallback, useContext, useLayoutEffect, useState } from 'react';

import { type ErrorData } from '@/components/info/InfoError';
import useLocalStorage from '@/hooks/useLocalStorage';
import { IPasswordTokenData, IRequestPasswordData, IResetPasswordData, IUserLoginData } from '@/models/library';
import { ICurrentUser } from '@/models/library';
import { IUserSignupData } from '@/models/library';
import { IUserProfile } from '@/models/library';
import { IUserInfo } from '@/models/library';
import { IUserUpdatePassword } from '@/models/library';
import {
  type DataCallback,
  getAuth,
  patchPassword,
  postLogin,
  postLogout,
  postRequestPasswordReset,
  postResetPassword,
  postSignup,
  postValidatePasswordToken
} from '@/utils/backendAPI';

import { useUsers } from './UsersContext';

interface IAuthContext {
  user: ICurrentUser | undefined;
  login: (data: IUserLoginData, callback?: DataCallback) => void;
  logout: (callback?: DataCallback) => void;
  signup: (data: IUserSignupData, callback?: DataCallback<IUserProfile>) => void;
  updatePassword: (data: IUserUpdatePassword, callback?: () => void) => void;
  requestPasswordReset: (data: IRequestPasswordData, callback?: () => void) => void;
  validateToken: (data: IPasswordTokenData, callback?: () => void) => void;
  resetPassword: (data: IResetPasswordData, callback?: () => void) => void;
  loading: boolean;
  error: ErrorData;
  setError: (error: ErrorData) => void;
}

const AuthContext = createContext<IAuthContext | null>(null);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth has to be used within <AuthState.Provider>');
  }
  return context;
};

interface AuthStateProps {
  children: React.ReactNode;
}

export const AuthState = ({ children }: AuthStateProps) => {
  const { users } = useUsers();
  const [user, setUser] = useLocalStorage<ICurrentUser | undefined>('user', undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorData>(undefined);

  const reload = useCallback(
    (callback?: () => void) => {
      getAuth({
        onError: () => setUser(undefined),
        onSuccess: currentUser => {
          if (currentUser.id) {
            setUser(currentUser);
          } else {
            setUser(undefined);
          }
          if (callback) callback();
        }
      });
    },
    [setUser]
  );

  function login(data: IUserLoginData, callback?: DataCallback) {
    setError(undefined);
    postLogin({
      data: data,
      showError: false,
      setLoading: setLoading,
      onError: setError,
      onSuccess: newData =>
        reload(() => {
          if (callback) callback(newData);
        })
    });
  }

  function logout(callback?: DataCallback) {
    setError(undefined);
    postLogout({
      showError: true,
      onSuccess: newData =>
        reload(() => {
          if (callback) callback(newData);
        })
    });
  }

  function signup(data: IUserSignupData, callback?: DataCallback<IUserProfile>) {
    setError(undefined);
    postSignup({
      data: data,
      showError: true,
      setLoading: setLoading,
      onError: setError,
      onSuccess: newData =>
        reload(() => {
          users.push(newData as IUserInfo);
          if (callback) callback(newData);
        })
    });
  }

  const updatePassword = useCallback(
    (data: IUserUpdatePassword, callback?: () => void) => {
      setError(undefined);
      patchPassword({
        data: data,
        showError: true,
        setLoading: setLoading,
        onError: setError,
        onSuccess: () =>
          reload(() => {
            if (callback) callback();
          })
      });
    },
    [reload]
  );

  const requestPasswordReset = useCallback(
    (data: IRequestPasswordData, callback?: () => void) => {
      setError(undefined);
      postRequestPasswordReset({
        data: data,
        showError: false,
        setLoading: setLoading,
        onError: setError,
        onSuccess: () =>
          reload(() => {
            if (callback) callback();
          })
      });
    },
    [reload]
  );

  const validateToken = useCallback(
    (data: IPasswordTokenData, callback?: () => void) => {
      setError(undefined);
      postValidatePasswordToken({
        data: data,
        showError: false,
        setLoading: setLoading,
        onError: setError,
        onSuccess: () =>
          reload(() => {
            if (callback) callback();
          })
      });
    },
    [reload]
  );

  const resetPassword = useCallback(
    (data: IResetPasswordData, callback?: () => void) => {
      setError(undefined);
      postResetPassword({
        data: data,
        showError: false,
        setLoading: setLoading,
        onError: setError,
        onSuccess: () =>
          reload(() => {
            if (callback) callback();
          })
      });
    },
    [reload]
  );

  useLayoutEffect(() => {
    reload();
  }, [reload]);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        signup,
        loading,
        error,
        setError,
        updatePassword,
        requestPasswordReset,
        validateToken,
        resetPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
