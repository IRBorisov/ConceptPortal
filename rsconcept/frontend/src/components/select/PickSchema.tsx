import { useLayoutEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

import DataTable, { createColumnHelper, IConditionalStyle } from '@/components/ui/DataTable';
import SearchBar from '@/components/ui/SearchBar';
import { useConceptOptions } from '@/context/ConceptOptionsContext';
import { ILibraryItem, LibraryItemID, LibraryItemType } from '@/models/library';
import { matchLibraryItem } from '@/models/libraryAPI';

import FlexColumn from '../ui/FlexColumn';

interface PickSchemaProps {
  id?: string;
  initialFilter?: string;
  rows?: number;

  items: ILibraryItem[];
  itemType: LibraryItemType;
  value?: LibraryItemID;
  baseFilter?: (target: ILibraryItem) => boolean;
  onSelectValue: (newValue: LibraryItemID) => void;
}

const columnHelper = createColumnHelper<ILibraryItem>();

function PickSchema({
  id,
  initialFilter = '',
  rows = 4,
  items,
  itemType,
  value,
  onSelectValue,
  baseFilter
}: PickSchemaProps) {
  const intl = useIntl();
  const { colors } = useConceptOptions();

  const [filterText, setFilterText] = useState(initialFilter);
  const [filtered, setFiltered] = useState<ILibraryItem[]>([]);
  const baseFiltered = useMemo(
    () => items.filter(item => item.item_type === itemType && (!baseFilter || baseFilter(item))),
    [items, itemType, baseFilter]
  );

  useLayoutEffect(() => {
    const newFiltered = baseFiltered.filter(item => matchLibraryItem(item, filterText));
    setFiltered(newFiltered);
  }, [filterText]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('alias', {
        id: 'alias',
        header: 'Шифр',
        size: 150,
        minSize: 80,
        maxSize: 150
      }),
      columnHelper.accessor('title', {
        id: 'title',
        header: 'Название',
        size: 1200,
        minSize: 200,
        maxSize: 1200,
        cell: props => <div className='text-ellipsis'>{props.getValue()}</div>
      }),
      columnHelper.accessor('time_update', {
        id: 'time_update',
        header: 'Дата',
        cell: props => (
          <div className='whitespace-nowrap'>
            {new Date(props.getValue()).toLocaleString(intl.locale, {
              year: '2-digit',
              month: '2-digit',
              day: '2-digit'
            })}
          </div>
        )
      })
    ],
    [intl]
  );

  const conditionalRowStyles = useMemo(
    (): IConditionalStyle<ILibraryItem>[] => [
      {
        when: (item: ILibraryItem) => item.id === value,
        style: { backgroundColor: colors.bgSelected }
      }
    ],
    [value, colors]
  );

  return (
    <div className='border divide-y'>
      <SearchBar
        id={id ? `${id}__search` : undefined}
        className='clr-input'
        noBorder
        value={filterText}
        onChange={newValue => setFilterText(newValue)}
      />
      <DataTable
        id={id}
        rows={rows}
        dense
        noHeader
        noFooter
        className='text-sm select-none cc-scroll-y'
        data={filtered}
        columns={columns}
        conditionalRowStyles={conditionalRowStyles}
        noDataComponent={
          <FlexColumn className='dense p-3 items-center min-h-[6rem]'>
            <p>Список схем пуст</p>
            <p>Измените параметры фильтра</p>
          </FlexColumn>
        }
        onRowClicked={rowData => onSelectValue(rowData.id)}
      />
    </div>
  );
}

export default PickSchema;
