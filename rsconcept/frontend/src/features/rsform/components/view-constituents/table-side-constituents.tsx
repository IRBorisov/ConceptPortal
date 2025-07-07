'use client';

import { useRef } from 'react';

import { createColumnHelper, DataTable, type IConditionalStyle } from '@/components/data-table';
import { NoData, TextContent } from '@/components/view';
import { PARAMETER, prefixes } from '@/utils/constants';

import { describeConstituenta } from '../../labels';
import { type IConstituenta, type IRSForm } from '../../models/rsform';
import { BadgeConstituenta } from '../badge-constituenta';

import { useFilteredItems } from './use-filtered-items';

const DESCRIPTION_MAX_SYMBOLS = 280;

interface TableSideConstituentsProps {
  schema: IRSForm;
  activeCst?: IConstituenta | null;
  onActivate?: (cst: IConstituenta) => void;

  maxHeight?: string;
  autoScroll?: boolean;
}

const columnHelper = createColumnHelper<IConstituenta>();

export function TableSideConstituents({
  schema,
  activeCst,
  onActivate,
  maxHeight,
  autoScroll = true
}: TableSideConstituentsProps) {
  const items = useFilteredItems(schema, activeCst);

  const prevActiveCstID = useRef<number | null>(null);
  if (autoScroll && prevActiveCstID.current !== activeCst?.id) {
    prevActiveCstID.current = activeCst?.id ?? null;
    if (!!activeCst) {
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
  }

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
      className: 'bg-selected'
    },
    {
      when: (cst: IConstituenta) => !!activeCst && cst.spawner === activeCst.id && cst.id !== activeCst.id,
      className: 'bg-accent-orange50'
    },
    {
      when: (cst: IConstituenta) => !!activeCst && cst.spawn.includes(activeCst.id),
      className: 'bg-accent-green50'
    }
  ];

  return (
    <DataTable
      dense
      noFooter
      className='text-sm select-none cc-scroll-y'
      style={maxHeight ? { maxHeight: maxHeight } : {}}
      data={items}
      columns={columns}
      conditionalRowStyles={conditionalRowStyles}
      headPosition='0'
      enableHiding
      noDataComponent={
        <NoData className='min-h-20'>
          <p>Список конституент пуст</p>
          <p>Измените параметры фильтра или создайте конституенту</p>
        </NoData>
      }
      onRowClicked={onActivate ? cst => onActivate(cst) : undefined}
    />
  );
}
