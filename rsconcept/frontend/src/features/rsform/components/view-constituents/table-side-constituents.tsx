'use client';

import { useTx } from '@/i18n';
import { type Constituenta, type RSEngine, type RSForm } from '@rsconcept/domain/library';
import { type ModelEvalFields, type SchemaIssueFields } from '@rsconcept/domain/library/rsform-api';

import { BadgeEvaluation } from '@/features/rsmodel/components/badge-evaluation';

import { createColumnHelper, DataTable, type DataTableRowDrop, type IConditionalStyle } from '@/components/data-table';
import { cn } from '@/components/utils';
import { NoData, TextContent } from '@/components/view';
import { prefixes } from '@/utils/constants';

import { describeConstituenta } from '../../labels';
import { useCstSearchStore } from '../../stores/cst-search';
import { useScrollToConstituent } from '../../utils/scroll-to-constituent';
import { BadgeConstituenta } from '../badge-constituenta';

import { useFilteredItems } from './use-filtered-items';

const DESCRIPTION_MAX_SYMBOLS = 280;

interface TableSideConstituentsProps {
  schema: RSForm;
  engine?: RSEngine;
  activeCst?: Constituenta | null;
  isSchemaIssue?: (cst: SchemaIssueFields) => boolean;
  isModelIssue?: (cst: ModelEvalFields) => boolean;

  onActivate?: (cst: Constituenta) => void;
  onDoubleClick?: (cst: Constituenta) => void;

  enableRowReordering?: boolean;
  onRowsDropped?: (event: DataTableRowDrop<Constituenta>) => void;

  maxHeight?: string;
  autoScroll?: boolean;
  className?: string;
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
  enableRowReordering,
  onRowsDropped,
  maxHeight,
  autoScroll = true,
  className
}: TableSideConstituentsProps) {
  const tx = useTx();
  const items = useFilteredItems(schema, isSchemaIssue, isModelIssue);
  const query = useCstSearchStore(state => state.query);
  const filter = useCstSearchStore(state => state.filter);
  const listScrollKey = `${query}\0${filter}`;

  useScrollToConstituent(prefixes.cst_side_table, activeCst?.id, autoScroll, { scrollKey: listScrollKey });

  const columns = [
    columnHelper.accessor('alias', {
      id: 'alias',
      header: () => <span className='pl-3'>{tx('tx.lib.alias.short')}</span>,
      size: 65,
      minSize: 65,
      cell: props => <BadgeConstituenta value={props.row.original} prefixID={prefixes.cst_side_table} />
    }),
    ...(engine
      ? [
          columnHelper.accessor(cst => cst, {
            id: 'value',
            header: tx('tx.rslang.value.short'),
            size: 60,
            minSize: 60,
            maxSize: 60,
            cell: props => <BadgeEvaluation cst={props.row.original} engine={engine} />
          })
        ]
      : []),
    columnHelper.accessor(cst => describeConstituenta(cst), {
      id: 'description',
      header: tx('tx.lib.description'),
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

  function handleRowsReordered(event: DataTableRowDrop<Constituenta>) {
    onRowsDropped?.(event);
  }

  return (
    <DataTable
      dense
      noFooter
      className={cn('text-sm select-none cc-scroll-y [&_thead_th]:py-1', className)}
      style={maxHeight ? { maxHeight: maxHeight } : {}}
      data={items}
      columns={columns}
      conditionalRowStyles={conditionalRowStyles}
      enableHiding
      enableRowReordering={enableRowReordering}
      onRowsReordered={onRowsDropped ? handleRowsReordered : undefined}
      noDataComponent={
        <NoData className='min-h-20'>
          <p>{tx('tx.list.empty')}</p>
        </NoData>
      }
      onRowClicked={onActivate ? cst => onActivate(cst) : undefined}
      onRowDoubleClicked={onDoubleClick}
    />
  );
}
