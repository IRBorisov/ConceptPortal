'use client';

import { useState } from 'react';

import { createColumnHelper, DataTable, type IConditionalStyle } from '@/components/data-table';
import { SearchBar } from '@/components/input';
import { type Styling } from '@/components/props';
import { cn } from '@/components/utils';
import { NoData } from '@/components/view';

import { describeConstituenta } from '../labels';
import { type Constituenta } from '../models/rsform';
import { matchConstituenta } from '../models/rsform-api';
import { CstMatchMode } from '../stores/cst-search';

import { BadgeConstituenta } from './badge-constituenta';

interface PickConstituentaProps extends Styling {
  id?: string;
  items: Constituenta[];
  value: Constituenta | null;
  onChange: (newValue: Constituenta) => void;

  rows?: number;

  initialFilter?: string;
  onBeginFilter?: (cst: Constituenta) => boolean;
  describeFunc?: (cst: Constituenta) => string;
  matchFunc?: (cst: Constituenta, filter: string) => boolean;
}

const columnHelper = createColumnHelper<Constituenta>();

export function PickConstituenta({
  id,
  items,
  value,
  initialFilter = '',
  rows = 4,
  describeFunc = describeConstituenta,
  matchFunc = (cst, filter) => matchConstituenta(cst, filter, CstMatchMode.ALL),
  onBeginFilter,
  onChange,
  className,
  ...restProps
}: PickConstituentaProps) {
  const [filterText, setFilterText] = useState(initialFilter);

  const initialData = onBeginFilter ? items.filter(onBeginFilter) : items;
  const filteredData = filterText === '' ? initialData : initialData.filter(cst => matchFunc(cst, filterText));

  const columns = [
    columnHelper.accessor('alias', {
      id: 'alias',
      size: 65,
      minSize: 65,
      maxSize: 65,
      cell: props => <BadgeConstituenta value={props.row.original} />
    }),
    columnHelper.accessor(cst => describeFunc(cst), {
      id: 'description',
      size: 1000,
      minSize: 1000
    })
  ];

  const conditionalRowStyles: IConditionalStyle<Constituenta>[] = [
    {
      when: (cst: Constituenta) => cst.id === value?.id,
      className: 'bg-selected'
    }
  ];

  return (
    <div className={cn('border', className)} {...restProps}>
      <SearchBar
        id={id ? `${id}__search` : undefined}
        className='bg-input border-b rounded-t-md'
        noBorder
        query={filterText}
        onChangeQuery={newValue => setFilterText(newValue)}
      />
      <DataTable
        id={id}
        rows={rows}
        contentHeight='1.3rem'
        dense
        noHeader
        noFooter
        className='text-sm select-none cc-scroll-y'
        data={filteredData}
        columns={columns}
        conditionalRowStyles={conditionalRowStyles}
        noDataComponent={
          <NoData className='min-h-24'>
            <p>Список конституент пуст</p>
            <p>Измените параметры фильтра</p>
          </NoData>
        }
        onRowClicked={onChange}
      />
    </div>
  );
}
