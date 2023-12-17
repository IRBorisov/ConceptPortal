import { flexRender, Header, HeaderGroup, Table } from '@tanstack/react-table';

import SelectAll from './SelectAll';
import SortingIcon from './SortingIcon';

interface TableHeaderProps<TData> {
  table: Table<TData>
  headPosition?: string
  enableRowSelection?: boolean
  enableSorting?: boolean
}

function TableHeader<TData>({
  table, headPosition,
  enableRowSelection, enableSorting
}: TableHeaderProps<TData>) {  
  return (
  <thead
    className={`clr-app shadow-border`}
    style={{
      top: headPosition,
      position: 'sticky'
    }}
  >
  {table.getHeaderGroups().map(
  (headerGroup: HeaderGroup<TData>) => (
    <tr key={headerGroup.id}>
      {enableRowSelection ?
      <th className='pl-3 pr-1'>
        <SelectAll table={table} />
      </th> : null}
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
          {!header.isPlaceholder ? (
          <div className='flex gap-1'>
            {flexRender(header.column.columnDef.header, header.getContext())}
            {(enableSorting && header.column.getCanSort()) ? <SortingIcon column={header.column} /> : null}
          </div>) : null}
        </th>
      ))}
    </tr>
  ))}
  </thead>);
}

export default TableHeader;