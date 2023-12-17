import { useEffect, useMemo, useState } from 'react';

import ConceptSearch from '@/components/Common/ConceptSearch';
import DataTable, { createColumnHelper, IConditionalStyle } from '@/components/DataTable';
import { useConceptTheme } from '@/context/ThemeContext';
import { CstMatchMode } from '@/models/miscelanious';
import { IConstituenta } from '@/models/rsform';
import { matchConstituenta } from '@/models/rsformAPI';
import { prefixes } from '@/utils/constants';
import { describeConstituenta } from '@/utils/labels';

import ConstituentaBadge from './ConstituentaBadge';

interface ConstituentaPickerProps {
  prefixID?: string
  data?: IConstituenta[]
  rows?: number
  
  prefilterFunc?: (cst: IConstituenta) => boolean
  describeFunc?: (cst: IConstituenta) => string
  matchFunc?: (cst: IConstituenta, filter: string) => boolean
  
  value?: IConstituenta
  onSelectValue: (newValue: IConstituenta) => void
}

const columnHelper = createColumnHelper<IConstituenta>();

function ConstituentaPicker({
  data, value,
  rows = 4,
  prefixID = prefixes.cst_list,
  describeFunc = describeConstituenta,
  matchFunc = (cst, filter) => matchConstituenta(cst, filter, CstMatchMode.ALL),
  prefilterFunc,
  onSelectValue
} : ConstituentaPickerProps) {
  const { colors } = useConceptTheme();
  const [filteredData, setFilteredData] = useState<IConstituenta[]>([]);
  const [filterText, setFilterText] = useState('');

  useEffect(
  () => {
    if (!data) {
      setFilteredData([]);
    } else {
      const newData = prefilterFunc ? data.filter(prefilterFunc) : data;
      if (filterText) {
        setFilteredData(newData.filter(cst => matchFunc(cst, filterText)));
      } else {
        setFilteredData(newData);
      }
    }
    
  }, [data, filterText, matchFunc, prefilterFunc]);

  const columns = useMemo(
  () => [
    columnHelper.accessor('alias', {
      id: 'alias',
      size: 65,
      minSize: 65,
      maxSize: 65,
      cell: props =>
        <ConstituentaBadge 
          theme={colors}
          value={props.row.original}
          prefixID={prefixID}
        />
    }),
    columnHelper.accessor(cst => describeFunc(cst), {
      id: 'description'
    })
  ], [colors, prefixID, describeFunc]);

  const size = useMemo(() => (`calc(2px + (2px + 1.8rem)*${rows})`), [rows]);

  const conditionalRowStyles = useMemo(
  (): IConditionalStyle<IConstituenta>[] => [{
    when: (cst: IConstituenta) => cst.id === value?.id,
    style: { backgroundColor: colors.bgSelected },
  }], [value, colors]);

  return (
  <div>
    <ConceptSearch
      value={filterText}
      onChange={newValue => setFilterText(newValue)}
    />
    <DataTable dense noHeader noFooter
      className='overflow-y-auto text-sm border select-none' 
      style={{ maxHeight: size, minHeight: size }}
      data={filteredData}
      columns={columns}
      conditionalRowStyles={conditionalRowStyles}
      noDataComponent={
        <span className='p-2 min-h-[5rem] flex flex-col justify-center text-center'>
          <p>Список конституент пуст</p>
          <p>Измените параметры фильтра</p>
        </span>
      }
      onRowClicked={onSelectValue}
    />
  </div>);
}

export default ConstituentaPicker;