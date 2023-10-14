import {
  Cell, ColumnSort,
  createColumnHelper, flexRender, getCoreRowModel,
  getPaginationRowModel,   getSortedRowModel, Header, HeaderGroup,
  PaginationState, Row, RowData, type RowSelectionState,
  SortingState, TableOptions, useReactTable, type VisibilityState
} from '@tanstack/react-table';
import { useState } from 'react';

import DefaultNoData from './DefaultNoData';
import PaginationTools from './PaginationTools';
import SelectAll from './SelectAll';
import SelectRow from './SelectRow';
import SortingIcon from './SortingIcon';

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
  dense?: boolean
  headPosition?: string
  conditionalRowStyles?: IConditionalStyle<TData>[]
  onRowClicked?: (rowData: TData, event: React.MouseEvent<Element, MouseEvent>) => void
  onRowDoubleClicked?: (rowData: TData, event: React.MouseEvent<Element, MouseEvent>) => void
  noDataComponent?: React.ReactNode

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
export default function DataTable<TData extends RowData>({
  dense, headPosition, conditionalRowStyles,
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

  ...options
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
    ...options
  });

  const isEmpty = tableImpl.getRowModel().rows.length === 0;

  function getRowStyles(row: Row<TData>) {
    return  {...conditionalRowStyles!
      .filter(item => item.when(row.original))
      .reduce((prev, item) => ({...prev, ...item.style}), {})
  };
  }

  return (
  <div className='w-full'>
  <div className='flex flex-col items-stretch'>
    <table>
      <thead
        className={`clr-app shadow-border`}
        style={{
          top: headPosition,
          position: 'sticky',
          visibility: !isEmpty ? 'visible' : 'hidden'
        }}
      >
      {tableImpl.getHeaderGroups().map(
      (headerGroup: HeaderGroup<TData>) => (
        <tr key={headerGroup.id}>
          {enableRowSelection && 
          <th className='pl-3 pr-1'>
            <SelectAll table={tableImpl} />
          </th>}
          {headerGroup.headers.map(
          (header: Header<TData, unknown>) => (
            <th key={header.id}
              colSpan={header.colSpan}
              className='px-2 py-2 text-xs font-semibold select-none whitespace-nowrap'
              style={{
                textAlign: header.getSize() > 100 ? 'left': 'center',
                width: header.getSize(),
                cursor: enableSorting && header.column.getCanSort() ? 'pointer': 'auto',
              }}
              onClick={enableSorting ? header.column.getToggleSortingHandler() : undefined}
            >
              {header.isPlaceholder ? null : (
              <div className='flex gap-1'>
                {flexRender(header.column.columnDef.header, header.getContext())}
                {enableSorting && header.column.getCanSort() && <SortingIcon column={header.column} />}
              </div>)}
            </th>
          ))}
        </tr>
      ))}
      </thead>
      
      <tbody>
      {tableImpl.getRowModel().rows.map(
      (row: Row<TData>, index) => (
        <tr
          key={row.id}
          className={
            row.getIsSelected() ? 'clr-selected clr-hover' :
            index % 2 === 0 ? 'clr-controls clr-hover' : 'clr-app clr-hover'
          }
          style={conditionalRowStyles && getRowStyles(row)}
        >
          {enableRowSelection && 
          <td key={`select-${row.id}`} className='pl-3 pr-1 border-y'>
            <SelectRow row={row} />
          </td>}
          {row.getVisibleCells().map(
          (cell: Cell<TData, unknown>) => (
            <td
              key={cell.id}
              className='px-2 border-y'
              style={{
                cursor: onRowClicked || onRowDoubleClicked ? 'pointer': 'auto',
                paddingBottom: dense ? '0.25rem': '0.5rem',
                paddingTop: dense ? '0.25rem': '0.5rem'
              }}
              onClick={event => onRowClicked && onRowClicked(row.original, event)}
              onDoubleClick={event => onRowDoubleClicked && onRowDoubleClicked(row.original, event)}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          ))}
        </tr>
      ))}
      </tbody>

      <tfoot>
      {tableImpl.getFooterGroups().map(
      (footerGroup: HeaderGroup<TData>) => (
        <tr key={footerGroup.id}>
        {footerGroup.headers.map(
        (header: Header<TData, unknown>) => (
          <th key={header.id}>
            {header.isPlaceholder ? null
              : flexRender(header.column.columnDef.footer, header.getContext())
            }
          </th>
          ))}
        </tr>
        ))}
      </tfoot>
    </table>
    
    {enablePagination && !isEmpty &&
    <PaginationTools
      table={tableImpl}
      paginationOptions={paginationOptions}
      onChangePaginationOption={onChangePaginationOption}
    />}
  </div>
  {isEmpty && (noDataComponent ?? <DefaultNoData />)}
  </div>);
}
