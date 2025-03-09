'use client';

import clsx from 'clsx';

import { TextURL } from '@/components/Control';
import { createColumnHelper, DataTable, type RowSelectionState, type VisibilityState } from '@/components/DataTable';
import { NoData, TextContent } from '@/components/View';
import { useWindowSize } from '@/hooks/useWindowSize';
import { prefixes } from '@/utils/constants';
import { truncateToSymbol } from '@/utils/utils';

import { BadgeConstituenta } from '../../../components/BadgeConstituenta';
import { labelCstTypification } from '../../../labels';
import { type IConstituenta } from '../../../models/rsform';

interface TableRSListProps {
  items?: IConstituenta[];
  enableSelection: boolean;
  maxHeight?: string;
  selected: RowSelectionState;
  setSelected: React.Dispatch<React.SetStateAction<RowSelectionState>>;

  onEdit: (cstID: number) => void;
  onCreateNew: () => void;
}

// Window width cutoff for columns
const COLUMN_DEFINITION_HIDE_THRESHOLD = 1000;
const COLUMN_TYPE_HIDE_THRESHOLD = 1200;
const COLUMN_CONVENTION_HIDE_THRESHOLD = 1800;

const COMMENT_MAX_SYMBOLS = 100;
const DEFINITION_MAX_SYMBOLS = 120;

// characters - threshold for long typification - truncate
const TYPIFICATION_TRUNCATE = 42;

const columnHelper = createColumnHelper<IConstituenta>();

export function TableRSList({
  items,
  maxHeight,
  enableSelection,
  selected,
  setSelected,
  onEdit,
  onCreateNew
}: TableRSListProps) {
  const windowSize = useWindowSize();

  function handleRowClicked(cst: IConstituenta, event: React.MouseEvent<Element>) {
    if (event.altKey) {
      event.preventDefault();
      onEdit(cst.id);
    }
  }

  function handleRowDoubleClicked(cst: IConstituenta, event: React.MouseEvent<Element>) {
    event.preventDefault();
    onEdit(cst.id);
  }

  const columns = [
    columnHelper.accessor('alias', {
      id: 'alias',
      header: () => <span className='pl-3'>Имя</span>,
      size: 65,
      minSize: 65,
      maxSize: 65,
      cell: props => <BadgeConstituenta value={props.row.original} prefixID={prefixes.cst_list} />
    }),
    columnHelper.accessor(cst => labelCstTypification(cst), {
      id: 'type',
      header: 'Типизация',
      enableHiding: true,
      size: 150,
      minSize: 150,
      maxSize: 200,
      cell: props => (
        <div className='w-40 text-xs break-words'>{truncateToSymbol(props.getValue(), TYPIFICATION_TRUNCATE)}</div>
      )
    }),
    columnHelper.accessor(cst => cst.term_resolved || cst.term_raw || '', {
      id: 'term',
      header: 'Термин',
      size: 500,
      minSize: 150,
      maxSize: 500
    }),
    columnHelper.accessor('definition_formal', {
      id: 'expression',
      header: 'Формальное определение',
      size: 1000,
      minSize: 300,
      maxSize: 1000,
      cell: props => <div className='break-all text-pretty'>{props.getValue()}</div>
    }),
    columnHelper.accessor(cst => cst.definition_resolved || cst.definition_raw || '', {
      id: 'definition',
      header: 'Текстовое определение',
      size: 1000,
      minSize: 200,
      maxSize: 1000,
      cell: props => <TextContent text={props.getValue()} maxLength={DEFINITION_MAX_SYMBOLS} />
    }),
    columnHelper.accessor('convention', {
      id: 'convention',
      header: 'Конвенция / Комментарий',
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
      className={clsx('min-h-64', 'cc-scroll-y', 'text-sm', 'select-none')}
      style={{ maxHeight: maxHeight }}
      data={items ?? []}
      columns={columns}
      headPosition='0rem'
      onRowDoubleClicked={handleRowDoubleClicked}
      onRowClicked={handleRowClicked}
      enableHiding
      columnVisibility={columnVisibility}
      enableRowSelection={enableSelection}
      rowSelection={selected}
      onRowSelectionChange={setSelected}
      noDataComponent={
        <NoData>
          <p>Список пуст</p>
          <p>
            <TextURL text='Создать конституенту...' onClick={onCreateNew} />
          </p>
        </NoData>
      }
    />
  );
}
