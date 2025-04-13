'use client';

import { ComboBox } from '@/components/input/combo-box';
import { type Styling } from '@/components/props';

import { type IUserInfo } from '../backend/types';
import { useLabelUser } from '../backend/use-label-user';
import { useUsers } from '../backend/use-users';

interface SelectUserProps extends Styling {
  value: number | null;
  onChange: (newValue: number | null) => void;
  filter?: (userID: number) => boolean;

  placeholder?: string;
  noBorder?: boolean;
  noAnonymous?: boolean;
  hidden?: boolean;
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
  filter,
  noAnonymous,
  placeholder = 'Выберите пользователя',
  ...restProps
}: SelectUserProps) {
  const { users } = useUsers();
  const getUserLabel = useLabelUser();

  const items = filter ? users.filter(user => filter(user.id)) : users;
  const sorted = [
    ...items.filter(user => !!user.first_name || !!user.last_name).sort(compareUsers),
    ...(!noAnonymous ? items.filter(user => !user.first_name && !user.last_name) : [])
  ].map(user => user.id);

  return (
    <ComboBox
      items={sorted}
      placeholder={placeholder}
      idFunc={user => String(user)}
      labelValueFunc={user => getUserLabel(user)}
      labelOptionFunc={user => getUserLabel(user)}
      {...restProps}
    />
  );
}
