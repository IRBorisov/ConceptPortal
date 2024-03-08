'use client';

import clsx from 'clsx';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';

import ConstituentaBadge from '@/components/ConstituentaBadge';
import DataTable, { createColumnHelper, RowSelectionState, VisibilityState } from '@/components/DataTable';
import FlexColumn from '@/components/ui/FlexColumn';
import { useConceptTheme } from '@/context/ThemeContext';
import useWindowSize from '@/hooks/useWindowSize';
import { IConstituenta } from '@/models/rsform';
import { prefixes } from '@/utils/constants';
import { labelCstTypification } from '@/utils/labels';

interface RSTableProps {
  items?: IConstituenta[];
  enableSelection: boolean;
  selected: RowSelectionState;
  setSelected: React.Dispatch<React.SetStateAction<RowSelectionState>>;

  onEdit: (cstID: number) => void;
  onCreateNew: () => void;
}

// Window width cutoff for columns
const COLUMN_DEFINITION_HIDE_THRESHOLD = 1000;
const COLUMN_TYPE_HIDE_THRESHOLD = 1200;
const COLUMN_CONVENTION_HIDE_THRESHOLD = 1800;

const columnHelper = createColumnHelper<IConstituenta>();

function RSTable({ items, enableSelection, selected, setSelected, onEdit, onCreateNew }: RSTableProps) {
  const { colors, noNavigation } = useConceptTheme();
  const windowSize = useWindowSize();

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  useLayoutEffect(() => {
    setColumnVisibility({
      type: (windowSize.width ?? 0) >= COLUMN_TYPE_HIDE_THRESHOLD,
      convention: (windowSize.width ?? 0) >= COLUMN_CONVENTION_HIDE_THRESHOLD,
      definition: (windowSize.width ?? 0) >= COLUMN_DEFINITION_HIDE_THRESHOLD
    });
  }, [windowSize]);

  const handleRowClicked = useCallback(
    (cst: IConstituenta, event: React.MouseEvent<Element, MouseEvent>) => {
      if (event.altKey) {
        event.preventDefault();
        onEdit(cst.id);
      }
    },
    [onEdit]
  );

  const handleRowDoubleClicked = useCallback(
    (cst: IConstituenta, event: React.MouseEvent<Element, MouseEvent>) => {
      event.preventDefault();
      onEdit(cst.id);
    },
    [onEdit]
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor('alias', {
        id: 'alias',
        header: 'Имя',
        size: 65,
        minSize: 65,
        maxSize: 65,
        cell: props => <ConstituentaBadge theme={colors} value={props.row.original} prefixID={prefixes.cst_list} />
      }),
      columnHelper.accessor(cst => labelCstTypification(cst), {
        id: 'type',
        header: 'Типизация',
        enableHiding: true,
        cell: props => (
          <div className={clsx('min-w-[9.3rem] max-w-[9.3rem]', 'text-sm break-words')}>{props.getValue()}</div>
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
        cell: props => <div className='break-words'>{props.getValue()}</div>
      }),
      columnHelper.accessor(cst => cst.definition_resolved || cst.definition_raw || '', {
        id: 'definition',
        header: 'Текстовое определение',
        size: 1000,
        minSize: 200,
        maxSize: 1000,
        cell: props => <div className='text-xs'>{props.getValue()}</div>
      }),
      columnHelper.accessor('convention', {
        id: 'convention',
        header: 'Конвенция / Комментарий',
        size: 500,
        minSize: 100,
        maxSize: 500,
        enableHiding: true,
        cell: props => <div className='text-xs'>{props.getValue()}</div>
      })
    ],
    [colors]
  );

  const tableHeight = useMemo(() => {
    return !noNavigation ? 'calc(100vh - 7.2rem - 4px)' : 'calc(100vh - 4.4rem - 4px)';
  }, [noNavigation]);

  return (
    <DataTable
      dense
      noFooter
      className={clsx('min-h-[16rem]', 'overflow-y-auto', 'text-sm', 'select-none')}
      style={{ maxHeight: tableHeight }}
      data={items ?? []}
      columns={columns}
      headPosition='0rem'
      onRowDoubleClicked={handleRowDoubleClicked}
      onRowClicked={handleRowClicked}
      enableHiding
      columnVisibility={columnVisibility}
      onColumnVisibilityChange={setColumnVisibility}
      enableRowSelection={enableSelection}
      rowSelection={selected}
      onRowSelectionChange={setSelected}
      noDataComponent={
        <FlexColumn className='items-center p-3'>
          <p>Список пуст</p>
          <p className='cursor-pointer clr-text-primary hover:underline' onClick={() => onCreateNew()}>
            Создать новую конституенту
          </p>
        </FlexColumn>
      }
    />
  );
}

export default RSTable;
