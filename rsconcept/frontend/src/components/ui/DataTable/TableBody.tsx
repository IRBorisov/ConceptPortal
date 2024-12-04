import { Cell, flexRender, Row, Table } from '@tanstack/react-table';
import clsx from 'clsx';

import { CProps } from '@/components/props';

import { IConditionalStyle } from '.';
import SelectRow from './SelectRow';

interface TableBodyProps<TData> {
  table: Table<TData>;
  dense?: boolean;
  noHeader?: boolean;
  enableRowSelection?: boolean;
  conditionalRowStyles?: IConditionalStyle<TData>[];

  lastSelected: string | undefined;
  onChangeLastSelected: (newValue: string | undefined) => void;

  onRowClicked?: (rowData: TData, event: CProps.EventMouse) => void;
  onRowDoubleClicked?: (rowData: TData, event: CProps.EventMouse) => void;
}

function TableBody<TData>({
  table,
  dense,
  noHeader,
  enableRowSelection,
  conditionalRowStyles,
  lastSelected,
  onChangeLastSelected,
  onRowClicked,
  onRowDoubleClicked
}: TableBodyProps<TData>) {
  function handleRowClicked(target: Row<TData>, event: CProps.EventMouse) {
    onRowClicked?.(target.original, event);
    if (enableRowSelection && target.getCanSelect()) {
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
        onChangeLastSelected(undefined);
      } else {
        onChangeLastSelected(target.id);
        target.toggleSelected(!target.getIsSelected());
      }
    }
  }

  function getRowStyles(row: Row<TData>) {
    return {
      ...conditionalRowStyles!
        .filter(item => item.when(row.original))
        .reduce((prev, item) => ({ ...prev, ...item.style }), {})
    };
  }

  return (
    <tbody>
      {table.getRowModel().rows.map((row: Row<TData>, index) => (
        <tr
          key={row.id}
          className={clsx(
            'cc-scroll-row',
            !noHeader && 'scroll-mt-[calc(2px+2rem)]',
            row.getIsSelected()
              ? 'clr-selected clr-hover'
              : index % 2 === 0
              ? 'clr-controls clr-hover'
              : 'clr-app clr-hover'
          )}
          style={{ ...(conditionalRowStyles ? getRowStyles(row) : []) }}
        >
          {enableRowSelection ? (
            <td key={`select-${row.id}`} className='pl-3 pr-1 align-middle border-y'>
              <SelectRow row={row} onChangeLastSelected={onChangeLastSelected} />
            </td>
          ) : null}
          {row.getVisibleCells().map((cell: Cell<TData, unknown>) => (
            <td
              key={cell.id}
              className='px-2 align-middle border-y'
              style={{
                cursor: onRowClicked || onRowDoubleClicked ? 'pointer' : 'auto',
                paddingBottom: dense ? '0.25rem' : '0.5rem',
                paddingTop: dense ? '0.25rem' : '0.5rem',
                width: noHeader && index === 0 ? `calc(var(--col-${cell.column.id}-size) * 1px)` : 'auto'
              }}
              onClick={event => handleRowClicked(row, event)}
              onDoubleClick={event => (onRowDoubleClicked ? onRowDoubleClicked(row.original, event) : undefined)}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

export default TableBody;
