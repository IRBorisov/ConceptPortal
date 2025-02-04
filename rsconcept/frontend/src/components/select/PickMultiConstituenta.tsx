'use client';

import clsx from 'clsx';
import { useEffect, useState } from 'react';

import BadgeConstituenta from '@/components/info/BadgeConstituenta';
import { CProps } from '@/components/props';
import DataTable, { createColumnHelper, RowSelectionState } from '@/components/ui/DataTable';
import NoData from '@/components/ui/NoData';
import SearchBar from '@/components/ui/SearchBar';
import { Graph } from '@/models/Graph';
import { CstMatchMode } from '@/models/miscellaneous';
import { ConstituentaID, IConstituenta, IRSForm } from '@/models/rsform';
import { isBasicConcept, matchConstituenta } from '@/models/rsformAPI';
import { describeConstituenta } from '@/utils/labels';

import ToolbarGraphSelection from './ToolbarGraphSelection';

interface PickMultiConstituentaProps extends CProps.Styling {
  id?: string;
  value: ConstituentaID[];
  onChange: React.Dispatch<React.SetStateAction<ConstituentaID[]>>;

  schema: IRSForm;
  data: IConstituenta[];

  prefixID: string;
  rows?: number;
  noBorder?: boolean;
}

const columnHelper = createColumnHelper<IConstituenta>();

function PickMultiConstituenta({
  id,
  schema,
  data,
  prefixID,
  rows,
  noBorder,
  value,
  onChange,
  className,
  ...restProps
}: PickMultiConstituentaProps) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [filtered, setFiltered] = useState<IConstituenta[]>(data);
  const [filterText, setFilterText] = useState('');

  // TODO: extract graph fold logic to separate function
  const foldedGraph = (() => {
    if (data.length === schema.items.length) {
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
      .filter(item => data.find(cst => cst.id === item.id) === undefined)
      .forEach(item => {
        newGraph.foldNode(item.id);
      });
    return newGraph;
  })();

  useEffect(() => {
    if (filtered.length === 0) {
      setRowSelection({});
      return;
    }
    const newRowSelection: RowSelectionState = {};
    filtered.forEach((cst, index) => {
      newRowSelection[String(index)] = value.includes(cst.id);
    });
    setRowSelection(newRowSelection);
  }, [filtered, setRowSelection, value]);

  useEffect(() => {
    if (data.length === 0) {
      setFiltered([]);
    } else if (filterText) {
      setFiltered(data.filter(cst => matchConstituenta(cst, filterText, CstMatchMode.ALL)));
    } else {
      setFiltered(data);
    }
  }, [filterText, data]);

  function handleRowSelection(updater: React.SetStateAction<RowSelectionState>) {
    if (!data) {
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
      cell: props => <BadgeConstituenta value={props.row.original} prefixID={prefixID} />
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
          {data.length > 0 ? `Выбраны ${value.length} из ${data.length}` : 'Конституенты'}
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
