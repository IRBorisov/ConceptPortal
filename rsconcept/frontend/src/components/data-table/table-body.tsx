'use no memo';
'use client';

import { type RefObject, useCallback, useState } from 'react';
import { type Row, type Table } from '@tanstack/react-table';

import { useDragAutoScroll } from '@/hooks/use-drag-auto-scroll';

import { type DataTableRowDrop } from './data-table';
import { TableRow } from './table-row';
import { type IConditionalStyle } from './use-data-table';

interface TableBodyProps<TData> {
  table: Table<TData>;
  dense?: boolean;
  noHeader?: boolean;
  skipWidthCalculation?: boolean;
  conditionalRowStyles?: IConditionalStyle<TData>[];

  lastSelected: string | null;
  onChangeLastSelected: (newValue: string | null) => void;

  onRowClicked?: (rowData: TData, event: React.MouseEvent<Element>) => void;
  onRowDoubleClicked?: (rowData: TData, event: React.MouseEvent<Element>) => void;
  enableRowReordering?: boolean;
  onRowsReordered?: (event: DataTableRowDrop<TData>) => void;
  scrollContainerRef: RefObject<HTMLElement | null>;
}

export function TableBody<TData>({
  table,
  dense,
  noHeader,
  skipWidthCalculation,
  conditionalRowStyles,
  lastSelected,
  onChangeLastSelected,
  onRowClicked,
  onRowDoubleClicked,
  enableRowReordering,
  onRowsReordered,
  scrollContainerRef
}: TableBodyProps<TData>) {
  const [draggingRowID, setDraggingRowID] = useState<string | null>(null);
  const canReorder = !!enableRowReordering && !!onRowsReordered;

  useDragAutoScroll(scrollContainerRef, canReorder && draggingRowID !== null);

  const getRowStyles = useCallback(
    (row: Row<TData>) =>
      conditionalRowStyles
        ?.filter(item => !!item.style && item.when(row.original))
        ?.reduce((prev, item) => ({ ...prev, ...item.style }), {}),

    [conditionalRowStyles]
  );

  const getRowClasses = useCallback(
    (row: Row<TData>) => {
      return conditionalRowStyles
        ?.filter(item => !!item.className && item.when(row.original))
        ?.reduce((prev, item) => {
          prev.push(item.className!);
          return prev;
        }, [] as string[]);
    },
    [conditionalRowStyles]
  );

  return (
    <tbody>
      {table.getRowModel().rows.map((row: Row<TData>) => (
        <TableRow
          key={row.id}
          table={table}
          row={row}
          className={getRowClasses(row)?.join(' ')}
          skipWidthCalculation={skipWidthCalculation}
          style={conditionalRowStyles ? { ...getRowStyles(row) } : undefined}
          noHeader={noHeader}
          dense={dense}
          lastSelected={lastSelected}
          onChangeLastSelected={onChangeLastSelected}
          onRowClicked={onRowClicked}
          onRowDoubleClicked={onRowDoubleClicked}
          enableRowReordering={enableRowReordering}
          onRowsReordered={onRowsReordered}
          draggingRowID={draggingRowID}
          onChangeDraggingRowID={setDraggingRowID}
        />
      ))}
    </tbody>
  );
}
