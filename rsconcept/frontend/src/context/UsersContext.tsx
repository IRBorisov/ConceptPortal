import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { getActiveUsers } from '../utils/backendAPI';
import { type IUserInfo } from '../utils/models';

interface IUsersContext {
  users: IUserInfo[]
  reload: () => Promise<void>
  getUserLabel: (userID?: number) => string
}

const UsersContext = createContext<IUsersContext | null>(null)
export const useUsers = (): IUsersContext => {
  const context = useContext(UsersContext);
  if (context == null) {
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
  const [users, setUsers] = useState<IUserInfo[]>([])

  const getUserLabel = (userID?: number) => {
    const user = users.find(({ id }) => id === userID)
    if (user == null) {
      return (userID ? userID.toString() : 'Отсутствует');
    }
    const hasFirstName = user.first_name != null && user.first_name !== '';
    const hasLastName = user.last_name != null && user.last_name !== '';
    if (hasFirstName || hasLastName) {
      if (!hasLastName) {
        return user.first_name;
      }
      if (!hasFirstName) {
        return user.last_name;
      }
      return user.first_name + ' ' + user.last_name;
    }
    return user.username;
  }

  const reload = useCallback(
    async () => {
      await getActiveUsers({
        showError: true,
        onError: () => { setUsers([]); },
        onSuccess: response => { setUsers(response.data); }
      });
    }, [setUsers]
  )

  useEffect(() => {
    reload().catch(console.error);
  }, [reload])

  return (
    <UsersContext.Provider value={{
      users,
      reload,
      getUserLabel
    }}>
      { children }
    </UsersContext.Provider>
  );
}
