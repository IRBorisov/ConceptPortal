import clsx from 'clsx';

import { useLabelUser } from '@/backend/users/useLabelUser';
import { CProps } from '@/components/props';
import { UserID } from '@/models/user';

interface InfoUsersProps extends CProps.Styling {
  items: UserID[];
  prefix: string;
  header?: string;
}

function InfoUsers({ items, className, prefix, header, ...restProps }: InfoUsersProps) {
  const getUserLabel = useLabelUser();
  return (
    <div className={clsx('flex flex-col dense', className)} {...restProps}>
      {header ? <h2>{header}</h2> : null}
      {items.map((user, index) => (
        <div key={`${prefix}${index}`}>{getUserLabel(user)}</div>
      ))}
      {items.length === 0 ? <div className='text-center'>Пользователи не выбраны</div> : null}
    </div>
  );
}

export default InfoUsers;
