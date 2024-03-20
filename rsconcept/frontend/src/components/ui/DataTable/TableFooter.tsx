import { flexRender, Header, HeaderGroup, Table } from '@tanstack/react-table';

interface TableFooterProps<TData> {
  table: Table<TData>;
}

function TableFooter<TData>({ table }: TableFooterProps<TData>) {
  return (
    <tfoot>
      {table.getFooterGroups().map((footerGroup: HeaderGroup<TData>) => (
        <tr key={footerGroup.id}>
          {footerGroup.headers.map((header: Header<TData, unknown>) => (
            <th key={header.id}>
              {!header.isPlaceholder ? flexRender(header.column.columnDef.footer, header.getContext()) : null}
            </th>
          ))}
        </tr>
      ))}
    </tfoot>
  );
}

export default TableFooter;
