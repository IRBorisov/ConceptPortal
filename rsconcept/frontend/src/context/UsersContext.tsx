import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { IUserInfo } from '../utils/models'
import { getActiveUsers } from '../utils/backendAPI'


interface IUsersContext {
  users: IUserInfo[]
  reload: () => Promise<void>
  getUserLabel: (userID?: number) => string
}

const UsersContext = createContext<IUsersContext | null>(null);
export const useUsers = () => {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error(
      'useUsers has to be used within <UsersState.Provider>'
    );
  }
  return context;
}

interface UsersStateProps {
  children: React.ReactNode
}

export const UsersState = ({ children }: UsersStateProps) => {
  const [users, setUsers] = useState<IUserInfo[]>([]);

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
      getActiveUsers({
        showError: true,
        onError: error => setUsers([]),
        onSucccess: response => {
          setUsers(response ? response.data : []);
        }
      });
    }, [setUsers]
  );

  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <UsersContext.Provider value={{
      users,
      reload, getUserLabel
    }}>
      { children }
    </UsersContext.Provider>
    );
}