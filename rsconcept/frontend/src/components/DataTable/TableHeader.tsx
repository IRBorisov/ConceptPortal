'use no memo';

import { flexRender, Header, HeaderGroup, Table } from '@tanstack/react-table';

import { SelectAll } from './SelectAll';
import { SortingIcon } from './SortingIcon';

interface TableHeaderProps<TData> {
  table: Table<TData>;
  headPosition?: string;
  enableRowSelection?: boolean;
  enableSorting?: boolean;
  resetLastSelected: () => void;
}

export function TableHeader<TData>({
  table,
  headPosition,
  enableRowSelection,
  enableSorting,
  resetLastSelected
}: TableHeaderProps<TData>) {
  return (
    <thead
      className='bg-prim-100 cc-shadow-border'
      style={{
        top: headPosition,
        position: 'sticky'
      }}
    >
      {table.getHeaderGroups().map((headerGroup: HeaderGroup<TData>) => (
        <tr key={headerGroup.id}>
          {enableRowSelection ? (
            <th className='pl-3 pr-1 align-middle'>
              <SelectAll table={table} resetLastSelected={resetLastSelected} />
            </th>
          ) : null}
          {headerGroup.headers.map((header: Header<TData, unknown>) => (
            <th
              key={header.id}
              colSpan={header.colSpan}
              className='pl-2 py-2 text-xs font-medium select-none whitespace-nowrap'
              style={{
                paddingRight: enableSorting && header.column.getCanSort() ? '0px' : '2px',
                textAlign: 'start',
                width: `calc(var(--header-${header?.id}-size) * 1px)`,
                cursor: enableSorting && header.column.getCanSort() ? 'pointer' : 'auto'
              }}
              onClick={enableSorting ? header.column.getToggleSortingHandler() : undefined}
            >
              {!header.isPlaceholder ? (
                <span className='inline-flex align-middle gap-1'>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {enableSorting && header.column.getCanSort() ? <SortingIcon column={header.column} /> : null}
                </span>
              ) : null}
            </th>
          ))}
        </tr>
      ))}
    </thead>
  );
}
