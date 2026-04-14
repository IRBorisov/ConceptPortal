'use no memo';
'use client';

import { useCallback } from 'react';
import { type Table } from '@tanstack/react-table';

import { prefixes } from '@/utils/constants';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../input/select';
import { cn } from '../utils';

interface SelectPaginationProps<TData> {
  id?: string;
  table: Table<TData>;
  paginationOptions: readonly number[];
  onChange?: (newValue: number) => void;
  className?: string;
}

export function SelectPagination<TData>({
  id,
  table,
  paginationOptions,
  onChange,
  className
}: SelectPaginationProps<TData>) {
  const handlePaginationOptionsChange = useCallback(
    (newValue: string) => {
      const perPage = Number(newValue);
      table.setPageSize(perPage);
      onChange?.(perPage);
    },
    [table, onChange]
  );

  return (
    <Select onValueChange={handlePaginationOptionsChange} value={String(table.getState().pagination.pageSize)}>
      <SelectTrigger
        id={id}
        aria-label='Выбор количества строк на страницу'
        className={cn(
          'px-2 justify-end',
          'bg-transparent cc-hover-text cc-animate-color focus-outline border-0 rounded-md',
          'cursor-pointer',
          className
        )}
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
