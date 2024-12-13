'use client';

import clsx from 'clsx';

import { useUsers } from '@/context/UsersContext';
import { IUserInfo, UserID } from '@/models/user';
import { matchUser } from '@/models/userAPI';

import { CProps } from '../props';
import SelectSingle from '../ui/SelectSingle';

interface SelectUserProps extends CProps.Styling {
  items?: IUserInfo[];
  value?: UserID;
  onSelectValue: (newValue: UserID) => void;

  placeholder?: string;
  noBorder?: boolean;
}

function SelectUser({
  className,
  items,
  value,
  onSelectValue,
  placeholder = 'Выберите пользователя',
  ...restProps
}: SelectUserProps) {
  const { getUserLabel } = useUsers();
  const options =
    items?.map(user => ({
      value: user.id,
      label: getUserLabel(user.id)
    })) ?? [];

  function filter(option: { value: UserID | undefined; label: string }, inputValue: string) {
    const user = items?.find(item => item.id === option.value);
    return !user ? false : matchUser(user, inputValue);
  }

  return (
    <SelectSingle
      className={clsx('text-ellipsis', className)}
      options={options}
      value={value ? { value: value, label: getUserLabel(value) } : null}
      onChange={data => {
        if (data?.value !== undefined) onSelectValue(data.value);
      }}
      // @ts-expect-error: TODO: use type definitions from react-select in filter object
      filterOption={filter}
      placeholder={placeholder}
      {...restProps}
    />
  );
}

export default SelectUser;
