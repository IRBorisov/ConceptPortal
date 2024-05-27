import clsx from 'clsx';

import { useUsers } from '@/context/UsersContext';
import { UserID } from '@/models/user';

import { CProps } from '../props';

interface InfoUsersProps extends CProps.Styling {
  items: UserID[];
  prefix: string;
}

function InfoUsers({ items, className, prefix, ...restProps }: InfoUsersProps) {
  const { getUserLabel } = useUsers();

  return (
    <div className={clsx('flex flex-col dense', className)} {...restProps}>
      {items.map((user, index) => (
        <div key={`${prefix}${index}`}>{getUserLabel(user)}</div>
      ))}
    </div>
  );
}

export default InfoUsers;
