import clsx from 'clsx';

import { type Styling } from '@/components/props';

import { useLabelUser } from '../backend/useLabelUser';

interface InfoUsersProps extends Styling {
  items: number[];
  prefix: string;
  header?: string;
}

export function InfoUsers({ items, className, prefix, header, ...restProps }: InfoUsersProps) {
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
