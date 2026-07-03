'use no memo';
'use client';

import { type RefObject, useCallback, useEffect, useState } from 'react';
import { type Row, type Table } from '@tanstack/react-table';

import { useDragAutoScroll } from '@/hooks/use-drag-auto-scroll';

import { type DataTableDropHint, type DataTableRowDrop } from './data-table';
import { TableRow } from './table-row';
import { type IConditionalStyle } from './use-data-table';

interface TableBodyProps<TData> {
  /** TanStack table instance. */
  table: Table<TData>;

  /** Minimal row padding. */
  dense?: boolean;

  /** Hides the header row (affects column width calculation). */
  noHeader?: boolean;

  /** Skips CSS variable-based column width calculation. */
  skipWidthCalculation?: boolean;

  /** Conditional styles applied per row. */
  conditionalRowStyles?: IConditionalStyle<TData>[];

  /** Id of the last row selected (for shift-click range selection). */
  lastSelected: string | null;

  /** Updates the last-selected row id. */
  onChangeLastSelected: (newValue: string | null) => void;

  /** Single-click row handler. */
  onRowClicked?: (rowData: TData, event: React.MouseEvent<Element>) => void;

  /** Double-click row handler. */
  onRowDoubleClicked?: (rowData: TData, event: React.MouseEvent<Element>) => void;

  /** Enables HTML5 drag-and-drop row reordering. */
  enableRowReordering?: boolean;

  /** Called when rows are dropped in a new order. */
  onRowsReordered?: (event: DataTableRowDrop<TData>) => void;

  /** Ref to the scroll container used for drag auto-scroll. */
  scrollContainerRef: RefObject<HTMLElement | null>;
}

/** Renders table body rows with selection, styling, and optional drag reordering. */
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
  const [isCloneDrag, setIsCloneDrag] = useState(false);
  const [dropHint, setDropHint] = useState<DataTableDropHint | null>(null);
  const canReorder = !!enableRowReordering && !!onRowsReordered;

  useDragAutoScroll(scrollContainerRef, canReorder && draggingRowID !== null);

  useEffect(
    function trackCloneModifierDuringDrag() {
      if (!draggingRowID) {
        return;
      }
      function updateCloneModifier(event: KeyboardEvent) {
        if (event.key !== 'Control' && event.key !== 'Meta') {
          return;
        }
        setIsCloneDrag(event.ctrlKey || event.metaKey);
      }
      window.addEventListener('keydown', updateCloneModifier);
      window.addEventListener('keyup', updateCloneModifier);
      return function cleanupCloneModifierTracking() {
        window.removeEventListener('keydown', updateCloneModifier);
        window.removeEventListener('keyup', updateCloneModifier);
      };
    },
    [draggingRowID]
  );

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
          isCloneDrag={isCloneDrag}
          dropHint={dropHint}
          onChangeDraggingRowID={setDraggingRowID}
          onChangeIsCloneDrag={setIsCloneDrag}
          onChangeDropHint={setDropHint}
        />
      ))}
    </tbody>
  );
}
