import { createContext, useCallback, useContext, useLayoutEffect, useState } from 'react';

import { type ErrorInfo } from '../components/BackendError';
import useLocalStorage from '../hooks/useLocalStorage';
import { type BackendCallback, getAuth, postLogin, postLogout, postSignup } from '../utils/backendAPI';
import { type ICurrentUser, type IUserSignupData } from '../utils/models';

interface IAuthContext {
  user: ICurrentUser | undefined
  login: (username: string, password: string, callback?: BackendCallback) => void
  logout: (callback?: BackendCallback) => void
  signup: (data: IUserSignupData, callback?: BackendCallback) => void
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

  const loadCurrentUser = useCallback(
    async () => {
      await getAuth({
        onError: () => { setUser(undefined); },
        onSucccess: response => {
          if (response.data.id) {
            setUser(response.data);
          } else {
            setUser(undefined)
          }
        }
      });
    }, [setUser]
  );

  function login(uname: string, pw: string, callback?: BackendCallback) {
    setError(undefined);
    postLogin({
      data: { username: uname, password: pw },
      showError: true,
      setLoading,
      onError: error => { setError(error); },
      onSucccess:
      (response) => {
        loadCurrentUser()
        .then(() => { if (callback) callback(response); })
        .catch(console.error);
      }
    }).catch(console.error);
  }

  function logout(callback?: BackendCallback) {
    setError(undefined);
    postLogout({
      showError: true,
      onSucccess:
      (response) => {
        loadCurrentUser()
        .then(() => { if (callback) callback(response); })
        .catch(console.error);
      }
    }).catch(console.error);
  }

  function signup(data: IUserSignupData, callback?: BackendCallback) {
    setError(undefined);
    postSignup({
      data,
      showError: true,
      setLoading,
      onError: error => { setError(error); },
      onSucccess:
      (response) => {
        loadCurrentUser()
        .then(() => { if (callback) callback(response); })
        .catch(console.error);
      }
    }).catch(console.error);
  }

  useLayoutEffect(() => {
    loadCurrentUser().catch(console.error);
  }, [loadCurrentUser])

  return (
    <AuthContext.Provider
      value={{ user, login, logout, signup, loading, error, setError }}
    >
      {children}
    </AuthContext.Provider>
  );
};
