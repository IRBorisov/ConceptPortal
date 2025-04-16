'use no memo';
'use client';

import { flexRender, type Header, type HeaderGroup, type Table } from '@tanstack/react-table';
import clsx from 'clsx';

import { SelectAll } from './select-all';
import { SortingIcon } from './sorting-icon';

interface TableHeaderProps<TData> {
  table: Table<TData>;
  headPosition?: string;
  resetLastSelected: () => void;
}

export function TableHeader<TData>({ table, headPosition, resetLastSelected }: TableHeaderProps<TData>) {
  return (
    <thead className='sticky bg-background cc-shadow-border' style={{ top: headPosition }}>
      {table.getHeaderGroups().map((headerGroup: HeaderGroup<TData>) => (
        <tr key={headerGroup.id}>
          {table.options.enableRowSelection ? (
            <th className='pl-2' scope='col'>
              <SelectAll table={table} resetLastSelected={resetLastSelected} />
            </th>
          ) : null}
          {headerGroup.headers.map((header: Header<TData, unknown>) => (
            <th
              key={header.id}
              colSpan={header.colSpan}
              scope='col'
              className={clsx(
                'cc-table-header group',
                table.options.enableSorting && header.column.getCanSort() ? 'cursor-pointer' : 'cursor-auto'
              )}
              style={{ width: `calc(var(--header-${header?.id}-size) * 1px)` }}
              onClick={table.options.enableSorting ? header.column.getToggleSortingHandler() : undefined}
            >
              {!header.isPlaceholder ? (
                <span className='inline-flex gap-1'>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {table.options.enableSorting && header.column.getCanSort() ? (
                    <SortingIcon sortDirection={header.column.getIsSorted()} />
                  ) : null}
                </span>
              ) : null}
            </th>
          ))}
        </tr>
      ))}
    </thead>
  );
}
