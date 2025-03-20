'use no memo';
'use client';

import { useCallback } from 'react';
import { type Table } from '@tanstack/react-table';

import { prefixes } from '@/utils/constants';

import { IconPageFirst, IconPageLast, IconPageLeft, IconPageRight } from '../icons';

interface PaginationToolsProps<TData> {
  id?: string;
  table: Table<TData>;
  paginationOptions: number[];
  onChangePaginationOption?: (newValue: number) => void;
}

export function PaginationTools<TData>({
  id,
  table,
  onChangePaginationOption,
  paginationOptions
}: PaginationToolsProps<TData>) {
  const handlePaginationOptionsChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const perPage = Number(event.target.value);
      table.setPageSize(perPage);
      onChangePaginationOption?.(perPage);
    },
    [table, onChangePaginationOption]
  );

  return (
    <div className='flex justify-end items-center my-2 text-sm clr-text-controls select-none'>
      <span className='mr-3'>
        {`${table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
      -
      ${Math.min(
        table.getFilteredRowModel().rows.length,
        (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize
      )}
      из
      ${table.getFilteredRowModel().rows.length}`}
      </span>
      <div className='flex'>
        <button
          type='button'
          aria-label='Первая страница'
          className='clr-hover clr-text-controls cc-animate-color focus-outline'
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          <IconPageFirst size='1.5rem' />
        </button>
        <button
          type='button'
          aria-label='Предыдущая страница'
          className='clr-hover clr-text-controls cc-animate-color focus-outline'
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <IconPageLeft size='1.5rem' />
        </button>
        <input
          id={id ? `${id}__page` : undefined}
          title='Номер страницы. Выделите для ручного ввода'
          aria-label='Номер страницы'
          className='w-6 text-center bg-prim-100 focus-outline'
          value={table.getState().pagination.pageIndex + 1}
          onChange={event => {
            const page = event.target.value ? Number(event.target.value) - 1 : 0;
            if (page + 1 <= table.getPageCount()) {
              table.setPageIndex(page);
            }
          }}
        />
        <button
          type='button'
          aria-label='Следующая страница'
          className='clr-hover clr-text-controls cc-animate-color focus-outline'
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <IconPageRight size='1.5rem' />
        </button>
        <button
          type='button'
          aria-label='Последняя страница'
          className='clr-hover clr-text-controls cc-animate-color focus-outline'
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          <IconPageLast size='1.5rem' />
        </button>
      </div>
      <select
        id={id ? `${id}__per_page` : undefined}
        aria-label='Выбор количества строчек на странице'
        value={table.getState().pagination.pageSize}
        onChange={handlePaginationOptionsChange}
        className='mx-2 cursor-pointer bg-prim-100 focus-outline'
      >
        {paginationOptions.map(pageSize => (
          <option key={`${prefixes.page_size}${pageSize}`} value={pageSize} aria-label={`${pageSize} на страницу`}>
            {pageSize} на стр
          </option>
        ))}
      </select>
    </div>
  );
}
