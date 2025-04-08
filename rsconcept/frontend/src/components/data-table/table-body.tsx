'use no memo';

import { useCallback } from 'react';
import { type Cell, flexRender, type Row, type Table } from '@tanstack/react-table';
import clsx from 'clsx';

import { SelectRow } from './select-row';
import { type IConditionalStyle } from '.';

interface TableBodyProps<TData> {
  table: Table<TData>;
  dense?: boolean;
  noHeader?: boolean;
  conditionalRowStyles?: IConditionalStyle<TData>[];

  lastSelected: string | null;
  onChangeLastSelected: (newValue: string | null) => void;

  onRowClicked?: (rowData: TData, event: React.MouseEvent<Element>) => void;
  onRowDoubleClicked?: (rowData: TData, event: React.MouseEvent<Element>) => void;
}

export function TableBody<TData>({
  table,
  dense,
  noHeader,
  conditionalRowStyles,
  lastSelected,
  onChangeLastSelected,
  onRowClicked,
  onRowDoubleClicked
}: TableBodyProps<TData>) {
  const handleRowClicked = useCallback(
    (target: Row<TData>, event: React.MouseEvent<Element>) => {
      onRowClicked?.(target.original, event);
      if (table.options.enableRowSelection && target.getCanSelect()) {
        if (event.shiftKey && !!lastSelected && lastSelected !== target.id) {
          const { rows, rowsById } = table.getRowModel();
          const lastIndex = rowsById[lastSelected].index;
          const currentIndex = target.index;
          const toggleRows = rows.slice(
            lastIndex > currentIndex ? currentIndex : lastIndex + 1,
            lastIndex > currentIndex ? lastIndex : currentIndex + 1
          );
          const newSelection: Record<string, boolean> = {};
          toggleRows.forEach(row => {
            newSelection[row.id] = !target.getIsSelected();
          });
          table.setRowSelection(prev => ({ ...prev, ...newSelection }));
          onChangeLastSelected(null);
        } else {
          onChangeLastSelected(target.id);
          target.toggleSelected(!target.getIsSelected());
        }
      }
    },
    [table, lastSelected, onChangeLastSelected, onRowClicked]
  );

  const getRowStyles = useCallback(
    (row: Row<TData>) => {
      return {
        ...conditionalRowStyles!
          .filter(item => item.when(row.original))
          .reduce((prev, item) => ({ ...prev, ...item.style }), {})
      };
    },
    [conditionalRowStyles]
  );

  return (
    <tbody>
      {table.getRowModel().rows.map((row: Row<TData>, index) => (
        <tr
          key={row.id}
          className={clsx(
            'cc-scroll-row',
            'clr-hover cc-animate-background duration-(--duration-fade)',
            !noHeader && 'scroll-mt-[calc(2px+2rem)]',
            table.options.enableRowSelection && row.getIsSelected()
              ? 'clr-selected'
              : 'odd:bg-prim-200 even:bg-prim-100'
          )}
          style={{ ...(conditionalRowStyles ? getRowStyles(row) : []) }}
          onClick={event => handleRowClicked(row, event)}
          onDoubleClick={event => onRowDoubleClicked?.(row.original, event)}
        >
          {table.options.enableRowSelection ? (
            <td key={`select-${row.id}`} className='pl-2 border-y'>
              <SelectRow row={row} onChangeLastSelected={onChangeLastSelected} />
            </td>
          ) : null}
          {row.getVisibleCells().map((cell: Cell<TData, unknown>) => (
            <td
              key={cell.id}
              className={clsx(
                'px-2 align-middle border-y',
                dense ? 'py-1' : 'py-2',
                onRowClicked || onRowDoubleClicked ? 'cursor-pointer' : 'cursor-auto'
              )}
              style={{
                width: noHeader && index === 0 ? `calc(var(--col-${cell.column.id}-size) * 1px)` : undefined
              }}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}
