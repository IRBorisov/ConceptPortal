'use client';

import {
  ColumnSort,
  createColumnHelper, getCoreRowModel,
  getPaginationRowModel, getSortedRowModel,
  PaginationState, RowData, type RowSelectionState,
  SortingState, TableOptions, useReactTable, type VisibilityState
} from '@tanstack/react-table';
import clsx from 'clsx';
import { useState } from 'react';

import DefaultNoData from './DefaultNoData';
import PaginationTools from './PaginationTools';
import TableBody from './TableBody';
import TableFooter from './TableFooter';
import TableHeader from './TableHeader';

export { createColumnHelper, type ColumnSort, type RowSelectionState, type VisibilityState };

export interface IConditionalStyle<TData> {
  when: (rowData: TData) => boolean
  style: React.CSSProperties
}

export interface DataTableProps<TData extends RowData>
extends Pick<TableOptions<TData>, 
  'data' | 'columns' |
  'onRowSelectionChange' | 'onColumnVisibilityChange'
> {
  style?: React.CSSProperties
  className?: string

  dense?: boolean
  headPosition?: string
  noHeader?: boolean
  noFooter?: boolean

  conditionalRowStyles?: IConditionalStyle<TData>[]
  noDataComponent?: React.ReactNode

  onRowClicked?: (rowData: TData, event: React.MouseEvent<Element, MouseEvent>) => void
  onRowDoubleClicked?: (rowData: TData, event: React.MouseEvent<Element, MouseEvent>) => void

  enableRowSelection?: boolean
  rowSelection?: RowSelectionState

  enableHiding?: boolean
  columnVisibility?: VisibilityState

  enablePagination?: boolean
  paginationPerPage?: number
  paginationOptions?: number[]
  onChangePaginationOption?: (newValue: number) => void

  enableSorting?: boolean
  initialSorting?: ColumnSort
}

/**
 * UI element: data representation as a table.
 * 
 * @param headPosition - Top position of sticky header (0 if no other sticky elements are present). 
 * No sticky header if omitted
*/
function DataTable<TData extends RowData>({
  style, className,
  dense, headPosition, conditionalRowStyles, noFooter, noHeader,
  onRowClicked, onRowDoubleClicked, noDataComponent,

  enableRowSelection,
  rowSelection,

  enableHiding,
  columnVisibility,

  enableSorting,
  initialSorting,

  enablePagination,
  paginationPerPage=10,
  paginationOptions=[10, 20, 30, 40, 50],
  onChangePaginationOption,

  ...restProps
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>(initialSorting ? [initialSorting] : []);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: paginationPerPage,
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

  return (
  <div className={clsx(className)} style={style}>
    <table className='w-full'>
      {!noHeader ?
      <TableHeader 
        table={tableImpl}
        enableRowSelection={enableRowSelection}
        enableSorting={enableSorting}
        headPosition={headPosition}
      />: null}
      
      <TableBody
        table={tableImpl}
        dense={dense}
        conditionalRowStyles={conditionalRowStyles}
        enableRowSelection={enableRowSelection}
        onRowClicked={onRowClicked}
        onRowDoubleClicked={onRowDoubleClicked}
      />
      
      {!noFooter ?
      <TableFooter
        table={tableImpl}
       />: null}
    </table>
    
    {(enablePagination && !isEmpty) ?
    <PaginationTools
      table={tableImpl}
      paginationOptions={paginationOptions}
      onChangePaginationOption={onChangePaginationOption}
    /> : null}
    {isEmpty ? (noDataComponent ?? <DefaultNoData />) : null}
  </div>);
}

export default DataTable;