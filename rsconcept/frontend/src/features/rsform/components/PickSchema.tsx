import clsx from 'clsx';
import { useState } from 'react';
import { useIntl } from 'react-intl';

import { FlexColumn } from '@/components/Container';
import { MiniButton } from '@/components/Control';
import DataTable, { createColumnHelper, IConditionalStyle } from '@/components/DataTable';
import { Dropdown, useDropdown } from '@/components/Dropdown';
import { IconClose, IconFolderTree } from '@/components/Icons';
import { CProps } from '@/components/props';
import { SearchBar } from '@/components/shared/SearchBar';
import { ILibraryItem, LibraryItemID, LibraryItemType } from '@/features/library/models/library';
import { matchLibraryItem } from '@/features/library/models/libraryAPI';
import { APP_COLORS } from '@/styling/colors';
import { prefixes } from '@/utils/constants';

import SelectLocation from '../../library/components/SelectLocation';

interface PickSchemaProps extends CProps.Styling {
  id?: string;
  value: LibraryItemID | null;
  onChange: (newValue: LibraryItemID) => void;

  initialFilter?: string;
  rows?: number;

  items: ILibraryItem[];
  itemType: LibraryItemType;
  baseFilter?: (target: ILibraryItem) => boolean;
}

const columnHelper = createColumnHelper<ILibraryItem>();

export function PickSchema({
  id,
  initialFilter = '',
  rows = 4,
  items,
  itemType,
  value,
  onChange,
  baseFilter,
  className,
  ...restProps
}: PickSchemaProps) {
  const intl = useIntl();
  const locationMenu = useDropdown();

  const [filterText, setFilterText] = useState(initialFilter);
  const [filterLocation, setFilterLocation] = useState('');

  const baseFiltered = items
    .filter(item => item.item_type === itemType && (!baseFilter || baseFilter(item)))
    .filter(item => matchLibraryItem(item, filterText));
  const filtered =
    filterLocation.length > 0
      ? baseFiltered.filter(item => item.location === filterLocation || item.location.startsWith(`${filterLocation}/`))
      : baseFiltered;

  const columns = [
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
  ];

  const conditionalRowStyles: IConditionalStyle<ILibraryItem>[] = [
    {
      when: (item: ILibraryItem) => item.id === value,
      style: { backgroundColor: APP_COLORS.bgSelected }
    }
  ];

  function handleLocationClick(event: CProps.EventMouse, newValue: string) {
    event.preventDefault();
    event.stopPropagation();
    locationMenu.hide();
    setFilterLocation(newValue);
  }

  return (
    <div className={clsx('border divide-y', className)} {...restProps}>
      <div className='flex justify-between clr-input items-center pr-1 rounded-t-md'>
        <SearchBar
          id={id ? `${id}__search` : undefined}
          className='clr-input flex-grow rounded-t-md'
          noBorder
          query={filterText}
          onChangeQuery={newValue => setFilterText(newValue)}
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
        onRowClicked={rowData => onChange(rowData.id)}
      />
    </div>
  );
}
