'use no memo';
'use client';

import { useCallback } from 'react';
import { type Table } from '@tanstack/react-table';

import { prefixes } from '@/utils/constants';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../input/select';

interface SelectPaginationProps<TData> {
  id?: string;
  table: Table<TData>;
  paginationOptions: number[];
  onChange?: (newValue: number) => void;
}

export function SelectPagination<TData>({ id, table, paginationOptions, onChange }: SelectPaginationProps<TData>) {
  const handlePaginationOptionsChange = useCallback(
    (newValue: string) => {
      const perPage = Number(newValue);
      table.setPageSize(perPage);
      onChange?.(perPage);
    },
    [table, onChange]
  );

  return (
    <Select onValueChange={handlePaginationOptionsChange} defaultValue={String(table.getState().pagination.pageSize)}>
      <SelectTrigger
        id={id}
        aria-label='Выбор количества строчек на странице'
        className='mx-2 cursor-pointer bg-transparent focus-outline border-0 w-28 max-h-6 px-2 justify-end'
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {paginationOptions?.map(option => (
          <SelectItem key={`${prefixes.page_size}${option}`} value={String(option)}>
            {option} на стр
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
