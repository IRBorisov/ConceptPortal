import { labelConstituenta } from '../../labels';
import { type IRSForm } from '../../models/rsform';

interface ListConstituentsProps {
  list: number[];
  schema: IRSForm;
  prefix: string;
  title?: string;
}

export function ListConstituents({ list, schema, title, prefix }: ListConstituentsProps) {
  return (
    <div>
      {title ? (
        <p className='pb-1'>
          {title}: <b>{list.length}</b>
        </p>
      ) : null}
      <div className='h-36 px-3 cc-scroll-y border whitespace-nowrap'>
        {list.map(id => {
          const cst = schema.cstByID.get(id);
          return cst ? <p key={`${prefix}${cst.id}`}>{labelConstituenta(cst)}</p> : null;
        })}
      </div>
    </div>
  );
}
