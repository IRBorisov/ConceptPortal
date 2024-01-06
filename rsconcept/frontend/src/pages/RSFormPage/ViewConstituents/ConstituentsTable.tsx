'use client';

import clsx from 'clsx';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';

import ConstituentaBadge from '@/components/ConstituentaBadge';
import DataTable, { createColumnHelper, IConditionalStyle, VisibilityState } from '@/components/DataTable';
import { useConceptTheme } from '@/context/ThemeContext';
import useWindowSize from '@/hooks/useWindowSize';
import { IConstituenta } from '@/models/rsform';
import { isMockCst } from '@/models/rsformAPI';
import { prefixes } from '@/utils/constants';
import { describeConstituenta } from '@/utils/labels';

interface ConstituentsTableProps {
  items: IConstituenta[];
  activeID?: number;
  onOpenEdit: (cstID: number) => void;
  denseThreshold?: number;
  maxHeight: string;
}

const columnHelper = createColumnHelper<IConstituenta>();

function ConstituentsTable({ items, activeID, onOpenEdit, maxHeight, denseThreshold = 9999 }: ConstituentsTableProps) {
  const { colors } = useConceptTheme();
  const windowSize = useWindowSize();

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({ expression: true });

  useLayoutEffect(() => {
    setColumnVisibility(prev => {
      const newValue = (windowSize.width ?? 0) >= denseThreshold;
      if (newValue === prev['expression']) {
        return prev;
      } else {
        return { expression: newValue };
      }
    });
  }, [windowSize, denseThreshold]);

  const handleRowClicked = useCallback(
    (cst: IConstituenta) => {
      if (!isMockCst(cst)) {
        onOpenEdit(cst.id);
      }
    },
    [onOpenEdit]
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor('alias', {
        id: 'alias',
        header: 'Имя',
        size: 65,
        minSize: 65,
        footer: undefined,
        cell: props => (
          <ConstituentaBadge theme={colors} value={props.row.original} prefixID={prefixes.cst_side_table} />
        )
      }),
      columnHelper.accessor(cst => describeConstituenta(cst), {
        id: 'description',
        header: 'Описание',
        size: 1000,
        minSize: 250,
        maxSize: 1000,
        cell: props => (
          <div
            style={{
              fontSize: 12,
              color: isMockCst(props.row.original) ? colors.fgWarning : undefined
            }}
          >
            {props.getValue()}
          </div>
        )
      }),
      columnHelper.accessor('definition_formal', {
        id: 'expression',
        header: 'Выражение',
        size: 2000,
        minSize: 0,
        maxSize: 2000,
        enableHiding: true,
        cell: props => (
          <div
            style={{
              fontSize: 12,
              color: isMockCst(props.row.original) ? colors.fgWarning : undefined
            }}
          >
            {props.getValue()}
          </div>
        )
      })
    ],
    [colors]
  );

  const conditionalRowStyles = useMemo(
    (): IConditionalStyle<IConstituenta>[] => [
      {
        when: (cst: IConstituenta) => cst.id === activeID,
        style: {
          backgroundColor: colors.bgSelected
        }
      }
    ],
    [activeID, colors]
  );

  return (
    <DataTable
      dense
      noFooter
      className='overflow-y-auto text-sm select-none overscroll-none'
      style={{ maxHeight: maxHeight }}
      data={items}
      columns={columns}
      conditionalRowStyles={conditionalRowStyles}
      headPosition='0'
      enableHiding
      columnVisibility={columnVisibility}
      onColumnVisibilityChange={setColumnVisibility}
      noDataComponent={
        <div className={clsx('min-h-[5rem]', 'p-3', 'text-center', 'select-none')}>
          <p>Список конституент пуст</p>
          <p>Измените параметры фильтра</p>
        </div>
      }
      onRowClicked={handleRowClicked}
    />
  );
}

export default ConstituentsTable;
