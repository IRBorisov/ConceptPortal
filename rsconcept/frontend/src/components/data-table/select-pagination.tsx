'use no memo';
'use client';

import { useCallback } from 'react';
import { type Table } from '@tanstack/react-table';

import { useTx } from '@/i18n';

import { prefixes } from '@/utils/constants';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../input/select';
import { cn } from '../utils';

interface SelectPaginationProps<TData> {
  /** Id of the per-page select trigger. */
  id?: string;

  /** TanStack table instance. */
  table: Table<TData>;

  /** Available page-size options. */
  paginationOptions: readonly number[];

  /** Called when the user picks a new page size. */
  onChange?: (newValue: number) => void;

  /** Additional CSS class name(s) for the trigger. */
  className?: string;
}

/** Dropdown to change the number of rows per page. */
export function SelectPagination<TData>({
  id,
  table,
  paginationOptions,
  onChange,
  className
}: SelectPaginationProps<TData>) {
  const tx = useTx();
  const handlePaginationOptionsChange = useCallback(
    (newValue: unknown) => {
      const perPage = Number(newValue);
      table.setPageSize(perPage);
      onChange?.(perPage);
    },
    [table, onChange]
  );

  const selectItems = (paginationOptions ?? []).map(option => ({
    value: String(option),
    label: (
      <>
        {option} {tx('tx.shell.pagination.perPage')}
      </>
    )
  }));

  return (
    <Select
      items={selectItems}
      onValueChange={handlePaginationOptionsChange}
      value={String(table.getState().pagination.pageSize)}
    >
      <SelectTrigger
        id={id}
        aria-label={tx('tx.shell.pagination.perPage.hint')}
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
            {option} {tx('tx.shell.pagination.perPage')}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
