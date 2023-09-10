import { Table } from '@tanstack/react-table';
import { useCallback } from 'react';

import { GotoFirstIcon, GotoLastIcon, GotoNextIcon, GotoPrevIcon } from '../Icons';

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
  <div className='text-sm flex justify-end w-full items-center text-controls select-none my-2'>
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
    <button
      className='clr-hover text-controls'
      onClick={() => table.setPageIndex(0)}
      disabled={!table.getCanPreviousPage()}
    >
      <GotoFirstIcon />
    </button>
    <button
      className='clr-hover text-controls'
      onClick={() => table.previousPage()}
      disabled={!table.getCanPreviousPage()}
    >
      <GotoPrevIcon />
    </button>
    <input type='text'
      title='Номер страницы. Выделите для ручного ввода'
      className='w-6 clr-app text-center'
      value={table.getState().pagination.pageIndex + 1}
      onChange={event => {
        const page = event.target.value ? Number(event.target.value) - 1 : 0;
        if (page + 1 <= table.getPageCount()) {
          table.setPageIndex(page);
        }
      }}
    />
    <button
      className='clr-hover text-controls'
      onClick={() => table.nextPage()}
      disabled={!table.getCanNextPage()}
    >
      <GotoNextIcon />
    </button>
    <button className='clr-hover text-controls'
      onClick={() => table.setPageIndex(table.getPageCount() - 1)}
      disabled={!table.getCanNextPage()}
    >
      <GotoLastIcon />
    </button>
  </div>
  <select
    value={table.getState().pagination.pageSize}
    onChange={handlePaginationOptionsChange}
    className='clr-app mx-2 cursor-pointer'
  >
  {paginationOptions.map(
  pageSize => (
    <option key={pageSize} value={pageSize}>
      {pageSize} на стр
    </option>
  ))}
  </select>
  </div>);
}

export default PaginationTools;
