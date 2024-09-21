import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

import DataTable, { createColumnHelper, IConditionalStyle } from '@/components/ui/DataTable';
import SearchBar from '@/components/ui/SearchBar';
import { useConceptOptions } from '@/context/ConceptOptionsContext';
import { useLibrary } from '@/context/LibraryContext';
import useDropdown from '@/hooks/useDropdown';
import { ILibraryItem, LibraryItemID, LibraryItemType } from '@/models/library';
import { matchLibraryItem } from '@/models/libraryAPI';
import { prefixes } from '@/utils/constants';

import { IconClose, IconFolderTree } from '../Icons';
import { CProps } from '../props';
import Dropdown from '../ui/Dropdown';
import FlexColumn from '../ui/FlexColumn';
import MiniButton from '../ui/MiniButton';
import SelectLocation from './SelectLocation';

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
  const { folders } = useLibrary();

  const [filterText, setFilterText] = useState(initialFilter);
  const [filterLocation, setFilterLocation] = useState('');
  const [filtered, setFiltered] = useState<ILibraryItem[]>([]);
  const baseFiltered = useMemo(
    () => items.filter(item => item.item_type === itemType && (!baseFilter || baseFilter(item))),
    [items, itemType, baseFilter]
  );

  const locationMenu = useDropdown();

  useLayoutEffect(() => {
    let newFiltered = baseFiltered.filter(item => matchLibraryItem(item, filterText));
    if (filterLocation.length > 0) {
      newFiltered = newFiltered.filter(
        item => item.location === filterLocation || item.location.startsWith(`${filterLocation}/`)
      );
    }
    setFiltered(newFiltered);
  }, [filterText, filterLocation]);

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

  const handleLocationClick = useCallback(
    (event: CProps.EventMouse, newValue: string) => {
      event.preventDefault();
      event.stopPropagation();
      locationMenu.hide();
      setFilterLocation(newValue);
    },
    [locationMenu]
  );

  return (
    <div className='border divide-y'>
      <div className='flex justify-between clr-input items-center pr-1'>
        <SearchBar
          id={id ? `${id}__search` : undefined}
          className='clr-input flex-grow'
          noBorder
          value={filterText}
          onChange={newValue => setFilterText(newValue)}
        />
        <div ref={locationMenu.ref}>
          <MiniButton
            icon={<IconFolderTree size='1.25rem' className={!!filterLocation ? 'icon-green' : 'icon-primary'} />}
            title='Фильтр по расположению'
            className='mt-1'
            onClick={() => locationMenu.toggle()}
          />
          <Dropdown isOpen={locationMenu.isOpen} stretchLeft className='w-[20rem] h-[12.5rem] z-modalTooltip mt-0'>
            <SelectLocation
              folderTree={folders}
              value={filterLocation}
              prefix={prefixes.folders_list}
              dense
              onClick={(event, target) => handleLocationClick(event, target.getPath())}
            />
          </Dropdown>
        </div>
        {filterLocation.length > 0 ? (
          <MiniButton
            icon={<IconClose size='1.25rem' className='icon-red' />}
            title='Сбросить фильтр'
            onClick={() => setFilterLocation('')}
          />
        ) : null}
      </div>
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
