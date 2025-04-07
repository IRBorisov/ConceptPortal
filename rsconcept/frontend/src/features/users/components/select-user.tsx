'use client';

import clsx from 'clsx';

import { SelectSingle } from '@/components/input';
import { type Styling } from '@/components/props';

import { type IUserInfo } from '../backend/types';
import { useLabelUser } from '../backend/use-label-user';
import { useUsers } from '../backend/use-users';
import { matchUser } from '../models/user-api';

interface SelectUserProps extends Styling {
  value: number | null;
  onChange: (newValue: number) => void;
  filter?: (userID: number) => boolean;

  placeholder?: string;
  noBorder?: boolean;
}

function compareUsers(a: IUserInfo, b: IUserInfo) {
  if (!a.last_name && !!b.last_name) {
    return 1;
  } else if (!!a.last_name && !b.last_name) {
    return -1;
  } else if (a.last_name !== b.last_name) {
    return a.last_name.localeCompare(b.last_name);
  } else if (a.first_name !== b.first_name) {
    return a.first_name.localeCompare(b.first_name);
  }
  return a.id - b.id;
}

export function SelectUser({
  className,
  filter,
  value,
  onChange,
  placeholder = 'Выберите пользователя',
  ...restProps
}: SelectUserProps) {
  const { users } = useUsers();
  const getUserLabel = useLabelUser();

  const items = filter ? users.filter(user => filter(user.id)) : users;
  const sorted = [
    ...items.filter(user => !!user.first_name || !!user.last_name).sort(compareUsers),
    ...items.filter(user => !user.first_name && !user.last_name)
  ];
  const options = sorted.map(user => ({
    value: user.id,
    label: getUserLabel(user.id)
  }));

  function filterLabel(option: { value: string | undefined; label: string }, query: string) {
    const user = items.find(item => item.id === Number(option.value));
    return !user ? false : matchUser(user, query);
  }

  return (
    <SelectSingle
      className={clsx('text-ellipsis', className)}
      options={options}
      value={value ? { value: value, label: getUserLabel(value) } : null}
      onChange={data => {
        if (data?.value !== undefined) onChange(data.value);
      }}
      filterOption={filterLabel}
      placeholder={placeholder}
      {...restProps}
    />
  );
}
