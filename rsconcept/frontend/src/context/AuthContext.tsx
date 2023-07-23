import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { ICurrentUser, IUserSignupData } from '../utils/models';
import { ErrorInfo } from '../components/BackendError';
import useLocalStorage from '../hooks/useLocalStorage';
import { getAuth, postLogin, postLogout, postSignup } from '../utils/backendAPI';


interface IAuthContext {
  user: ICurrentUser | undefined
  login: (username: string, password: string) => Promise<void>
  logout: (onSuccess?: () => void) => Promise<void>
  signup: (data: IUserSignupData) => Promise<void>
  loading: boolean
  error: ErrorInfo
  setError: (error: ErrorInfo) => void
}

export const AuthContext = createContext<IAuthContext>({
  user: undefined,
  login: async () => {},
  logout: async () => {},
  signup: async () => {},
  loading: false,
  error: '',
  setError: () => {}
});

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
  
  async function login(uname: string, pw: string, onSuccess?: () => void) {
    setError(undefined);
    postLogin({
      data: {username: uname, password: pw},
      showError: true,
      setLoading: setLoading,
      onError: error => setError(error),
      onSucccess: response => {
        loadCurrentUser();
        if(onSuccess) onSuccess();
      }
    });
  }

  async function logout() {
    setError(undefined);
    postLogout({
      showError: true,
      onSucccess: response => {
        loadCurrentUser();
      }
    });
  }

  async function signup(data: IUserSignupData) {
    setError(undefined);
    postSignup({
      data: data,
      showError: true,
      setLoading: setLoading,
      onError: error => setError(error),
      onSucccess: response => {
        loadCurrentUser();
      }
    });
  }

  useEffect(() => {
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

export const useAuth = () => useContext(AuthContext);