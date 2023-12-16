'use client';

import { Table } from '@tanstack/react-table';
import clsx from 'clsx';
import { useCallback } from 'react';
import { BiChevronLeft, BiChevronRight, BiFirstPage, BiLastPage } from 'react-icons/bi';

import { prefixes } from '@/utils/constants';

interface PaginationToolsProps<TData> {
  table: Table<TData>
  paginationOptions: number[]
  onChangePaginationOption?: (newValue: number) => void
}

function PaginationTools<TData>({ table, paginationOptions, onChangePaginationOption }: PaginationToolsProps<TData>) {
  const handlePaginationOptionsChange = useCallback(
  (event: React.ChangeEvent<HTMLSelectElement>) => {
    const perPage = Number(event.target.value);
    table.setPageSize(perPage);
    if (onChangePaginationOption) {
      onChangePaginationOption(perPage);
    }
  }, [onChangePaginationOption, table]);
  
  return (
  <div className={clsx(
    'flex justify-end items-center',
    'w-full my-2',
    'text-sm', 
    'clr-text-controls',
    'select-none'
  )}>
    <div className='flex items-center gap-1 mr-3'>
      <div className=''>
        {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
        -
        {Math.min(table.getFilteredRowModel().rows.length, (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize)}
      </div>
      <span>из</span>
      <div className=''>{table.getFilteredRowModel().rows.length}</div>
    </div>
    <div className='flex'>
      <button type='button'
        className='clr-hover clr-text-controls'
        onClick={() => table.setPageIndex(0)}
        disabled={!table.getCanPreviousPage()}
      >
        <BiFirstPage size='1.5rem' />
      </button>
      <button type='button'
        className='clr-hover clr-text-controls'
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
      >
        <BiChevronLeft size='1.5rem' />
      </button>
      <input
        title='Номер страницы. Выделите для ручного ввода'
        className='w-6 text-center clr-app'
        value={table.getState().pagination.pageIndex + 1}
        onChange={event => {
          const page = event.target.value ? Number(event.target.value) - 1 : 0;
          if (page + 1 <= table.getPageCount()) {
            table.setPageIndex(page);
          }
        }}
      />
      <button type='button'
        className='clr-hover clr-text-controls'
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
      >
        <BiChevronRight size='1.5rem' />
      </button>
      <button type='button'
        className='clr-hover clr-text-controls'
        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
        disabled={!table.getCanNextPage()}
      >
        <BiLastPage size='1.5rem' />
      </button>
    </div>
    <select
      value={table.getState().pagination.pageSize}
      onChange={handlePaginationOptionsChange}
      className='mx-2 cursor-pointer clr-app'
    >
    {paginationOptions.map(
    (pageSize) => (
      <option key={`${prefixes.page_size}${pageSize}`} value={pageSize}>
        {pageSize} на стр
      </option>
    ))}
    </select>
  </div>);
}

export default PaginationTools;
