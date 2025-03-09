'use client';

import { useEffect } from 'react';

import { createColumnHelper, DataTable, type IConditionalStyle } from '@/components/DataTable';
import { NoData, TextContent } from '@/components/View';
import { APP_COLORS } from '@/styling/colors';
import { PARAMETER, prefixes } from '@/utils/constants';

import { BadgeConstituenta } from '../../../components/BadgeConstituenta';
import { describeConstituenta } from '../../../labels';
import { type IConstituenta } from '../../../models/rsform';
import { useRSEdit } from '../RSEditContext';

import { useFilteredItems } from './useFilteredItems';

const DESCRIPTION_MAX_SYMBOLS = 280;

interface TableSideConstituentsProps {
  autoScroll?: boolean;
  maxHeight: string;
}

const columnHelper = createColumnHelper<IConstituenta>();

export function TableSideConstituents({ autoScroll = true, maxHeight }: TableSideConstituentsProps) {
  const { activeCst, navigateCst } = useRSEdit();
  const items = useFilteredItems();

  useEffect(() => {
    if (!activeCst) {
      return;
    }
    if (autoScroll) {
      setTimeout(() => {
        const element = document.getElementById(`${prefixes.cst_side_table}${activeCst.id}`);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'end'
          });
        }
      }, PARAMETER.refreshTimeout);
    }
  }, [activeCst, autoScroll]);

  const columns = [
    columnHelper.accessor('alias', {
      id: 'alias',
      header: () => <span className='pl-3'>Имя</span>,
      size: 65,
      minSize: 65,
      cell: props => <BadgeConstituenta value={props.row.original} prefixID={prefixes.cst_side_table} />
    }),
    columnHelper.accessor(cst => describeConstituenta(cst), {
      id: 'description',
      header: 'Описание',
      size: 1000,
      minSize: 250,
      maxSize: 1000,
      cell: props => <TextContent noTooltip text={props.getValue()} maxLength={DESCRIPTION_MAX_SYMBOLS} />
    })
  ];

  const conditionalRowStyles: IConditionalStyle<IConstituenta>[] = [
    {
      when: (cst: IConstituenta) => !!activeCst && cst.id === activeCst.id,
      style: {
        backgroundColor: APP_COLORS.bgSelected
      }
    },
    {
      when: (cst: IConstituenta) => !!activeCst && cst.spawner === activeCst.id && cst.id !== activeCst.id,
      style: {
        backgroundColor: APP_COLORS.bgOrange50
      }
    },
    {
      when: (cst: IConstituenta) => !!activeCst && cst.spawn.includes(activeCst.id),
      style: {
        backgroundColor: APP_COLORS.bgGreen50
      }
    }
  ];

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
      noDataComponent={
        <NoData className='min-h-20'>
          <p>Список конституент пуст</p>
          <p>Измените параметры фильтра</p>
        </NoData>
      }
      onRowClicked={cst => navigateCst(cst.id)}
    />
  );
}
