'use client';
'use no memo';

import { useCallback } from 'react';
import { type Cell, flexRender, type Row, type Table } from '@tanstack/react-table';
import clsx from 'clsx';

import { cn } from '../utils';

import { type DataTableRowDrop } from './data-table';
import { SelectRow } from './select-row';

interface TableRowProps<TData> {
  /** TanStack table instance. */
  table: Table<TData>;

  /** TanStack row instance. */
  row: Row<TData>;

  /** Additional CSS class name(s) for the row. */
  className?: string;

  /** Skips CSS variable-based column width calculation. */
  skipWidthCalculation?: boolean;

  /** Inline styles for the row. */
  style?: React.CSSProperties;

  /** Hides the header row (affects column width on first row). */
  noHeader?: boolean;

  /** Minimal cell padding. */
  dense?: boolean;

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

  /** Id of the row currently being dragged, or `null`. */
  draggingRowID: string | null;

  /** Updates the dragging row id. */
  onChangeDraggingRowID: (newValue: string | null) => void;
}

/** Single data table row with selection, click handlers, and optional drag reordering. */
export function TableRow<TData>({
  table,
  row,
  className,
  skipWidthCalculation,
  style,
  noHeader,
  dense,
  lastSelected,
  onChangeLastSelected,
  onRowClicked,
  onRowDoubleClicked,
  enableRowReordering,
  onRowsReordered,
  draggingRowID,
  onChangeDraggingRowID
}: TableRowProps<TData>) {
  const hasBG = className?.includes('bg-') ?? false;
  const canReorder = !!enableRowReordering && !!onRowsReordered;
  const isDragging = draggingRowID !== null;

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

  function isDropAfterTarget(event: React.DragEvent<Element>): boolean {
    const { top, height } = event.currentTarget.getBoundingClientRect();
    return event.clientY >= top + height / 2;
  }

  function getDraggedRows(draggedRowID: string): Row<TData>[] {
    const rows = table.getRowModel().rows;
    const draggedRow = rows.find(current => current.id === draggedRowID);
    if (!draggedRow) {
      return [];
    }
    if (!table.options.enableRowSelection) {
      return [draggedRow];
    }
    if (!draggedRow.getIsSelected()) {
      return [draggedRow];
    }
    return rows.filter(current => current.getIsSelected());
  }

  function handleDragStart(event: React.DragEvent<HTMLTableRowElement>) {
    if (!canReorder) {
      return;
    }
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', row.id);
    onChangeDraggingRowID(row.id);
  }

  function handleDragOver(event: React.DragEvent<HTMLTableRowElement>) {
    if (!canReorder) {
      return;
    }
    const draggedRowID = draggingRowID;
    if (!draggedRowID) {
      return;
    }
    const draggedRows = getDraggedRows(draggedRowID);
    if (draggedRows.some(current => current.id === row.id)) {
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }

  function handleDrop(event: React.DragEvent<HTMLTableRowElement>) {
    if (!canReorder) {
      return;
    }
    const draggedRowID = draggingRowID ?? event.dataTransfer.getData('text/plain');
    const draggedRows = getDraggedRows(draggedRowID);
    if (draggedRows.length === 0 || draggedRows.some(current => current.id === row.id)) {
      return;
    }
    event.preventDefault();
    const remainingRows = table
      .getRowModel()
      .rows.filter(current => !draggedRows.some(dragged => dragged.id === current.id));
    const targetIndex = remainingRows.findIndex(current => current.id === row.id);
    const afterRow = isDropAfterTarget(event) ? row : (remainingRows[targetIndex - 1] ?? null);
    onRowsReordered?.({
      draggedRows: draggedRows.map(current => current.original),
      afterRow: afterRow?.original ?? null
    });
    onChangeDraggingRowID(null);
  }

  function handleDragEnd() {
    onChangeDraggingRowID(null);
  }

  return (
    <tr
      className={cn(
        'cc-scroll-row',
        'cc-hover-bg cc-animate-background duration-fade',
        !noHeader && 'scroll-mt-[calc(2px+2rem)]',
        table.options.enableRowSelection && row.getIsSelected()
          ? 'cc-selected'
          : !hasBG
            ? 'odd:bg-secondary even:bg-background'
            : '',
        className,
        canReorder && isDragging && 'cursor-move'
      )}
      style={style}
      draggable={canReorder}
      onClick={event => handleRowClicked(row, event)}
      onDoubleClick={event => onRowDoubleClicked?.(row.original, event)}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnd={handleDragEnd}
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
            canReorder && isDragging
              ? 'cursor-move'
              : onRowClicked || onRowDoubleClicked
                ? 'cursor-pointer'
                : 'cursor-auto'
          )}
          style={{
            width:
              noHeader && row.index === 0 && !skipWidthCalculation
                ? `calc(var(--col-${cell.column.id}-size) * 1px)`
                : undefined
          }}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  );
}
