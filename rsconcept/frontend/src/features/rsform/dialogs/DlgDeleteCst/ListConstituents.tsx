import clsx from 'clsx';

import { labelConstituenta } from '@/utils/labels';

import { ConstituentaID, IRSForm } from '../../models/rsform';

interface ListConstituentsProps {
  list: ConstituentaID[];
  schema: IRSForm;
  prefix: string;
  title?: string;
}

function ListConstituents({ list, schema, title, prefix }: ListConstituentsProps) {
  return (
    <div>
      {title ? (
        <p className='pb-1'>
          {title}: <b>{list.length}</b>
        </p>
      ) : null}
      <div className={clsx('h-[9rem]', 'px-3', 'cc-scroll-y', 'border', 'whitespace-nowrap')}>
        {list.map(id => {
          const cst = schema.cstByID.get(id);
          return cst ? <p key={`${prefix}${cst.id}`}>{labelConstituenta(cst)}</p> : null;
        })}
      </div>
    </div>
  );
}

export default ListConstituents;
