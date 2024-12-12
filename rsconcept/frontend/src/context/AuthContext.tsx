'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { DataCallback } from '@/backend/apiTransport';
import {
  getAuth,
  patchPassword,
  postLogin,
  postLogout,
  postRequestPasswordReset,
  postResetPassword,
  postSignup,
  postValidatePasswordToken
} from '@/backend/users';
import { type ErrorData } from '@/components/info/InfoError';
import {
  ICurrentUser,
  IPasswordTokenData,
  IRequestPasswordData,
  IResetPasswordData,
  IUserInfo,
  IUserLoginData,
  IUserProfile,
  IUserSignupData,
  IUserUpdatePassword
} from '@/models/user';
import { contextOutsideScope } from '@/utils/labels';

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
    throw new Error(contextOutsideScope('useAuth', 'AuthState'));
  }
  return context;
};

export const AuthState = ({ children }: React.PropsWithChildren) => {
  const { users } = useUsers();
  const [user, setUser] = useState<ICurrentUser | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorData>(undefined);

  const reload = useCallback(
    (callback?: () => void) => {
      getAuth({
        onError: () => setUser(undefined),
        setLoading: setLoading,
        onSuccess: currentUser => {
          if (currentUser.id) {
            setUser(currentUser);
          } else {
            setUser(undefined);
          }
          callback?.();
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
          callback?.(newData);
        })
    });
  }

  function logout(callback?: DataCallback) {
    setError(undefined);
    postLogout({
      showError: true,
      onSuccess: newData =>
        reload(() => {
          callback?.(newData);
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
          callback?.(newData);
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
        onSuccess: () => reload(callback)
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
            callback?.();
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
            callback?.();
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
            callback?.();
          })
      });
    },
    [reload]
  );

  useEffect(() => {
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
