'use client';

import { useCallback, useState } from 'react';
import {
  type ColumnSort,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type RowData,
  type RowSelectionState,
  type SortingState,
  type TableOptions,
  type Updater,
  useReactTable,
  type VisibilityState
} from '@tanstack/react-table';

/** Style to conditionally apply to rows. */
export interface IConditionalStyle<TData> {
  /** Callback to determine if the style should be applied. */
  when: (rowData: TData) => boolean;

  /** Style to apply. */
  style: React.CSSProperties;
}

interface UseDataTableProps<TData extends RowData>
  extends Pick<TableOptions<TData>, 'data' | 'columns' | 'onRowSelectionChange' | 'onColumnVisibilityChange'> {
  /** Enable row selection. */
  enableRowSelection?: boolean;

  /** Current row selection. */
  rowSelection?: RowSelectionState;

  /** Enable hiding of columns. */
  enableHiding?: boolean;

  /** Current column visibility. */
  columnVisibility?: VisibilityState;

  /** Enable pagination. */
  enablePagination?: boolean;

  /** Number of rows per page. */
  paginationPerPage?: number;

  /** Callback to be called when the pagination option is changed. */
  onChangePaginationOption?: (newValue: number) => void;

  /** Enable sorting. */
  enableSorting?: boolean;

  /** Initial sorting. */
  initialSorting?: ColumnSort;
}

/**
 * Dta representation as a table.
 *
 * @param headPosition - Top position of sticky header (0 if no other sticky elements are present).
 * No sticky header if omitted
 */
export function useDataTable<TData extends RowData>({
  enableRowSelection,
  rowSelection,

  enableHiding,
  columnVisibility,

  enableSorting,
  initialSorting,

  enablePagination,
  paginationPerPage = 10,
  onChangePaginationOption,

  ...restProps
}: UseDataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>(initialSorting ? [initialSorting] : []);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: paginationPerPage
  });

  const handleChangePagination = useCallback(
    (updater: Updater<PaginationState>) => {
      setPagination(prev => {
        const resolvedValue = typeof updater === 'function' ? updater(prev) : updater;
        if (onChangePaginationOption && prev.pageSize !== resolvedValue.pageSize) {
          onChangePaginationOption(resolvedValue.pageSize);
        }
        return resolvedValue;
      });
    },
    [onChangePaginationOption]
  );

  const table = useReactTable({
    state: {
      pagination: pagination,
      sorting: sorting,
      rowSelection: rowSelection,
      columnVisibility: columnVisibility
    },

    getCoreRowModel: getCoreRowModel(),

    enableSorting: enableSorting,
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    onSortingChange: enableSorting ? setSorting : undefined,

    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    onPaginationChange: enablePagination ? handleChangePagination : undefined,

    enableHiding: enableHiding,
    enableMultiRowSelection: enableRowSelection,
    enableRowSelection: enableRowSelection,
    ...restProps
  });
  return table;
}
