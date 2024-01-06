import { Cell, flexRender, Row, Table } from '@tanstack/react-table';

import { IConditionalStyle } from '.';
import SelectRow from './SelectRow';

interface TableBodyProps<TData> {
  table: Table<TData>;
  dense?: boolean;
  enableRowSelection?: boolean;
  conditionalRowStyles?: IConditionalStyle<TData>[];
  onRowClicked?: (rowData: TData, event: React.MouseEvent<Element, MouseEvent>) => void;
  onRowDoubleClicked?: (rowData: TData, event: React.MouseEvent<Element, MouseEvent>) => void;
}

function TableBody<TData>({
  table,
  dense,
  enableRowSelection,
  conditionalRowStyles,
  onRowClicked,
  onRowDoubleClicked
}: TableBodyProps<TData>) {
  function handleRowClicked(row: Row<TData>, event: React.MouseEvent<Element, MouseEvent>) {
    if (onRowClicked) {
      onRowClicked(row.original, event);
    }
    if (enableRowSelection && row.getCanSelect()) {
      row.getToggleSelectedHandler()(!row.getIsSelected());
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
            <td key={`select-${row.id}`} className='pl-3 pr-1 border-y align-middle'>
              <SelectRow row={row} />
            </td>
          ) : null}
          {row.getVisibleCells().map((cell: Cell<TData, unknown>) => (
            <td
              key={cell.id}
              className='px-2 border-y align-middle'
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
