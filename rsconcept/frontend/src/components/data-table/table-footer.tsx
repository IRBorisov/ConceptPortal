'use no memo';

import { type DataTableHeader, type DataTableHeaderGroup, type DataTableInstance } from './table-features';

interface TableFooterProps<TData> {
  /** TanStack table instance. */
  table: DataTableInstance<TData>;
}

/** Renders column footer cells from TanStack column definitions. */
export function TableFooter<TData>({ table }: TableFooterProps<TData>) {
  return (
    <tfoot>
      {table.getFooterGroups().map((footerGroup: DataTableHeaderGroup<TData>) => (
        <tr key={footerGroup.id}>
          {footerGroup.headers.map((header: DataTableHeader<TData>) => (
            <th key={header.id}>{!header.isPlaceholder ? <table.FlexRender footer={header} /> : null}</th>
          ))}
        </tr>
      ))}
    </tfoot>
  );
}
