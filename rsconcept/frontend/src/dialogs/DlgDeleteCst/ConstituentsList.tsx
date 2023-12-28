import clsx from 'clsx';

import { IConstituenta } from '@/models/rsform';
import { labelConstituenta } from '@/utils/labels';

interface ConstituentsListProps {
  list: number[];
  items: IConstituenta[];
  prefix: string;
  title?: string;
}

function ConstituentsList({ list, items, title, prefix }: ConstituentsListProps) {
  return (
    <div>
      {title ? (
        <p className='pb-1'>
          {title}: <b>{list.length}</b>
        </p>
      ) : null}
      <div className={clsx('h-[9rem]', 'px-3', 'overflow-y-auto', 'border', 'whitespace-nowrap')}>
        {list.map(id => {
          const cst = items.find(cst => cst.id === id);
          return cst ? <p key={`${prefix}${cst.id}`}>{labelConstituenta(cst)}</p> : null;
        })}
      </div>
    </div>
  );
}

export default ConstituentsList;
