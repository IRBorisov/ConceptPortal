'use no memo';

import clsx from 'clsx';

import { usePreferencesStore } from '@/stores/preferences';

import { SelectAll } from './select-all';
import { SortingIcon } from './sorting-icon';
import { type DataTableHeader, type DataTableHeaderGroup, type DataTableInstance } from './table-features';

interface TableHeaderProps<TData> {
  /** TanStack table instance. */
  table: DataTableInstance<TData>;

  /** Skips CSS variable-based column width calculation. */
  skipWidthCalculation?: boolean;

  /** Clears shift-click range selection anchor. */
  resetLastSelected: () => void;
}

/** Sticky table header with sort controls and optional select-all checkbox. */
export function TableHeader<TData>({ table, skipWidthCalculation, resetLastSelected }: TableHeaderProps<TData>) {
  const { darkMode } = usePreferencesStore();
  const backgroundColor = darkMode
    ? 'color-mix(in oklab,  var(--clr-prim-100), var(--clr-sec-600) 15%)'
    : 'color-mix(in oklab,  var(--clr-prim-100), var(--clr-sec-600) 4%)';
  return (
    <thead
      className='sticky top-0 border-b border-primary/20 bg-background cc-shadow-border'
      style={{ backgroundColor: backgroundColor }}
    >
      {table.getHeaderGroups().map((headerGroup: DataTableHeaderGroup<TData>) => (
        <tr key={headerGroup.id}>
          {table.options.enableRowSelection ? (
            <th className='pl-2' scope='col'>
              <SelectAll table={table} resetLastSelected={resetLastSelected} />
            </th>
          ) : null}
          {headerGroup.headers.map((header: DataTableHeader<TData>) => (
            <th
              key={header.id}
              colSpan={header.colSpan}
              scope='col'
              className={clsx(
                'group',
                'p-2 text-start',
                'text-xs font-medium',
                'select-none whitespace-nowrap',
                table.options.enableSorting && header.column.getCanSort() ? 'cursor-pointer' : 'cursor-auto'
              )}
              style={skipWidthCalculation ? undefined : { width: `calc(var(--header-${header?.id}-size) * 1px)` }}
              onClick={table.options.enableSorting ? header.column.getToggleSortingHandler() : undefined}
            >
              {!header.isPlaceholder ? (
                <span className='inline-flex gap-1'>
                  <table.FlexRender header={header} />
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
