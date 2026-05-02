'use client';

import { useEffect, useRef } from 'react';

import { type Constituenta, type RSEngine, type RSForm } from '@/domain/library';
import { useTx } from '@/i18n';

import { BadgeEvaluation } from '@/features/rsmodel/components/badge-evaluation';

import { createColumnHelper, DataTable, type IConditionalStyle } from '@/components/data-table';
import { NoData, TextContent } from '@/components/view';
import { PARAMETER, prefixes } from '@/utils/constants';

import { describeConstituenta } from '../../labels';
import { BadgeConstituenta } from '../badge-constituenta';

import { useFilteredItems } from './use-filtered-items';

const DESCRIPTION_MAX_SYMBOLS = 280;

interface TableSideConstituentsProps {
  schema: RSForm;
  engine?: RSEngine;
  activeCst?: Constituenta | null;
  isSchemaIssue?: (cst: Constituenta) => boolean;
  isModelIssue?: (cst: Constituenta) => boolean;

  onActivate?: (cst: Constituenta) => void;
  onDoubleClick?: (cst: Constituenta) => void;

  maxHeight?: string;
  autoScroll?: boolean;
}

const columnHelper = createColumnHelper<Constituenta>();

export function TableSideConstituents({
  schema,
  engine,
  activeCst,
  isSchemaIssue,
  isModelIssue,
  onActivate,
  onDoubleClick,
  maxHeight,
  autoScroll = true
}: TableSideConstituentsProps) {
  const tx = useTx();
  const items = useFilteredItems(schema, isSchemaIssue, isModelIssue);
  const prevActiveCstID = useRef<number | null>(null);

  useEffect(
    function autoScrollToActive() {
      if (autoScroll && prevActiveCstID.current !== activeCst?.id) {
        prevActiveCstID.current = activeCst?.id ?? null;
        if (!!activeCst) {
          setTimeout(function scrollToActiveConstituenta() {
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
    },
    [autoScroll, activeCst]
  );

  const columns = [
    columnHelper.accessor('alias', {
      id: 'alias',
      header: () => <span className='pl-3'>{tx('ui.table.header.alias')}</span>,
      size: 65,
      minSize: 65,
      cell: props => <BadgeConstituenta value={props.row.original} prefixID={prefixes.cst_side_table} />
    }),
    ...(engine
      ? [
          columnHelper.accessor(cst => cst, {
            id: 'value',
            header: tx('ui.table.header.value'),
            size: 60,
            minSize: 60,
            maxSize: 60,
            cell: props => <BadgeEvaluation cst={props.row.original} engine={engine} />
          })
        ]
      : []),
    columnHelper.accessor(cst => describeConstituenta(cst), {
      id: 'description',
      header: tx('ui.table.header.description'),
      size: 1000,
      minSize: 250,
      maxSize: 1000,
      cell: props => (
        <TextContent
          noTooltip
          className={props.getValue().includes('×') ? 'break-all' : 'wrap-break-word'}
          text={props.getValue()}
          maxLength={DESCRIPTION_MAX_SYMBOLS}
        />
      )
    })
  ];

  const conditionalRowStyles: IConditionalStyle<Constituenta>[] = [
    {
      when: (cst: Constituenta) => !!activeCst && cst.id === activeCst.id,
      className: 'bg-selected'
    },
    {
      when: (cst: Constituenta) => !!activeCst && cst.spawner === activeCst.id && cst.id !== activeCst.id,
      className: 'bg-accent-orange50'
    },
    {
      when: (cst: Constituenta) => !!activeCst && cst.spawn.includes(activeCst.id),
      className: 'bg-accent-green50'
    }
  ];

  return (
    <DataTable
      dense
      noFooter
      className='text-sm select-none cc-scroll-y [&_thead_th]:py-1'
      style={maxHeight ? { maxHeight: maxHeight } : {}}
      data={items}
      columns={columns}
      conditionalRowStyles={conditionalRowStyles}
      enableHiding
      noDataComponent={
        <NoData className='min-h-20'>
          <p>{tx('ui.table.cstSide.emptyTitle')}</p>
          <p>{tx('ui.table.cstSide.emptyHint')}</p>
        </NoData>
      }
      onRowClicked={onActivate ? cst => onActivate(cst) : undefined}
      onRowDoubleClicked={onDoubleClick}
    />
  );
}
