import clsx from 'clsx';

import { IRSForm } from '@/models/rsform';
import { labelConstituenta } from '@/utils/labels';

interface ConstituentsListProps {
  list: number[];
  schema: IRSForm;
  prefix: string;
  title?: string;
}

function ConstituentsList({ list, schema, title, prefix }: ConstituentsListProps) {
  return (
    <div>
      {title ? (
        <p className='pb-1'>
          {title}: <b>{list.length}</b>
        </p>
      ) : null}
      <div className={clsx('h-[9rem]', 'px-3', 'overflow-y-auto', 'border', 'whitespace-nowrap')}>
        {list.map(id => {
          const cst = schema.cstByID.get(id);
          return cst ? <p key={`${prefix}${cst.id}`}>{labelConstituenta(cst)}</p> : null;
        })}
      </div>
    </div>
  );
}

export default ConstituentsList;
