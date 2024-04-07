'use client';

import {
  ColumnSort,
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  RowData,
  type RowSelectionState,
  SortingState,
  TableOptions,
  useReactTable,
  type VisibilityState
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';

import { CProps } from '../../props';
import DefaultNoData from './DefaultNoData';
import PaginationTools from './PaginationTools';
import TableBody from './TableBody';
import TableFooter from './TableFooter';
import TableHeader from './TableHeader';

export { createColumnHelper, type ColumnSort, type RowSelectionState, type VisibilityState };

export interface IConditionalStyle<TData> {
  when: (rowData: TData) => boolean;
  style: React.CSSProperties;
}

export interface DataTableProps<TData extends RowData>
  extends CProps.Styling,
    Pick<TableOptions<TData>, 'data' | 'columns' | 'onRowSelectionChange' | 'onColumnVisibilityChange'> {
  id?: string;
  dense?: boolean;
  rows?: number;
  contentHeight?: string;
  headPosition?: string;
  noHeader?: boolean;
  noFooter?: boolean;

  conditionalRowStyles?: IConditionalStyle<TData>[];
  noDataComponent?: React.ReactNode;

  onRowClicked?: (rowData: TData, event: CProps.EventMouse) => void;
  onRowDoubleClicked?: (rowData: TData, event: CProps.EventMouse) => void;

  enableRowSelection?: boolean;
  rowSelection?: RowSelectionState;

  enableHiding?: boolean;
  columnVisibility?: VisibilityState;

  enablePagination?: boolean;
  paginationPerPage?: number;
  paginationOptions?: number[];
  onChangePaginationOption?: (newValue: number) => void;

  enableSorting?: boolean;
  initialSorting?: ColumnSort;
}

/**
 * UI element: data representation as a table.
 *
 * @param headPosition - Top position of sticky header (0 if no other sticky elements are present).
 * No sticky header if omitted
 */
function DataTable<TData extends RowData>({
  id,
  style,
  className,
  dense,
  rows,
  contentHeight = '1.1875rem',
  headPosition,
  conditionalRowStyles,
  noFooter,
  noHeader,
  onRowClicked,
  onRowDoubleClicked,
  noDataComponent,

  enableRowSelection,
  rowSelection,

  enableHiding,
  columnVisibility,

  enableSorting,
  initialSorting,

  enablePagination,
  paginationPerPage = 10,
  paginationOptions = [10, 20, 30, 40, 50],
  onChangePaginationOption,

  ...restProps
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>(initialSorting ? [initialSorting] : []);
  const [lastSelected, setLastSelected] = useState<string | undefined>(undefined);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: paginationPerPage
  });

  const tableImpl = useReactTable({
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,

    state: {
      pagination: pagination,
      sorting: sorting,
      rowSelection: rowSelection ?? {},
      columnVisibility: columnVisibility ?? {}
    },
    enableHiding: enableHiding,
    onPaginationChange: enablePagination ? setPagination : undefined,
    onSortingChange: enableSorting ? setSorting : undefined,
    enableMultiRowSelection: enableRowSelection,
    ...restProps
  });

  const isEmpty = tableImpl.getRowModel().rows.length === 0;

  // TODO: refactor formula for different font sizes and pagination tools
  const fixedSize = useMemo(() => {
    if (!rows) {
      return undefined;
    }
    if (dense) {
      return `calc(2px + (2px + ${contentHeight} + 0.5rem)*${rows} + ${noHeader ? '0px' : '(2px + 2.1875rem)'})`;
    } else {
      return `calc(2px + (2px + ${contentHeight} + 1rem)*${rows + (noHeader ? 0 : 1)})`;
    }
  }, [rows, dense, noHeader, contentHeight]);

  return (
    <div id={id} className={className} style={{ minHeight: fixedSize, maxHeight: fixedSize, ...style }}>
      <table className='w-full'>
        {!noHeader ? (
          <TableHeader
            table={tableImpl}
            enableRowSelection={enableRowSelection}
            enableSorting={enableSorting}
            headPosition={headPosition}
            setLastSelected={setLastSelected}
          />
        ) : null}

        <TableBody
          table={tableImpl}
          dense={dense}
          conditionalRowStyles={conditionalRowStyles}
          enableRowSelection={enableRowSelection}
          lastSelected={lastSelected}
          setLastSelected={setLastSelected}
          onRowClicked={onRowClicked}
          onRowDoubleClicked={onRowDoubleClicked}
        />

        {!noFooter ? <TableFooter table={tableImpl} /> : null}
      </table>

      {enablePagination && !isEmpty ? (
        <PaginationTools
          id={id ? `${id}__pagination` : undefined}
          table={tableImpl}
          paginationOptions={paginationOptions}
          onChangePaginationOption={onChangePaginationOption}
        />
      ) : null}
      {isEmpty ? noDataComponent ?? <DefaultNoData /> : null}
    </div>
  );
}

export default DataTable;
