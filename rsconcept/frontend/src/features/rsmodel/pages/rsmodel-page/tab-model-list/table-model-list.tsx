'use client';

import { useTx } from '@/i18n';
import { type Constituenta } from '@rsconcept/domain/library';
import { labelType } from '@rsconcept/domain/rslang/labels';

import { BadgeConstituenta } from '@/features/rsform/components/badge-constituenta';
import { BadgeEvaluation } from '@/features/rsmodel/components/badge-evaluation';

import { TextURL } from '@/components/control';
import {
  createColumnHelper,
  DataTable,
  type DataTableRowDrop,
  type RowSelectionState,
  type VisibilityState
} from '@/components/data-table';
import { NoData, TextContent } from '@/components/view';
import { useWindowSize } from '@/hooks/use-window-size';
import { prefixes } from '@/utils/constants';
import { truncateToSymbol } from '@/utils/format';

import { useModelEdit } from '../model-edit-context';

interface TableModelListProps {
  items?: Constituenta[];
  enableSelection: boolean;
  maxHeight?: string;
  selected: RowSelectionState;
  setSelected: React.Dispatch<React.SetStateAction<RowSelectionState>>;
  enableRowReordering?: boolean;

  onEdit: (cstID: number) => void;
  onCreateNew: () => void;
  onMoveRows?: (event: DataTableRowDrop<Constituenta>) => void;
}

// Window width cutoff for columns
const COLUMN_DEFINITION_HIDE_THRESHOLD = 9500;
const COLUMN_TYPE_HIDE_THRESHOLD = 1150;
const COLUMN_CONVENTION_HIDE_THRESHOLD = 1700;

const COMMENT_MAX_SYMBOLS = 100;
const DEFINITION_MAX_SYMBOLS = 120;

// characters - threshold for long typification - truncate
const TYPIFICATION_TRUNCATE = 42;

const columnHelper = createColumnHelper<Constituenta>();

export function TableModelList({
  items,
  maxHeight,
  enableSelection,
  selected,
  setSelected,
  enableRowReordering,
  onEdit,
  onCreateNew,
  onMoveRows
}: TableModelListProps) {
  const tx = useTx();
  const { engine } = useModelEdit();
  const windowSize = useWindowSize();

  function handleRowClicked(cst: Constituenta, event: React.MouseEvent<Element>) {
    if (event.altKey) {
      event.preventDefault();
      onEdit(cst.id);
    }
  }

  function handleRowDoubleClicked(cst: Constituenta, event: React.MouseEvent<Element>) {
    event.preventDefault();
    onEdit(cst.id);
  }

  function handleRowsReordered(event: DataTableRowDrop<Constituenta>) {
    onMoveRows?.(event);
  }

  const columns = [
    columnHelper.accessor('alias', {
      id: 'alias',
      header: () => <span className='pl-3 min-w-12'>{tx('tx.lib.alias.short')}</span>,
      size: 65,
      minSize: 65,
      maxSize: 65,
      cell: props => <BadgeConstituenta value={props.row.original} prefixID={prefixes.cst_list} />
    }),
    columnHelper.accessor(cst => cst, {
      id: 'value',
      header: tx('tx.rslang.value.short'),
      size: 60,
      minSize: 60,
      maxSize: 60,
      cell: props => <BadgeEvaluation cst={props.row.original} engine={engine} />
    }),
    columnHelper.accessor(cst => labelType(cst.effectiveType), {
      id: 'type',
      header: () => <span className='min-w-40 wrap-anywhere'>{tx('tx.rslang.typification')}</span>,
      enableHiding: true,
      size: 150,
      minSize: 150,
      maxSize: 200,
      cell: props => (
        <div className='w-40 text-xs wrap-break-word'>{truncateToSymbol(props.getValue(), TYPIFICATION_TRUNCATE)}</div>
      )
    }),
    columnHelper.accessor(cst => cst.term_resolved || cst.term_raw || '', {
      id: 'term',
      header: () => <span className='min-w-30'>{tx('tx.lang.term')}</span>,
      size: 500,
      minSize: 150,
      maxSize: 500
    }),
    columnHelper.accessor('definition_formal', {
      id: 'expression',
      header: tx('tx.lib.defineFormal'),
      size: 1000,
      minSize: 300,
      maxSize: 1000,
      cell: props => <div className='break-all text-pretty'>{props.getValue()}</div>
    }),
    columnHelper.accessor(cst => cst.definition_resolved || cst.definition_raw || '', {
      id: 'definition',
      header: tx('tx.lib.defineText'),
      size: 1000,
      minSize: 200,
      maxSize: 1000,
      cell: props => <TextContent text={props.getValue()} maxLength={DEFINITION_MAX_SYMBOLS} />
    }),
    columnHelper.accessor('convention', {
      id: 'convention',
      header: `${tx('tx.lib.convention')} / ${tx('tx.lib.comment')}`,
      size: 500,
      minSize: 100,
      maxSize: 500,
      enableHiding: true,
      cell: props => <TextContent text={props.getValue()} maxLength={COMMENT_MAX_SYMBOLS} />
    })
  ];

  const columnVisibility: VisibilityState = {
    type: (windowSize.width ?? 0) >= COLUMN_TYPE_HIDE_THRESHOLD,
    convention: (windowSize.width ?? 0) >= COLUMN_CONVENTION_HIDE_THRESHOLD,
    definition: (windowSize.width ?? 0) >= COLUMN_DEFINITION_HIDE_THRESHOLD
  };

  return (
    <DataTable
      dense
      noFooter
      className='min-h-64 cc-scroll-y text-sm select-none'
      style={{ maxHeight: maxHeight }}
      data={items ?? []}
      columns={columns}
      onRowDoubleClicked={handleRowDoubleClicked}
      onRowClicked={handleRowClicked}
      enableHiding
      columnVisibility={columnVisibility}
      enableRowSelection={enableSelection}
      rowSelection={selected}
      onRowSelectionChange={setSelected}
      enableRowReordering={enableRowReordering}
      onRowsReordered={onMoveRows ? handleRowsReordered : undefined}
      noDataComponent={
        <NoData>
          <p>{tx('tx.list.empty')}</p>
          <p>
            <TextURL text={tx('tx.cst.create')} onClick={onCreateNew} />
          </p>
        </NoData>
      }
    />
  );
}
