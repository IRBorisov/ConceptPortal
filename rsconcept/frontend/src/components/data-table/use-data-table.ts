'use client';
'use no memo';

import { useState } from 'react';
import {
  type ColumnSort,
  type PaginationState,
  type SortingState,
  type TableOptions,
  useTable
} from '@tanstack/react-table';

import {
  type DataTableColumns,
  type DataTableFeatures,
  dataTableFeatures,
  type DataTableInstance,
  type DataTableRowData,
  type RowSelectionState,
  type TanstackRowSelectionState,
  type VisibilityState
} from './table-features';

/** Style to conditionally apply to rows. */
export interface IConditionalStyle<TData> {
  /** Callback to determine if the style should be applied. */
  when: (rowData: TData) => boolean;

  /** Style to apply. */
  style?: React.CSSProperties;

  /** Classname to apply. */
  className?: string;
}

interface UseDataTableProps<TData> extends Pick<
  TableOptions<DataTableFeatures, DataTableRowData<TData>>,
  'getRowId' | 'onColumnVisibilityChange'
> {
  /** Table rows. */
  data: readonly TData[];

  /** Column definitions bound to Portal table features. */
  columns: DataTableColumns<TData>;

  /** Called when row selection changes. */
  onRowSelectionChange?: React.Dispatch<React.SetStateAction<RowSelectionState>>;

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

  /** Enable sorting. */
  enableSorting?: boolean;

  /** Initial sorting. */
  initialSorting?: ColumnSort;

  /** Auto reset page index when table state changes. */
  autoResetPageIndex?: boolean;
}

/** Data representation as a table. */
export function useDataTable<TData>({
  data,
  columns,
  enableRowSelection,
  rowSelection,
  onRowSelectionChange,

  enableHiding,
  columnVisibility,

  enableSorting,
  initialSorting,

  enablePagination,
  paginationPerPage = 10,

  autoResetPageIndex,

  ...restProps
}: UseDataTableProps<TData>): DataTableInstance<TData> {
  const [sorting, setSorting] = useState<SortingState>(initialSorting ? [initialSorting] : []);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: paginationPerPage
  });

  return useTable({
    features: dataTableFeatures,
    data: data as DataTableRowData<TData>[],
    columns: columns,
    state: {
      pagination: enablePagination ? pagination : { pageIndex: 0, pageSize: Infinity },
      sorting: sorting,
      ...(enableRowSelection ? { rowSelection: (rowSelection ?? {}) as TanstackRowSelectionState } : {}),
      columnVisibility: columnVisibility
    },

    enableSorting: enableSorting,
    onSortingChange: enableSorting ? setSorting : undefined,

    onPaginationChange: enablePagination ? setPagination : undefined,
    autoResetPageIndex: autoResetPageIndex,

    enableHiding: enableHiding,
    enableMultiRowSelection: !!enableRowSelection,
    enableRowSelection: !!enableRowSelection,
    enableRowRangeSelection: false,
    onRowSelectionChange: onRowSelectionChange as TableOptions<
      DataTableFeatures,
      DataTableRowData<TData>
    >['onRowSelectionChange'],
    ...restProps
  });
}
