'use client';

import clsx from 'clsx';
import { useState } from 'react';

import DataTable, { createColumnHelper, RowSelectionState } from '@/components/DataTable';
import { CProps } from '@/components/props';
import { SearchBar } from '@/components/shared/SearchBar';
import { NoData } from '@/components/View';
import { Graph } from '@/models/Graph';
import { describeConstituenta } from '@/utils/labels';

import { ConstituentaID, IConstituenta, IRSForm } from '../models/rsform';
import { isBasicConcept, matchConstituenta } from '../models/rsformAPI';
import { CstMatchMode } from '../stores/cstSearch';
import BadgeConstituenta from './BadgeConstituenta';
import ToolbarGraphSelection from './ToolbarGraphSelection';

interface PickMultiConstituentaProps extends CProps.Styling {
  id?: string;
  value: ConstituentaID[];
  onChange: React.Dispatch<React.SetStateAction<ConstituentaID[]>>;

  schema: IRSForm;
  items: IConstituenta[];

  rows?: number;
  noBorder?: boolean;
}

const columnHelper = createColumnHelper<IConstituenta>();

function PickMultiConstituenta({
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
      const newSelection: ConstituentaID[] = [];
      filtered.forEach((cst, index) => {
        if (newRowSelection[String(index)] === true) {
          newSelection.push(cst.id);
        }
      });
      onChange(prev => [...prev.filter(cst_id => !filtered.find(cst => cst.id === cst_id)), ...newSelection]);
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
    <div className={clsx(noBorder ? '' : 'border', className)} {...restProps}>
      <div className={clsx('px-3 flex justify-between items-center', 'clr-input', 'border-b', 'rounded-t-md')}>
        <div className='w-[24ch] select-none whitespace-nowrap'>
          {items.length > 0 ? `Выбраны ${value.length} из ${items.length}` : 'Конституенты'}
        </div>
        <SearchBar
          id='dlg_constituents_search'
          noBorder
          className='min-w-[6rem] pr-2 flex-grow'
          query={filterText}
          onChangeQuery={setFilterText}
        />
        <ToolbarGraphSelection
          graph={foldedGraph}
          isCore={cstID => isBasicConcept(schema.cstByID.get(cstID)?.cst_type)}
          isOwned={cstID => !schema.cstByID.get(cstID)?.is_inherited}
          value={value}
          onChange={onChange}
          emptySelection={value.length === 0}
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

export default PickMultiConstituenta;
