import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { getActiveUsers } from '../utils/backendAPI';
import { type IUserInfo } from '../utils/models';

interface IUsersContext {
  users: IUserInfo[]
  reload: () => void
  getUserLabel: (userID: number | null) => string
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

  function getUserLabel(userID: number | null) {
    const user = users.find(({ id }) => id === userID)
    if (!user) {
      return (userID ? userID.toString() : 'Отсутствует');
    }
    const hasFirstName = user.first_name !== '';
    const hasLastName = user.last_name !== '';
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
  () => {
    getActiveUsers({
      showError: true,
      onError: () => { setUsers([]); },
      onSuccess: newData => { setUsers(newData); }
    });
  }, [setUsers]);

  useEffect(() => {
    reload();
  }, [reload]);

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
