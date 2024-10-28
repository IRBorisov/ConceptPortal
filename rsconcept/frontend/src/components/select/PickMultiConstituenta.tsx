'use client';

import clsx from 'clsx';
import { useLayoutEffect, useMemo, useState } from 'react';

import DataTable, { createColumnHelper, RowSelectionState } from '@/components/ui/DataTable';
import { useConceptOptions } from '@/context/ConceptOptionsContext';
import { Graph } from '@/models/Graph';
import { CstMatchMode } from '@/models/miscellaneous';
import { ConstituentaID, IConstituenta, IRSForm } from '@/models/rsform';
import { isBasicConcept, matchConstituenta } from '@/models/rsformAPI';
import { describeConstituenta } from '@/utils/labels';

import BadgeConstituenta from '../info/BadgeConstituenta';
import NoData from '../ui/NoData';
import SearchBar from '../ui/SearchBar';
import ToolbarGraphSelection from './ToolbarGraphSelection';

interface PickMultiConstituentaProps {
  id?: string;
  schema: IRSForm;
  data: IConstituenta[];

  prefixID: string;
  rows?: number;
  noBorder?: boolean;

  selected: ConstituentaID[];
  setSelected: React.Dispatch<React.SetStateAction<ConstituentaID[]>>;
}

const columnHelper = createColumnHelper<IConstituenta>();

function PickMultiConstituenta({
  id,
  schema,
  data,
  prefixID,
  rows,
  noBorder,
  selected,
  setSelected
}: PickMultiConstituentaProps) {
  const { colors } = useConceptOptions();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [filtered, setFiltered] = useState<IConstituenta[]>(data);
  const [filterText, setFilterText] = useState('');

  const foldedGraph = useMemo(() => {
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
  }, [data, schema.graph, schema.items]);

  useLayoutEffect(() => {
    if (filtered.length === 0) {
      setRowSelection({});
      return;
    }
    const newRowSelection: RowSelectionState = {};
    filtered.forEach((cst, index) => {
      newRowSelection[String(index)] = selected.includes(cst.id);
    });
    setRowSelection(newRowSelection);
  }, [filtered, setRowSelection, selected]);

  useLayoutEffect(() => {
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
      setSelected([]);
    } else {
      const newRowSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
      const newSelection: ConstituentaID[] = [];
      filtered.forEach((cst, index) => {
        if (newRowSelection[String(index)] === true) {
          newSelection.push(cst.id);
        }
      });
      setSelected(prev => [...prev.filter(cst_id => !filtered.find(cst => cst.id === cst_id)), ...newSelection]);
    }
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('alias', {
        id: 'alias',
        header: () => <span className='pl-3'>Имя</span>,
        size: 65,
        cell: props => <BadgeConstituenta theme={colors} value={props.row.original} prefixID={prefixID} />
      }),
      columnHelper.accessor(cst => describeConstituenta(cst), {
        id: 'description',
        size: 1000,
        header: 'Описание'
      })
    ],
    [colors, prefixID]
  );

  return (
    <div className={noBorder ? '' : 'border'}>
      <div className={clsx('px-3 flex justify-between items-center', 'clr-input', 'border-b', 'rounded-t-md')}>
        <div className='w-[24ch] select-none whitespace-nowrap'>
          {data.length > 0 ? `Выбраны ${selected.length} из ${data.length}` : 'Конституенты'}
        </div>
        <SearchBar
          id='dlg_constituents_search'
          noBorder
          className='min-w-[6rem] pr-2 flex-grow'
          value={filterText}
          onChange={setFilterText}
        />
        <ToolbarGraphSelection
          graph={foldedGraph}
          isCore={cstID => isBasicConcept(schema.cstByID.get(cstID)?.cst_type)}
          isOwned={cstID => !schema.cstByID.get(cstID)?.is_inherited}
          setSelected={setSelected}
          emptySelection={selected.length === 0}
          className='w-fit'
        />
      </div>
      <DataTable
        id={id}
        dense
        noFooter
        rows={rows}
        contentHeight='1.3rem'
        className={clsx('cc-scroll-y', 'text-sm', 'select-none')}
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
