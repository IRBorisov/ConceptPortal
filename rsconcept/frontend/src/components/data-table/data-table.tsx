'use client';
'use no memo';

import { useMemo, useState } from 'react';
import {
  type ColumnSort,
  createColumnHelper,
  type RowData,
  type RowSelectionState,
  type TableOptions,
  type VisibilityState
} from '@tanstack/react-table';

import { type Styling } from '../props';
import { cn } from '../utils';

import { DefaultNoData } from './default-no-data';
import { PaginationTools } from './pagination-tools';
import { TableBody } from './table-body';
import { TableFooter } from './table-footer';
import { TableHeader } from './table-header';
import { type IConditionalStyle, useDataTable } from './use-data-table';

export { createColumnHelper, type RowSelectionState, type VisibilityState };

export interface DataTableProps<TData extends RowData>
  extends Styling,
    Pick<TableOptions<TData>, 'data' | 'columns' | 'onRowSelectionChange' | 'onColumnVisibilityChange'> {
  /** Id of the component. */
  id?: string;

  /** Indicates that padding should be minimal. */
  dense?: boolean;

  /** Number of rows to display. */
  rows?: number;

  /** Height of the content. */
  contentHeight?: string;

  /** Top position of sticky header (0 if no other sticky elements are present). */
  headPosition?: string;

  /** Disable header. */
  noHeader?: boolean;

  /** Disable footer. */
  noFooter?: boolean;

  /** List of styles to conditionally apply to rows. */
  conditionalRowStyles?: IConditionalStyle<TData>[];

  /** Component to display when there is no data. */
  noDataComponent?: React.ReactNode;

  /** Callback to be called when a row is clicked. */
  onRowClicked?: (rowData: TData, event: React.MouseEvent<Element>) => void;

  /** Callback to be called when a row is double clicked. */
  onRowDoubleClicked?: (rowData: TData, event: React.MouseEvent<Element>) => void;

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

  /** List of options to choose from for pagination. */
  paginationOptions?: readonly number[];

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
export function DataTable<TData extends RowData>({
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

  onChangePaginationOption,
  paginationPerPage,
  paginationOptions = [10, 20, 30, 40, 50],

  ...restProps
}: DataTableProps<TData>) {
  const [lastSelected, setLastSelected] = useState<string | null>(null);

  const table = useDataTable({ paginationPerPage, ...restProps });

  const isEmpty = table.getRowModel().rows.length === 0;

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

  const columnSizeVars = useMemo(() => {
    const headers = table.getFlatHeaders();
    const colSizes: Record<string, number> = {};
    for (const header of headers) {
      colSizes[`--header-${header.id}-size`] = header.getSize();
      colSizes[`--col-${header.column.id}-size`] = header.column.getSize();
    }
    return colSizes;
  }, [table]);

  return (
    <div
      tabIndex={-1}
      id={id}
      className={cn('table-auto', className)}
      style={{ minHeight: fixedSize, maxHeight: fixedSize, ...style }}
    >
      <table className='w-full' style={{ ...columnSizeVars }}>
        {!noHeader ? (
          <TableHeader table={table} headPosition={headPosition} resetLastSelected={() => setLastSelected(null)} />
        ) : null}

        <TableBody
          table={table}
          dense={dense}
          noHeader={noHeader}
          conditionalRowStyles={conditionalRowStyles}
          lastSelected={lastSelected}
          onChangeLastSelected={setLastSelected}
          onRowClicked={onRowClicked}
          onRowDoubleClicked={onRowDoubleClicked}
        />

        {!noFooter ? <TableFooter table={table} /> : null}
      </table>

      {!!paginationPerPage && !isEmpty ? (
        <PaginationTools
          id={id ? `${id}__pagination` : undefined}
          table={table}
          onChangePaginationOption={onChangePaginationOption}
          paginationOptions={paginationOptions}
        />
      ) : null}
      {isEmpty ? noDataComponent ?? <DefaultNoData /> : null}
    </div>
  );
}
