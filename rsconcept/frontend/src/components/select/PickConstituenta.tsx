'use client';

import clsx from 'clsx';
import { useState } from 'react';

import BadgeConstituenta from '@/components/info/BadgeConstituenta';
import { CProps } from '@/components/props';
import DataTable, { createColumnHelper, IConditionalStyle } from '@/components/ui/DataTable';
import NoData from '@/components/ui/NoData';
import SearchBar from '@/components/ui/SearchBar';
import { CstMatchMode } from '@/models/miscellaneous';
import { IConstituenta } from '@/models/rsform';
import { matchConstituenta } from '@/models/rsformAPI';
import { APP_COLORS } from '@/styling/color';
import { describeConstituenta } from '@/utils/labels';

interface PickConstituentaProps extends CProps.Styling {
  id?: string;
  items: IConstituenta[];
  value?: IConstituenta;
  onChange: (newValue: IConstituenta) => void;

  rows?: number;

  initialFilter?: string;
  onBeginFilter?: (cst: IConstituenta) => boolean;
  describeFunc?: (cst: IConstituenta) => string;
  matchFunc?: (cst: IConstituenta, filter: string) => boolean;
}

const columnHelper = createColumnHelper<IConstituenta>();

function PickConstituenta({
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

  const conditionalRowStyles: IConditionalStyle<IConstituenta>[] = [
    {
      when: (cst: IConstituenta) => cst.id === value?.id,
      style: { backgroundColor: APP_COLORS.bgSelected }
    }
  ];

  return (
    <div className={clsx('border divide-y', className)} {...restProps}>
      <SearchBar
        id={id ? `${id}__search` : undefined}
        className='clr-input rounded-t-md'
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
          <NoData className='min-h-[6rem]'>
            <p>Список конституент пуст</p>
            <p>Измените параметры фильтра</p>
          </NoData>
        }
        onRowClicked={onChange}
      />
    </div>
  );
}

export default PickConstituenta;
