'use client';

import { useState } from 'react';

import { createColumnHelper, DataTable, type RowSelectionState } from '@/components/data-table';
import { SearchBar } from '@/components/input';
import { type Styling } from '@/components/props';
import { cn } from '@/components/utils';
import { NoData } from '@/components/view';
import { Graph } from '@/models/graph';

import { describeConstituenta } from '../labels';
import { type IConstituenta, type IRSForm } from '../models/rsform';
import { isBasicConcept, matchConstituenta } from '../models/rsform-api';
import { CstMatchMode } from '../stores/cst-search';

import { BadgeConstituenta } from './badge-constituenta';
import { ToolbarGraphSelection } from './toolbar-graph-selection';

interface PickMultiConstituentaProps extends Styling {
  id?: string;
  value: number[];
  onChange: (newValue: number[]) => void;

  schema: IRSForm;
  items: IConstituenta[];

  rows?: number;
  noBorder?: boolean;
}

const columnHelper = createColumnHelper<IConstituenta>();

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
  const [filterText, setFilterText] = useState('');

  const filtered = filterText ? items.filter(cst => matchConstituenta(cst, filterText, CstMatchMode.ALL)) : items;
  const rowSelection: RowSelectionState = Object.fromEntries(
    filtered.map((cst, index) => [String(index), value.includes(cst.id)])
  );

  const foldedGraph = (() => {
    if (items.length === schema.items.length) {
      return schema.graph;
    }
    const newGraph = new Graph();
    schema.graph.nodes.forEach(node => {
      newGraph.addNode(node.id);
      node.outputs.forEach(output => {
        newGraph.addEdge(node.id, output);
      });
    });
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
      header: () => <span className='pl-3'>Имя</span>,
      size: 65,
      cell: props => <BadgeConstituenta value={props.row.original} />
    }),
    columnHelper.accessor(cst => describeConstituenta(cst), {
      id: 'description',
      size: 1000,
      header: 'Описание'
    })
  ];

  return (
    <div className={cn(!noBorder && 'border', className)} {...restProps}>
      <div className='px-3 flex justify-between items-center bg-input border-b rounded-t-md'>
        <div className='w-[24ch] select-none whitespace-nowrap'>
          {items.length > 0 ? `Выбраны ${value.length} из ${items.length}` : 'Конституенты'}
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
          isOwned={cstID => !schema.cstByID.get(cstID)?.is_inherited}
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
        className='cc-scroll-y text-sm select-none rounded-b-md'
        data={filtered}
        columns={columns}
        headPosition='0rem'
        enableRowSelection
        rowSelection={rowSelection}
        onRowSelectionChange={handleRowSelection}
        noDataComponent={
          <NoData>
            <p>Список пуст</p>
          </NoData>
        }
      />
    </div>
  );
}
