'use client';

import clsx from 'clsx';
import { useEffect, useState } from 'react';

import DataTable, { createColumnHelper, IConditionalStyle } from '@/components/ui/DataTable';
import SearchBar from '@/components/ui/SearchBar';
import { CstMatchMode } from '@/models/miscellaneous';
import { IConstituenta } from '@/models/rsform';
import { matchConstituenta } from '@/models/rsformAPI';
import { APP_COLORS } from '@/styling/color';
import { prefixes } from '@/utils/constants';
import { describeConstituenta } from '@/utils/labels';

import BadgeConstituenta from '../info/BadgeConstituenta';
import { CProps } from '../props';
import NoData from '../ui/NoData';

interface PickConstituentaProps extends CProps.Styling {
  id?: string;
  prefixID: string;
  data?: IConstituenta[];
  rows?: number;

  initialFilter?: string;
  onBeginFilter?: (cst: IConstituenta) => boolean;
  describeFunc?: (cst: IConstituenta) => string;
  matchFunc?: (cst: IConstituenta, filter: string) => boolean;

  value?: IConstituenta;
  onSelectValue: (newValue: IConstituenta) => void;
}

const columnHelper = createColumnHelper<IConstituenta>();

function PickConstituenta({
  id,
  data,
  value,
  initialFilter = '',
  rows = 4,
  prefixID = prefixes.cst_list,
  describeFunc = describeConstituenta,
  matchFunc = (cst, filter) => matchConstituenta(cst, filter, CstMatchMode.ALL),
  onBeginFilter,
  onSelectValue,
  className,
  ...restProps
}: PickConstituentaProps) {
  const [filteredData, setFilteredData] = useState<IConstituenta[]>([]);
  const [filterText, setFilterText] = useState(initialFilter);

  useEffect(() => {
    if (!data) {
      setFilteredData([]);
    } else {
      const newData = onBeginFilter ? data.filter(onBeginFilter) : data;
      if (filterText) {
        setFilteredData(newData.filter(cst => matchFunc(cst, filterText)));
      } else {
        setFilteredData(newData);
      }
    }
  }, [data, filterText, matchFunc, onBeginFilter]);

  const columns = [
    columnHelper.accessor('alias', {
      id: 'alias',
      size: 65,
      minSize: 65,
      maxSize: 65,
      cell: props => <BadgeConstituenta value={props.row.original} prefixID={prefixID} />
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
        onRowClicked={onSelectValue}
      />
    </div>
  );
}

export default PickConstituenta;
