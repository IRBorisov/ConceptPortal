'use client';

import clsx from 'clsx';

import { SelectSingle } from '@/components/Input';
import { CProps } from '@/components/props';

import { useLabelUser } from '../backend/useLabelUser';
import { useUsers } from '../backend/useUsers';
import { matchUser } from '../models/userAPI';

interface SelectUserProps extends CProps.Styling {
  value: number | null;
  onChange: (newValue: number) => void;
  filter?: (userID: number) => boolean;

  placeholder?: string;
  noBorder?: boolean;
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
  const options = items.map(user => ({
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
