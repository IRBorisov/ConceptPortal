import {
  type Cell,
  type ColumnDef,
  columnSizingFeature,
  columnVisibilityFeature,
  type ColumnVisibilityState,
  createColumnHelper as createTanstackColumnHelper,
  createPaginatedRowModel,
  createSortedRowModel,
  type Header,
  type HeaderGroup,
  type ReactTable,
  type Row,
  type RowData,
  rowPaginationFeature,
  rowSelectionFeature,
  type RowSelectionState as TanstackRowSelectionState,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_datetime,
  sortFn_text,
  tableFeatures
} from '@tanstack/react-table';

/** Features, row models, and named sort functions used by every Portal table. */
export const dataTableFeatures = tableFeatures({
  columnSizingFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    datetime: sortFn_datetime,
    text: sortFn_text
  }
});

export type DataTableFeatures = typeof dataTableFeatures;

/**
 * App row type for table helpers. Object rows stay as-is; unions that include
 * primitives (e.g. `number | Value[]`) keep the object/array branch.
 */
export type DataTableRowData<TData> = [TData] extends [object] ? TData : Extract<TData, object>;

export type DataTableInstance<TData> = ReactTable<DataTableFeatures, DataTableRowData<TData>>;
export type DataTableRow<TData> = Row<DataTableFeatures, DataTableRowData<TData>>;
export type DataTableCell<TData, TValue = unknown> = Cell<DataTableFeatures, DataTableRowData<TData>, TValue>;
export type DataTableHeader<TData, TValue = unknown> = Header<DataTableFeatures, DataTableRowData<TData>, TValue>;
export type DataTableHeaderGroup<TData> = HeaderGroup<DataTableFeatures, DataTableRowData<TData>>;

/**
 * Column definition for Portal tables.
 * Table v9 makes `TValue` invariant, so mixed accessor columns use a wide value type.
 */
export type DataTableColumnDef<TData, TValue = unknown> = ColumnDef<DataTableFeatures, DataTableRowData<TData>, TValue>;

/* Table v9 `ColumnDef` TValue is invariant; mixed accessor columns need a wide value. */
/* eslint-disable @typescript-eslint/no-explicit-any */
export type DataTableColumns<TData> = ColumnDef<DataTableFeatures, DataTableRowData<TData>, any>[];
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Selected row ids. `true` means selected; omitted or false means unselected. */
export type RowSelectionState = Record<string, boolean>;

/** Column id → visible map. Re-exported under the v8 name used by Portal tables. */
export type VisibilityState = ColumnVisibilityState;

export type { TanstackRowSelectionState };

/** Column helper bound to Portal table features so callers only pass row data. */
export function createColumnHelper<TData>() {
  return createTanstackColumnHelper<
    DataTableFeatures,
    DataTableRowData<TData> extends RowData ? DataTableRowData<TData> : RowData
  >();
}
