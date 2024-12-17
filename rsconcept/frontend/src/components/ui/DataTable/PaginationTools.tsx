'use client';
'use no memo';

import { Table } from '@tanstack/react-table';
import clsx from 'clsx';
import { useCallback } from 'react';

import { IconPageFirst, IconPageLast, IconPageLeft, IconPageRight } from '@/components/Icons';
import { prefixes } from '@/utils/constants';

interface PaginationToolsProps<TData> {
  id?: string;
  table: Table<TData>;
  paginationOptions: number[];
  onChangePaginationOption?: (newValue: number) => void;
}

function PaginationTools<TData>({
  id,
  table,
  paginationOptions,
  onChangePaginationOption
}: PaginationToolsProps<TData>) {
  const handlePaginationOptionsChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const perPage = Number(event.target.value);
      table.setPageSize(perPage);
      if (onChangePaginationOption) {
        onChangePaginationOption(perPage);
      }
    },
    [onChangePaginationOption, table]
  );

  return (
    <div className={clsx('flex justify-end items-center', 'my-2', 'text-sm', 'clr-text-controls', 'select-none')}>
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
          className='clr-hover clr-text-controls cc-animate-color'
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          <IconPageFirst size='1.5rem' />
        </button>
        <button
          type='button'
          className='clr-hover clr-text-controls cc-animate-color'
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <IconPageLeft size='1.5rem' />
        </button>
        <input
          id={id ? `${id}__page` : undefined}
          title='Номер страницы. Выделите для ручного ввода'
          className='w-6 text-center bg-prim-100'
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
          className='clr-hover clr-text-controls cc-animate-color'
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <IconPageRight size='1.5rem' />
        </button>
        <button
          type='button'
          className='clr-hover clr-text-controls cc-animate-color'
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          <IconPageLast size='1.5rem' />
        </button>
      </div>
      <select
        id={id ? `${id}__per_page` : undefined}
        value={table.getState().pagination.pageSize}
        onChange={handlePaginationOptionsChange}
        className='mx-2 cursor-pointer bg-prim-100'
      >
        {paginationOptions.map(pageSize => (
          <option key={`${prefixes.page_size}${pageSize}`} value={pageSize}>
            {pageSize} на стр
          </option>
        ))}
      </select>
    </div>
  );
}

export default PaginationTools;
