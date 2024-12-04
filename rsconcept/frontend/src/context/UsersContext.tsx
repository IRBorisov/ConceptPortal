'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { getActiveUsers } from '@/backend/users';
import { IUserInfo } from '@/models/user';
import { contextOutsideScope } from '@/utils/labels';

interface IUsersContext {
  users: IUserInfo[];
  reload: (callback?: () => void) => void;
  getUserLabel: (userID: number | null) => string;
}

const UsersContext = createContext<IUsersContext | null>(null);
export const useUsers = (): IUsersContext => {
  const context = useContext(UsersContext);
  if (context === null) {
    throw new Error(contextOutsideScope('useUsers', 'UsersState'));
  }
  return context;
};

export const UsersState = ({ children }: React.PropsWithChildren) => {
  const [users, setUsers] = useState<IUserInfo[]>([]);

  function getUserLabel(userID: number | null) {
    const user = users.find(({ id }) => id === userID);
    if (!user) {
      return userID ? userID.toString() : 'Отсутствует';
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
      return user.last_name + ' ' + user.first_name;
    }
    return `Аноним ${userID}`;
  }

  const reload = useCallback(
    (callback?: () => void) => {
      getActiveUsers({
        showError: true,
        onError: () => setUsers([]),
        onSuccess: newData => {
          newData.sort((a, b) => {
            if (a.last_name === '') {
              if (b.last_name === '') {
                return a.id - b.id;
              } else {
                return 1;
              }
            } else if (b.last_name === '') {
              if (a.last_name === '') {
                return a.id - b.id;
              } else {
                return -1;
              }
            } else if (a.last_name !== b.last_name) {
              return a.last_name.localeCompare(b.last_name);
            } else {
              return a.first_name.localeCompare(b.first_name);
            }
          });
          setUsers(newData);
          callback?.();
        }
      });
    },
    [setUsers]
  );

  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <UsersContext.Provider
      value={{
        users,
        reload,
        getUserLabel
      }}
    >
      {children}
    </UsersContext.Provider>
  );
};
