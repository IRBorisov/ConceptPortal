'use client';

import { useState } from 'react';

import { useTx } from '@/i18n';
import { matchConstituenta } from '@/services/search';
import { Graph } from '@rsconcept/domain/graph/graph';
import { type Constituenta, type RSForm } from '@rsconcept/domain/library';
import { isBasicConcept } from '@rsconcept/domain/library/rsform-api';

import { createColumnHelper, DataTable, type RowSelectionState } from '@/components/data-table';
import { SearchBar } from '@/components/input';
import { type Styling } from '@/components/props';
import { cn } from '@/components/utils';
import { NoData } from '@/components/view';

import { describeConstituenta } from '../labels';

import { BadgeConstituenta } from './badge-constituenta';
import { ToolbarGraphSelection } from './toolbar-graph-selection';

interface PickMultiConstituentaProps extends Styling {
  id?: string;
  value: number[];
  onChange: (newValue: number[]) => void;

  schema: RSForm;
  items: Constituenta[];

  rows?: number;
  noBorder?: boolean;
}

const columnHelper = createColumnHelper<Constituenta>();

export function PickMultiConstituenta({
  id,
  schema,
  items,
  rows,
  noBorder,
  value,
  onChange,
  className,
  ...restProps
}: PickMultiConstituentaProps) {
  const tx = useTx();
  const [filterText, setFilterText] = useState('');

  const filtered = filterText ? items.filter(cst => matchConstituenta(cst, filterText)) : items;
  const rowSelection: RowSelectionState = Object.fromEntries(
    filtered.map((cst, index) => [String(index), value.includes(cst.id)])
  );

  const foldedGraph = (() => {
    if (items.length === schema.items.length) {
      return schema.graph;
    }
    const newGraph = new Graph();
    for (const node of schema.graph.nodes.values()) {
      newGraph.addNode(node.id);
      for (const output of node.outputs) {
        newGraph.addEdge(node.id, output);
      }
    }
    schema.items
      .filter(item => items.find(cst => cst.id === item.id) === undefined)
      .forEach(item => {
        newGraph.foldNode(item.id);
      });
    return newGraph;
  })();

  function handleRowSelection(updater: React.SetStateAction<RowSelectionState>) {
    if (!items) {
      onChange([]);
    } else {
      const newRowSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
      const newSelection: number[] = [];
      filtered.forEach((cst, index) => {
        if (newRowSelection[String(index)] === true) {
          newSelection.push(cst.id);
        }
      });
      onChange([...value.filter(cst_id => !filtered.find(cst => cst.id === cst_id)), ...newSelection]);
    }
  }

  const columns = [
    columnHelper.accessor('alias', {
      id: 'alias',
      header: () => <span className='pl-3'>{tx('tx.lib.alias.short')}</span>,
      size: 65,
      cell: props => <BadgeConstituenta value={props.row.original} />
    }),
    columnHelper.accessor(cst => describeConstituenta(cst), {
      id: 'description',
      size: 1000,
      header: tx('tx.lib.description')
    })
  ];

  return (
    <div className={cn(!noBorder && 'border', className)} {...restProps}>
      <div className='px-3 flex justify-between items-center bg-input border-b rounded-t-md'>
        <div className='w-[24ch] select-none whitespace-nowrap'>
          {items.length > 0
            ? tx('tx.general.selection.status', {
                selected: value.length,
                total: items.length
              })
            : tx('tx.cst.plural')}
        </div>
        <SearchBar
          id='dlg_constituents_search'
          noBorder
          className='min-w-24 pr-2 grow'
          query={filterText}
          onChangeQuery={setFilterText}
        />
        <ToolbarGraphSelection
          graph={foldedGraph}
          isCore={cstID => {
            const cst = schema.cstByID.get(cstID);
            return !!cst && isBasicConcept(cst.cst_type);
          }}
          isCrucial={cstID => schema.cstByID.get(cstID)?.crucial ?? false}
          isInherited={cstID => schema.cstByID.get(cstID)?.is_inherited ?? false}
          value={value}
          onChange={onChange}
          className='w-fit'
        />
      </div>

      <DataTable
        id={id}
        dense
        noFooter
        rows={rows}
        contentHeight='1.3rem'
        className='cc-scroll-y text-sm select-none rounded-b-md [&_thead_th]:py-1'
        data={filtered}
        columns={columns}
        enableRowSelection
        rowSelection={rowSelection}
        onRowSelectionChange={handleRowSelection}
        noDataComponent={
          <NoData>
            <p>{tx('tx.list.empty')}</p>
          </NoData>
        }
      />
    </div>
  );
}
