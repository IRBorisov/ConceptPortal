import { createContext, useCallback, useContext, useLayoutEffect, useState } from 'react';

import { type ErrorInfo } from '../components/BackendError';
import useLocalStorage from '../hooks/useLocalStorage';
import { type DataCallback, getAuth, postLogin, postLogout, postSignup } from '../utils/backendAPI';
import { ICurrentUser, IUserLoginData, IUserProfile, IUserSignupData } from '../utils/models';

interface IAuthContext {
  user: ICurrentUser | undefined
  login: (data: IUserLoginData, callback?: DataCallback) => void
  logout: (callback?: DataCallback) => void
  signup: (data: IUserSignupData, callback?: DataCallback<IUserProfile>) => void
  reload: (callback?: () => void) => void
  loading: boolean
  error: ErrorInfo
  setError: (error: ErrorInfo) => void
}

const AuthContext = createContext<IAuthContext | null>(null);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      'useAuth has to be used within <AuthState.Provider>'
    );
  }
  return context;
}

interface AuthStateProps {
  children: React.ReactNode
}

export const AuthState = ({ children }: AuthStateProps) => {
  const [user, setUser] = useLocalStorage<ICurrentUser | undefined>('user', undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorInfo>(undefined);

  const reload = useCallback(
    (callback?: () => void) => {
      getAuth({
        onError: () => { setUser(undefined); },
        onSuccess: currentUser => {
          if (currentUser.id) {
            setUser(currentUser);
          } else {
            setUser(undefined);
          }
          if (callback) callback();
        }
      });
    }, [setUser]
  );

  function login(data: IUserLoginData, callback?: DataCallback) {
    setError(undefined);
    postLogin({
      data: data,
      showError: true,
      setLoading: setLoading,
      onError: error => { setError(error); },
      onSuccess: newData => reload(() => { if (callback) callback(newData); })
    });
  }

  function logout(callback?: DataCallback) {
    setError(undefined);
    postLogout({
      showError: true,
      onSuccess: newData => reload(() => { if (callback) callback(newData); })
    });
  }

  function signup(data: IUserSignupData, callback?: DataCallback<IUserProfile>) {
    setError(undefined);
    postSignup({
      data: data,
      showError: true,
      setLoading: setLoading,
      onError: error => { setError(error); },
      onSuccess: newData => reload(() => { if (callback) callback(newData); })
    });
  }

  useLayoutEffect(() => {
    reload();
  }, [reload])

  return (
    <AuthContext.Provider
      value={{ user, login, logout, signup, loading, error, reload, setError }}
    >
      {children}
    </AuthContext.Provider>
  );
};
