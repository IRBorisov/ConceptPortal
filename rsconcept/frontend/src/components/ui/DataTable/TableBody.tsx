import { Cell, flexRender, Row, Table } from '@tanstack/react-table';

import { IConditionalStyle } from '.';
import SelectRow from './SelectRow';

interface TableBodyProps<TData> {
  table: Table<TData>;
  dense?: boolean;
  enableRowSelection?: boolean;
  conditionalRowStyles?: IConditionalStyle<TData>[];

  lastSelected: string | undefined;
  setLastSelected: React.Dispatch<React.SetStateAction<string | undefined>>;

  onRowClicked?: (rowData: TData, event: React.MouseEvent<Element, MouseEvent>) => void;
  onRowDoubleClicked?: (rowData: TData, event: React.MouseEvent<Element, MouseEvent>) => void;
}

function TableBody<TData>({
  table,
  dense,
  enableRowSelection,
  conditionalRowStyles,
  lastSelected,
  setLastSelected,
  onRowClicked,
  onRowDoubleClicked
}: TableBodyProps<TData>) {
  function handleRowClicked(target: Row<TData>, event: React.MouseEvent<Element, MouseEvent>) {
    if (onRowClicked) {
      onRowClicked(target.original, event);
    }
    if (enableRowSelection && target.getCanSelect()) {
      if (event.shiftKey && !!lastSelected && lastSelected !== target.id) {
        const { rows, rowsById } = table.getRowModel();
        const lastIndex = rowsById[lastSelected].index;
        const currentIndex = target.index;
        const toggleRows = rows.slice(
          lastIndex > currentIndex ? currentIndex : lastIndex + 1,
          lastIndex > currentIndex ? lastIndex : currentIndex + 1
        );
        const newSelection: { [key: string]: boolean } = {};
        toggleRows.forEach(row => {
          newSelection[row.id] = !target.getIsSelected();
        });
        table.setRowSelection(prev => ({ ...prev, ...newSelection }));
        setLastSelected(undefined);
      } else {
        setLastSelected(target.id);
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
          className={
            row.getIsSelected()
              ? 'clr-selected clr-hover'
              : index % 2 === 0
              ? 'clr-controls clr-hover'
              : 'clr-app clr-hover'
          }
          style={conditionalRowStyles && getRowStyles(row)}
        >
          {enableRowSelection ? (
            <td key={`select-${row.id}`} className='pl-3 pr-1 align-middle border-y'>
              <SelectRow row={row} setLastSelected={setLastSelected} />
            </td>
          ) : null}
          {row.getVisibleCells().map((cell: Cell<TData, unknown>) => (
            <td
              key={cell.id}
              className='px-2 align-middle border-y'
              style={{
                cursor: onRowClicked || onRowDoubleClicked ? 'pointer' : 'auto',
                paddingBottom: dense ? '0.25rem' : '0.5rem',
                paddingTop: dense ? '0.25rem' : '0.5rem'
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
