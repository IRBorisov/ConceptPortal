import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useState } from 'react';
import { ICurrentUser, IUserSignupData } from '../utils/models';
import { ErrorInfo } from '../components/BackendError';
import useLocalStorage from '../hooks/useLocalStorage';
import { BackendCallback, getAuth, postLogin, postLogout, postSignup } from '../utils/backendAPI';


interface IAuthContext {
  user: ICurrentUser | undefined
  login: (username: string, password: string, callback?: BackendCallback) => Promise<void>
  logout: (callback?: BackendCallback) => Promise<void>
  signup: (data: IUserSignupData, callback?: BackendCallback) => Promise<void>
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
      getAuth({
        onError: error => setUser(undefined),
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
  
  async function login(uname: string, pw: string, callback?: BackendCallback) {
    setError(undefined);
    postLogin({
      data: {username: uname, password: pw},
      showError: true,
      setLoading: setLoading,
      onError: error => setError(error),
      onSucccess: 
      async (response) => {
        await loadCurrentUser();
        if(callback) callback(response);
      }
    });
  }

  async function logout(callback?: BackendCallback) {
    setError(undefined);
    postLogout({
      showError: true,
      onSucccess: 
      async (response) => {
        await loadCurrentUser();
        if (callback) callback(response);
      }
    });
  }

  async function signup(data: IUserSignupData, callback?: BackendCallback) {
    setError(undefined);
    postSignup({
      data: data,
      showError: true,
      setLoading: setLoading,
      onError: error => setError(error),
      onSucccess:
      async (response) => {
        await loadCurrentUser();
        if (callback) callback(response);
      }
    });
  }

  useLayoutEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser])

  return (
    <AuthContext.Provider
      value={{ user, login, logout, signup, loading, error, setError }}
    >
      {children}
    </AuthContext.Provider>
  );
};