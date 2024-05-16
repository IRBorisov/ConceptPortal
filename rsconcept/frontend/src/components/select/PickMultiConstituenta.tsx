'use client';

import clsx from 'clsx';
import { useLayoutEffect, useMemo, useState } from 'react';

import DataTable, { createColumnHelper, RowSelectionState } from '@/components/ui/DataTable';
import { useConceptOptions } from '@/context/OptionsContext';
import { ConstituentaID, IConstituenta, IRSForm } from '@/models/rsform';
import { isBasicConcept } from '@/models/rsformAPI';
import { describeConstituenta } from '@/utils/labels';

import BadgeConstituenta from '../info/BadgeConstituenta';
import FlexColumn from '../ui/FlexColumn';
import GraphSelectionToolbar from './GraphSelectionToolbar';

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

  useLayoutEffect(() => {
    if (!schema || selected.length === 0) {
      setRowSelection({});
    } else {
      const newRowSelection: RowSelectionState = {};
      schema.items.forEach((cst, index) => {
        newRowSelection[String(index)] = selected.includes(cst.id);
      });
      setRowSelection(newRowSelection);
    }
  }, [selected, schema]);

  function handleRowSelection(updater: React.SetStateAction<RowSelectionState>) {
    if (!schema) {
      setSelected([]);
    } else {
      const newRowSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
      const newSelection: ConstituentaID[] = [];
      schema.items.forEach((cst, index) => {
        if (newRowSelection[String(index)] === true) {
          newSelection.push(cst.id);
        }
      });
      setSelected(newSelection);
    }
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('alias', {
        id: 'alias',
        header: 'Имя',
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
      <div className='flex items-end gap-3 mb-3'>
        <span className='w-[24ch] select-none whitespace-nowrap'>
          Выбраны {selected.length} из {schema?.items.length ?? 0}
        </span>
        {schema ? (
          <GraphSelectionToolbar
            graph={schema.graph}
            core={schema.items.filter(cst => isBasicConcept(cst.cst_type)).map(cst => cst.id)}
            setSelected={setSelected}
            className='w-full ml-8'
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
        data={schema?.items ?? []}
        columns={columns}
        headPosition='0rem'
        enableRowSelection
        rowSelection={rowSelection}
        onRowSelectionChange={handleRowSelection}
        noDataComponent={
          <FlexColumn className='items-center p-3'>
            <p>Список пуст</p>
          </FlexColumn>
        }
      />
    </div>
  );
}

export default PickMultiConstituenta;
