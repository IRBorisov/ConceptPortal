'use client';
'use no memo';

import { useCallback } from 'react';
import { type Cell, flexRender, type Row, type Table } from '@tanstack/react-table';
import clsx from 'clsx';

import { cn } from '../utils';

import { type DataTableDropHint, type DataTableRowDrop } from './data-table';
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

  /** Whether the current drag operation is a clone (Ctrl/Meta). */
  isCloneDrag: boolean;

  /** Current drop position hint, if any. */
  dropHint: DataTableDropHint | null;

  /** Updates the dragging row id. */
  onChangeDraggingRowID: (newValue: string | null) => void;

  /** Updates whether the drag is a clone operation. */
  onChangeIsCloneDrag: (newValue: boolean) => void;

  /** Updates the drop position hint. */
  onChangeDropHint: (newValue: DataTableDropHint | null) => void;
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
  isCloneDrag,
  dropHint,
  onChangeDraggingRowID,
  onChangeIsCloneDrag,
  onChangeDropHint
}: TableRowProps<TData>) {
  const hasBG = className?.includes('bg-') ?? false;
  const canReorder = !!enableRowReordering && !!onRowsReordered;
  const isDragging = draggingRowID !== null;
  const showDropBefore = dropHint?.rowID === row.id && !dropHint.after;
  const showDropAfter = dropHint?.rowID === row.id && dropHint.after;

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

  function isCloneModifier(event: React.DragEvent | KeyboardEvent): boolean {
    return event.ctrlKey || event.metaKey;
  }

  function syncCloneDragState(event: React.DragEvent): boolean {
    const isClone = isCloneModifier(event);
    if (isClone !== isCloneDrag) {
      onChangeIsCloneDrag(isClone);
    }
    return isClone;
  }

  function getDropIndicatorStyle(): React.CSSProperties | undefined {
    if (!showDropBefore && !showDropAfter) {
      return undefined;
    }
    const color = isCloneDrag ? 'var(--color-accent-green)' : 'var(--color-primary)';
    if (showDropBefore) {
      return { boxShadow: `inset 0 2px 0 0 ${color}` };
    }
    return { boxShadow: `inset 0 -2px 0 0 ${color}` };
  }

  function resolveAfterRow(allRows: Row<TData>[], targetRow: Row<TData>, after: boolean): TData | null {
    if (after) {
      return targetRow.original;
    }
    const targetIndex = allRows.findIndex(current => current.id === targetRow.id);
    return allRows[targetIndex - 1]?.original ?? null;
  }

  function handleDragStart(event: React.DragEvent<HTMLTableRowElement>) {
    if (!canReorder) {
      return;
    }
    event.dataTransfer.effectAllowed = 'copyMove';
    event.dataTransfer.setData('text/plain', row.id);
    onChangeIsCloneDrag(false);
    onChangeDraggingRowID(row.id);
  }

  function handleDragOver(event: React.DragEvent<HTMLTableRowElement>) {
    if (!canReorder) {
      return;
    }
    const currentDraggingRowID = draggingRowID;
    if (!currentDraggingRowID) {
      return;
    }
    const isClone = syncCloneDragState(event);
    const draggedRows = getDraggedRows(currentDraggingRowID);
    if (!isClone && draggedRows.some(current => current.id === row.id)) {
      onChangeDropHint(null);
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = isClone ? 'copy' : 'move';
    const after = isDropAfterTarget(event);
    if (dropHint?.rowID !== row.id || dropHint.after !== after) {
      onChangeDropHint({ rowID: row.id, after });
    }
  }

  function handleDrop(event: React.DragEvent<HTMLTableRowElement>) {
    if (!canReorder) {
      return;
    }
    const currentDraggingRowID = draggingRowID ?? event.dataTransfer.getData('text/plain');
    const draggedRows = getDraggedRows(currentDraggingRowID);
    if (draggedRows.length === 0) {
      return;
    }
    const isClone = isCloneModifier(event);
    if (!isClone && draggedRows.some(current => current.id === row.id)) {
      return;
    }
    event.preventDefault();
    const after = isDropAfterTarget(event);
    const allRows = table.getRowModel().rows;
    if (isClone) {
      onRowsReordered?.({
        draggedRows: draggedRows.map(current => current.original),
        afterRow: resolveAfterRow(allRows, row, after),
        isClone: true
      });
    } else {
      const remainingRows = allRows.filter(current => !draggedRows.some(dragged => dragged.id === current.id));
      const targetIndex = remainingRows.findIndex(current => current.id === row.id);
      const afterRow = after ? row : (remainingRows[targetIndex - 1] ?? null);
      onRowsReordered?.({
        draggedRows: draggedRows.map(current => current.original),
        afterRow: afterRow?.original ?? null
      });
    }
    onChangeDraggingRowID(null);
    onChangeIsCloneDrag(false);
    onChangeDropHint(null);
  }

  function handleDragEnd() {
    onChangeDraggingRowID(null);
    onChangeIsCloneDrag(false);
    onChangeDropHint(null);
  }

  const dropIndicatorStyle = getDropIndicatorStyle();

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
        canReorder && isDragging && (isCloneDrag ? 'cursor-copy' : 'cursor-move')
      )}
      style={dropIndicatorStyle ? { ...style, ...dropIndicatorStyle } : style}
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
              ? isCloneDrag
                ? 'cursor-copy'
                : 'cursor-move'
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
