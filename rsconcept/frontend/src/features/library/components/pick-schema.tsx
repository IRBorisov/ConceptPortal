'use client';

import { useState } from 'react';
import { useIntl } from 'react-intl';

import { MiniButton } from '@/components/control';
import { createColumnHelper, DataTable, type IConditionalStyle } from '@/components/data-table';
import { Dropdown, useDropdown } from '@/components/dropdown';
import { IconClose, IconFolderTree } from '@/components/icons';
import { ErrorField, SearchBar } from '@/components/input';
import { type ErrorProcessing, type Styling } from '@/components/props';
import { cn } from '@/components/utils';
import { prefixes } from '@/utils/constants';
import { type RO } from '@/utils/meta';

import { type LibraryItem, type LibraryItemType } from '../backend/types';
import { matchLibraryItem } from '../models/library-api';

import { SelectLocation } from './select-location';

interface PickSchemaProps extends Styling, ErrorProcessing {
  id?: string;
  value: number | null;
  onChange: (newValue: number) => void;

  initialFilter?: string;
  rows?: number;

  items: RO<LibraryItem[]>;
  itemType: LibraryItemType;
  baseFilter?: (target: LibraryItem) => boolean;
}

const columnHelper = createColumnHelper<LibraryItem>();

export function PickSchema({
  id,
  initialFilter = '',
  rows = 4,
  items,
  itemType,
  value,
  error,
  onChange,
  baseFilter,
  className,
  ...restProps
}: PickSchemaProps) {
  const intl = useIntl();
  const {
    elementRef: locationRef,
    isOpen: isLocationOpen,
    toggle: toggleLocation,
    handleBlur: handleLocationBlur,
    hide: hideLocationMenu
  } = useDropdown();

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
      header: 'Сокращение',
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

  const conditionalRowStyles: IConditionalStyle<LibraryItem>[] = [
    {
      when: (item: LibraryItem) => item.id === value,
      className: 'bg-selected'
    }
  ];

  function handleLocationClick(newValue: string) {
    hideLocationMenu();
    setFilterLocation(newValue);
  }

  return (
    <div className={cn('border divide-y relative', className)} {...restProps}>
      <ErrorField className='absolute -top-7 right-0 border-0' error={error} />
      <div className='flex justify-between bg-input items-center pr-1 rounded-t-md'>
        <SearchBar
          id={id ? `${id}__search` : undefined}
          className='grow rounded-t-md'
          noBorder
          query={filterText}
          onChangeQuery={newValue => setFilterText(newValue)}
        />
        <div className='relative' ref={locationRef} onBlur={handleLocationBlur}>
          <MiniButton
            title='Фильтр по расположению'
            icon={<IconFolderTree size='1.25rem' className={!!filterLocation ? 'icon-green' : 'icon-primary'} />}
            className='mt-1'
            onClick={toggleLocation}
          />
          <Dropdown isOpen={isLocationOpen} stretchLeft className='w-80 h-50'>
            <SelectLocation
              value={filterLocation}
              prefix={prefixes.folders_list}
              dense
              onSelect={target => handleLocationClick(target.getPath())}
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
          <div className='cc-column dense p-3 items-center min-h-24'>
            <p>Список схем пуст</p>
            <p>Измените параметры фильтра</p>
          </div>
        }
        onRowClicked={rowData => onChange(rowData.id)}
      />
    </div>
  );
}
