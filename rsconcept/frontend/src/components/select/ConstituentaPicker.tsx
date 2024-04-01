'use client';

import { useEffect, useMemo, useState } from 'react';

import DataTable, { createColumnHelper, IConditionalStyle } from '@/components/ui/DataTable';
import SearchBar from '@/components/ui/SearchBar';
import { useConceptOptions } from '@/context/OptionsContext';
import { CstMatchMode } from '@/models/miscellaneous';
import { IConstituenta } from '@/models/rsform';
import { matchConstituenta } from '@/models/rsformAPI';
import { prefixes } from '@/utils/constants';
import { describeConstituenta } from '@/utils/labels';

import ConstituentaBadge from '../info/ConstituentaBadge';
import FlexColumn from '../ui/FlexColumn';

interface ConstituentaPickerProps {
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

function ConstituentaPicker({
  id,
  data,
  value,
  initialFilter = '',
  rows = 4,
  prefixID = prefixes.cst_list,
  describeFunc = describeConstituenta,
  matchFunc = (cst, filter) => matchConstituenta(cst, filter, CstMatchMode.ALL),
  onBeginFilter,
  onSelectValue
}: ConstituentaPickerProps) {
  const { colors } = useConceptOptions();
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

  const columns = useMemo(
    () => [
      columnHelper.accessor('alias', {
        id: 'alias',
        size: 65,
        minSize: 65,
        maxSize: 65,
        cell: props => <ConstituentaBadge theme={colors} value={props.row.original} prefixID={prefixID} />
      }),
      columnHelper.accessor(cst => describeFunc(cst), {
        id: 'description'
      })
    ],
    [colors, prefixID, describeFunc]
  );

  const conditionalRowStyles = useMemo(
    (): IConditionalStyle<IConstituenta>[] => [
      {
        when: (cst: IConstituenta) => cst.id === value?.id,
        style: { backgroundColor: colors.bgSelected }
      }
    ],
    [value, colors]
  );

  return (
    <div className='border divide-y'>
      <SearchBar
        id={id ? `${id}__search` : undefined}
        noBorder
        value={filterText}
        onChange={newValue => setFilterText(newValue)}
      />
      <DataTable
        id={id}
        rows={rows}
        contentHeight='1.3rem'
        dense
        noHeader
        noFooter
        className='overflow-y-auto text-sm select-none'
        data={filteredData}
        columns={columns}
        conditionalRowStyles={conditionalRowStyles}
        noDataComponent={
          <FlexColumn className='p-3 items-center min-h-[6rem]'>
            <p>Список конституент пуст</p>
            <p>Измените параметры фильтра</p>
          </FlexColumn>
        }
        onRowClicked={onSelectValue}
      />
    </div>
  );
}

export default ConstituentaPicker;
