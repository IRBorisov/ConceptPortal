'use client';

import clsx from 'clsx';
import { useLayoutEffect, useMemo, useState } from 'react';

import DataTable, { createColumnHelper, RowSelectionState } from '@/components/ui/DataTable';
import { useConceptOptions } from '@/context/ConceptOptionsContext';
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
  schema?: IRSForm;
  prefixID: string;
  rows?: number;

  selected: ConstituentaID[];
  setSelected: React.Dispatch<React.SetStateAction<ConstituentaID[]>>;
}

const columnHelper = createColumnHelper<IConstituenta>();

function PickMultiConstituenta({ id, schema, prefixID, rows, selected, setSelected }: PickMultiConstituentaProps) {
  const { colors } = useConceptOptions();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [filtered, setFiltered] = useState<IConstituenta[]>(schema?.items ?? []);
  const [filterText, setFilterText] = useState('');

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
    if (!schema || schema.items.length === 0) {
      setFiltered([]);
    } else if (filterText) {
      setFiltered(schema.items.filter(cst => matchConstituenta(cst, filterText, CstMatchMode.ALL)));
    } else {
      setFiltered(schema.items);
    }
  }, [filterText, schema?.items, schema]);

  function handleRowSelection(updater: React.SetStateAction<RowSelectionState>) {
    if (!schema) {
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
    <div>
      <div className='flex justify-between items-center clr-input px-3 border-x border-t rounded-t-md'>
        <div className='w-[24ch] select-none whitespace-nowrap'>
          Выбраны {selected.length} из {schema?.items.length ?? 0}
        </div>
        <SearchBar
          id='dlg_constituents_search'
          noBorder
          className='min-w-[6rem] pr-2 flex-grow'
          value={filterText}
          onChange={setFilterText}
        />
        {schema ? (
          <ToolbarGraphSelection
            graph={schema.graph}
            isCore={cstID => isBasicConcept(schema.cstByID.get(cstID)?.cst_type)}
            isOwned={cstID => !schema.cstByID.get(cstID)?.is_inherited}
            setSelected={setSelected}
            emptySelection={selected.length === 0}
            className='w-fit'
          />
        ) : null}
      </div>
      <DataTable
        id={id}
        dense
        noFooter
        rows={rows}
        contentHeight='1.3rem'
        className={clsx('cc-scroll-y', 'border', 'text-sm', 'select-none')}
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
