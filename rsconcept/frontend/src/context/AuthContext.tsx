import axios from 'axios';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { config } from '../constants';
import { ICurrentUser, IUserSignupData } from '../models';
import { ErrorInfo } from '../components/BackendError';
import useLocalStorage from '../hooks/useLocalStorage';


interface IAuthContext {
  user: ICurrentUser | undefined
  login: (username: string, password: string, onSuccess?: Function) => void
  logout: (onSuccess?: Function) => void
  signup: (data: IUserSignupData, onSuccess?: Function) => void
  loading: boolean
  error: ErrorInfo
  setError: (error: ErrorInfo) => void
}

export const AuthContext = createContext<IAuthContext>({
  user: undefined,
  login: () => {},
  logout: () => {},
  signup: () => {},
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
      setError(undefined);
      setLoading(true);
      console.log('Current user requested');
      axios.get<ICurrentUser>(`${config.url.AUTH}auth`)
      .then(function (response) {
        setLoading(false);
        if (response.data.id) {
          setUser(response.data);
        } else {
          setUser(undefined)
        }
      })
      .catch(function (error) {
        setLoading(false);
        setUser(undefined);
        setError(error);
      });
    }, [setUser]
  );
  
  async function login(uname: string, pw: string, onSuccess?: Function) {
    setLoading(true);
    setError(undefined);
    axios.post(`${config.url.AUTH}login`, {username: uname, password: pw})
    .then(function (response) {
      setLoading(false);
      loadCurrentUser();
      if(onSuccess) {
        onSuccess();
      }
    })
    .catch(function (error) {
      setLoading(false);
      setError(error);
    });
  }

  async function logout(onSuccess?: Function) {
    setLoading(true);
    setError(undefined);
    axios.post(`${config.url.AUTH}logout`)
    .then(function (response) {
      setLoading(false);
      loadCurrentUser();
      if(onSuccess) {
        onSuccess();
      }
    })
    .catch(function (error) {
      setLoading(false);
      setError(error);
    });
  }

  async function signup(data: IUserSignupData, onSuccess?: Function) {
    setLoading(true);
    setError(undefined);
    axios.post(`${config.url.AUTH}signup`, data)
    .then(function (response) {
      setLoading(false);
      loadCurrentUser();
      if(onSuccess) {
        onSuccess();
      }
    })
    .catch(function (error) {
      setLoading(false);
      setError(error);
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