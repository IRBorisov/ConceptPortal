'use client';

import { type RSForm } from '@rsconcept/domain/library';
import { useTx } from '@/i18n';

import { labelConstituenta } from '../../labels';

interface ListConstituentsProps {
  list: number[];
  schema: RSForm;
  prefix: string;
  title?: string;
}

export function ListConstituents({ list, schema, title, prefix }: ListConstituentsProps) {
  const tx = useTx();
  const titleText = title ? `${title}${tx('tx.general.colon')}` : '';
  return (
    <div>
      {title ? (
        <p className='mb-1'>
          {titleText}
          <b>{list.length}</b>
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
