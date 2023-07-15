import axios from 'axios'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { IUserInfo } from '../models'
import { config } from '../constants'
import { ErrorInfo } from '../components/BackendError'


interface IUsersContext {
  users: IUserInfo[]
  error: ErrorInfo
  loading: boolean
  reload: () => void
  getUserLabel: (userID?: number) => string
}

export const UsersContext = createContext<IUsersContext>({
  users: [],
  error: undefined,
  loading: false,
  reload: () => {},
  getUserLabel: () => ''
})

interface UsersStateProps {
  children: React.ReactNode
}

export const UsersState = ({ children }: UsersStateProps) => {
  const [users, setUsers] = useState<IUserInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorInfo>(undefined);

  const getUserLabel = (userID?: number) => {
    const user = users.find(({id}) => id === userID);
    if (!user) {
      return (userID ? userID.toString() : 'Отсутствует');
    }
    if (user.first_name || user.last_name) {
      if (!user.last_name) {
        return user.first_name;
      }
      if (!user.first_name) {
        return user.last_name;
      }
      return user.first_name + ' ' + user.last_name
    }
    return user.username;
  } 
  
  const reload = useCallback(
    async () => {
      setError(undefined);
      setLoading(true);
      console.log('Profile requested');
      axios.get<IUserInfo[]>(`${config.url.AUTH}active-users`)
      .then(function (response) {
        setLoading(false);
        setUsers(response.data);
      })
      .catch(function (error) {
        setLoading(false);
        setUsers([]);
        setError(error);
      });
    }, [setUsers]
  );

  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <UsersContext.Provider value={{
      users,
      error, loading,
      reload, getUserLabel
    }}>
      { children }
    </UsersContext.Provider>
    );
}

export const useUsers = () => useContext(UsersContext);