'use client';

import clsx from 'clsx';

import { SelectSingle } from '@/components/Input';
import { CProps } from '@/components/props';

import { useLabelUser } from '../backend/useLabelUser';
import { useUsers } from '../backend/useUsers';
import { UserID } from '../models/user';
import { matchUser } from '../models/userAPI';

interface SelectUserProps extends CProps.Styling {
  value?: UserID;
  onChange: (newValue: UserID) => void;
  filter?: (userID: UserID) => boolean;

  placeholder?: string;
  noBorder?: boolean;
}

function SelectUser({
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

  function filterLabel(option: { value: UserID | undefined; label: string }, inputValue: string) {
    const user = items.find(item => item.id === option.value);
    return !user ? false : matchUser(user, inputValue);
  }

  return (
    <SelectSingle
      className={clsx('text-ellipsis', className)}
      options={options}
      value={value ? { value: value, label: getUserLabel(value) } : null}
      onChange={data => {
        if (data?.value !== undefined) onChange(data.value);
      }}
      // @ts-expect-error: TODO: use type definitions from react-select in filter object
      filterOption={filterLabel}
      placeholder={placeholder}
      {...restProps}
    />
  );
}

export default SelectUser;
