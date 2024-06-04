'use client';

import clsx from 'clsx';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';

import BadgeConstituenta from '@/components/info/BadgeConstituenta';
import DataTable, { createColumnHelper, IConditionalStyle, VisibilityState } from '@/components/ui/DataTable';
import { useConceptOptions } from '@/context/OptionsContext';
import useWindowSize from '@/hooks/useWindowSize';
import { ConstituentaID, IConstituenta } from '@/models/rsform';
import { isMockCst } from '@/models/rsformAPI';
import { PARAMETER, prefixes } from '@/utils/constants';
import { describeConstituenta } from '@/utils/labels';

interface ConstituentsTableProps {
  items: IConstituenta[];
  activeCst?: IConstituenta;
  onOpenEdit: (cstID: ConstituentaID) => void;
  denseThreshold?: number;
  maxHeight: string;
}

const columnHelper = createColumnHelper<IConstituenta>();

function ConstituentsTable({ items, activeCst, onOpenEdit, maxHeight, denseThreshold = 9999 }: ConstituentsTableProps) {
  const { colors } = useConceptOptions();
  const windowSize = useWindowSize();

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({ expression: true });

  useLayoutEffect(() => {
    if (!activeCst) {
      return;
    }
    setTimeout(() => {
      const element = document.getElementById(`${prefixes.cst_side_table}${activeCst.alias}`);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'end'
        });
      }
    }, PARAMETER.refreshTimeout);
  }, [activeCst]);

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
        header: () => <span className='pl-3'>Имя</span>,
        size: 65,
        minSize: 65,
        footer: undefined,
        cell: props => (
          <BadgeConstituenta theme={colors} value={props.row.original} prefixID={prefixes.cst_side_table} />
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
              textWrap: 'pretty',
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
              textWrap: 'pretty',
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
        when: (cst: IConstituenta) => cst.id === activeCst?.id,
        style: {
          backgroundColor: colors.bgSelected
        }
      },
      {
        when: (cst: IConstituenta) => cst.parent === activeCst?.id && cst.id !== activeCst?.id,
        style: {
          backgroundColor: colors.bgOrange50
        }
      },
      {
        when: (cst: IConstituenta) => activeCst?.id !== undefined && cst.children.includes(activeCst.id),
        style: {
          backgroundColor: colors.bgGreen50
        }
      }
    ],
    [activeCst, colors]
  );

  return (
    <DataTable
      dense
      noFooter
      className='text-sm select-none cc-scroll-y'
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
