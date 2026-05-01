'use client';

import { useState } from 'react';

import { type Constituenta } from '@/domain/library';
import { matchConstituenta } from '@/domain/library/rsform-api';
import { useTx } from '@/i18n/use-tx';

import { createColumnHelper, DataTable, type IConditionalStyle } from '@/components/data-table';
import { SearchBar } from '@/components/input';
import { type Styling } from '@/components/props';
import { cn } from '@/components/utils';
import { NoData } from '@/components/view';

import { describeConstituenta } from '../labels';

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
  matchFunc = (cst, filter) => matchConstituenta(cst, filter),
  onBeginFilter,
  onChange,
  className,
  ...restProps
}: PickConstituentaProps) {
  const tx = useTx();
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
            <p>{tx('ui.table.cstSide.emptyTitle', 'No constituents in the list')}</p>
            <p>{tx('ui.table.cstSide.emptyHint', 'Change the filter or create a constituenta')}</p>
          </NoData>
        }
        onRowClicked={onChange}
      />
    </div>
  );
}
