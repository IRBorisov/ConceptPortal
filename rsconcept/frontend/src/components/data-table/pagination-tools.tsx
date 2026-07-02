'use no memo';
'use client';

import { type Table } from '@tanstack/react-table';
import clsx from 'clsx';

import { useTx } from '@/i18n';

import { IconPageFirst, IconPageLast, IconPageLeft, IconPageRight } from '../icons';

import { SelectPagination } from './select-pagination';

interface PaginationToolsProps<TData> {
  /** Id prefix for page and per-page controls. */
  id?: string;

  /** TanStack table instance. */
  table: Table<TData>;

  /** Available page-size options. */
  paginationOptions: readonly number[];

  /** Called when the user changes rows per page. */
  onChangePaginationOption?: (newValue: number) => void;
}

/** Pagination bar with range label, page navigation, and per-page selector. */
export function PaginationTools<TData>({
  id,
  table,
  onChangePaginationOption,
  paginationOptions
}: PaginationToolsProps<TData>) {
  const tx = useTx();
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const rowCount = table.getFilteredRowModel().rows.length;
  const start = rowCount === 0 ? 0 : pageIndex * pageSize + 1;
  const end = Math.min(rowCount, (pageIndex + 1) * pageSize);
  const rangeLabel = tx('tx.shell.pagination.range', { start, end, total: rowCount });

  const buttonClass = clsx(
    '-my-1',
    'cc-hover-text cc-animate-color',
    'focus-outline rounded-md',
    'disabled:opacity-75 not-[:disabled]:cursor-pointer'
  );
  const multiPage = table.getPageCount() > 1;
  return (
    <div className='pl-3 flex justify-end flex-wrap items-center my-1 text-muted-foreground text-sm select-none'>
      <div className={clsx(multiPage ? 'mr-2' : paginationOptions.length > 1 ? 'mr-1' : 'mr-3')}>{rangeLabel}</div>
      {multiPage ? (
        <div className='flex'>
          <button
            type='button'
            aria-label={tx('tx.shell.pagination.first')}
            className={buttonClass}
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <IconPageFirst size='1.5rem' />
          </button>
          <button
            type='button'
            aria-label={tx('tx.shell.pagination.prev')}
            className={buttonClass}
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <IconPageLeft size='1.5rem' />
          </button>
          <input
            id={id ? `${id}__page` : undefined}
            title={tx('tx.shell.pagination.page.input.hint')}
            aria-label={tx('tx.shell.pagination.page.input')}
            className='w-6 text-center bg-transparent focus-outline rounded-md p-0'
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
            aria-label={tx('tx.shell.pagination.next')}
            className={buttonClass}
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <IconPageRight size='1.5rem' />
          </button>
          <button
            type='button'
            aria-label={tx('tx.shell.pagination.last')}
            className={buttonClass}
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <IconPageLast size='1.5rem' />
          </button>
        </div>
      ) : null}
      {paginationOptions.length > 1 ? (
        <SelectPagination
          id={id ? `${id}__per_page` : undefined}
          table={table}
          className='max-h-6 mr-1'
          paginationOptions={paginationOptions}
          onChange={onChangePaginationOption}
        />
      ) : null}
    </div>
  );
}
