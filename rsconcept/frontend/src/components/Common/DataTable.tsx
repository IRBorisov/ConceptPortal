import { Cell, flexRender, getCoreRowModel, 
  getPaginationRowModel, 
  getSortedRowModel, 
  Header, HeaderGroup, Row, RowData, TableOptions, useReactTable
} from '@tanstack/react-table';

import Checkbox from './Checkbox';
import Tristate from './Tristate';

export interface DataTableProps<TData extends RowData>
extends Omit<TableOptions<TData>, 'getCoreRowModel' | 'getSortedRowModel'| 'getPaginationRowModel'> {
  onRowClicked?: (row: TData, event: React.MouseEvent<Element, MouseEvent>) => void
  onRowDoubleClicked?: (row: TData, event: React.MouseEvent<Element, MouseEvent>) => void
  noDataComponent?: React.ReactNode
  pagination?: boolean
}

function defaultNoDataComponent() {
  return (
  <div className='p-2 text-center'>
    Данные отсутствуют
  </div>);
}

export default function DataTable<TData extends RowData>({
  onRowClicked, onRowDoubleClicked, noDataComponent=defaultNoDataComponent(),
  enableRowSelection, enableMultiRowSelection,
  pagination,
  ...options
}: DataTableProps<TData>) {
  // const [sorting, setSorting] = React.useState<SortingState>([])
  
  const tableImpl = useReactTable({
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: options.enableSorting ? getSortedRowModel() : undefined,
    getPaginationRowModel: pagination ? getPaginationRowModel() : undefined,
    
    state: {
      ...options.state
    },
    // onSortingChange: setSorting,
    enableRowSelection: enableRowSelection,
    enableMultiRowSelection: enableMultiRowSelection,
    ...options
  });

  const isEmpty = tableImpl.getRowModel().rows.length === 0;

  return (
    <div className='w-full'>
    {isEmpty && noDataComponent}
    {!isEmpty &&
    <table>
      <thead>
      {tableImpl.getHeaderGroups().map(
      (headerGroup: HeaderGroup<TData>) => (
        <tr key={headerGroup.id}>
        {(enableRowSelection ?? enableMultiRowSelection) && 
        <th className='pl-3 pr-1'>
          <Tristate
            tabIndex={-1}
            value={
              !tableImpl.getIsAllPageRowsSelected() && tableImpl.getIsSomePageRowsSelected() ? null :
              tableImpl.getIsAllPageRowsSelected()
            }
            tooltip='Выделить все'
            setValue={value => tableImpl.toggleAllPageRowsSelected(value !== false)}
          />
        </th>
        }
        {headerGroup.headers.map(
        (header: Header<TData, unknown>) => (
          <th key={header.id}
            colSpan={header.colSpan}
            className='p-2 text-xs font-semibold select-none whitespace-nowrap'
            style={{
              textAlign: header.getSize() > 100 ? 'left': 'center',
              width: header.getSize()
            }}
          >
            {/* {header.isPlaceholder ? null : (
                      <div
                        {...{
                          className: header.column.getCanSort()
                            ? 'cursor-pointer select-none'
                            : '',
                          onClick: header.column.getToggleSortingHandler(),
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: ' 🔼',
                          desc: ' 🔽',
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )} */}
            {header.isPlaceholder ? null
              : flexRender(header.column.columnDef.header, header.getContext())
            }
          </th>
        ))}
        </tr>
      ))}
      </thead>

      <tbody>
      {tableImpl.getRowModel().rows.map(
      (row: Row<TData>) => (
        <tr
          key={row.id}
          className={
            row.getIsSelected() ? 'clr-selected clr-hover' :
            row.index % 2 === 0 ? 'clr-controls clr-hover' :
            'clr-app clr-hover'
          }
        >
        {(enableRowSelection ?? enableMultiRowSelection) && 
        <td className='pl-3 pr-1 border-y'>
          <Checkbox
            tabIndex={-1}
            value={row.getIsSelected()}
            setValue={row.getToggleSelectedHandler()}
          />
        </td>
        }
        {row.getVisibleCells().map(
        (cell: Cell<TData, unknown>) => (
          <td
            key={cell.id}
            className='px-2 py-1 border-y'
            style={{
              cursor: onRowClicked || onRowDoubleClicked ? 'pointer': 'auto'
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
    </table>}
{/* 
    <div className="h-2" />
      <div className="flex items-center gap-2">
        <button
          className="p-1 border rounded"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          {'<<'}
        </button>
        <button
          className="p-1 border rounded"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {'<'}
        </button>
        <button
          className="p-1 border rounded"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {'>'}
        </button>
        <button
          className="p-1 border rounded"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          {'>>'}
        </button>
        <span className="flex items-center gap-1">
          <div>Page</div>
          <strong>
            {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </strong>
        </span>
        <span className="flex items-center gap-1">
          | Go to page:
          <input
            type="number"
            defaultValue={table.getState().pagination.pageIndex + 1}
            onChange={e => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0
              table.setPageIndex(page)
            }}
            className="w-16 p-1 border rounded"
          />
        </span>
        <select
          value={table.getState().pagination.pageSize}
          onChange={e => {
            table.setPageSize(Number(e.target.value))
          }}
        >
          {[10, 20, 30, 40, 50].map(pageSize => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
      <div className="h-4" />
      <button onClick={() => rerender()} className="p-2 border">
        Rerender
      </button>
    </div>
  ) */}
    </div>
  );
}

// import { TableOptions, useReactTable } from '@tanstack/react-table'

// import { useConceptTheme } from '../../context/ThemeContext';
// import { dataTableDarkT, dataTableLightT } from '../../utils/color';

// export interface SelectionInfo<T> {
//   allSelected: boolean
//   selectedCount: number
//   selectedRows: T[]
// }

// interface DataTableProps<T>
// extends TableOptions<T>{}

// function DataTable<T>({ ...props }: DataTableProps<T>) {
//   const { darkMode } = useConceptTheme();
//   const table = useReactTable(props);

//   return (
//     <DataTable<T>
//       theme={ theme ?? (darkMode ? 'customDark' : 'customLight')}
//       paginationComponentOptions={{
//         rowsPerPageText: 'строк на страницу'
//       }}
//       {...props}
//     />
//   );
// }

// export default DataTable;
