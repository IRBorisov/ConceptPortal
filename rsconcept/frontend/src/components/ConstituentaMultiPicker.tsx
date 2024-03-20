'use client';

import clsx from 'clsx';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';

import DataTable, { createColumnHelper, RowSelectionState } from '@/components/DataTable';
import { useConceptTheme } from '@/context/ThemeContext';
import { ConstituentaID, IConstituenta, IRSForm } from '@/models/rsform';
import { describeConstituenta } from '@/utils/labels';

import ConstituentaBadge from './ConstituentaBadge';
import Button from './ui/Button';
import FlexColumn from './ui/FlexColumn';

interface ConstituentaMultiPickerProps {
  id?: string;
  schema?: IRSForm;
  prefixID: string;
  rows?: number;

  selected: ConstituentaID[];
  setSelected: React.Dispatch<ConstituentaID[]>;
}

const columnHelper = createColumnHelper<IConstituenta>();

function ConstituentaMultiPicker({ id, schema, prefixID, rows, selected, setSelected }: ConstituentaMultiPickerProps) {
  const { colors } = useConceptTheme();
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

  const selectBasis = useCallback(() => {
    if (!schema || selected.length === 0) {
      return;
    }
    const addition = schema.graph.expandInputs(selected).filter(id => !selected.includes(id));
    if (addition.length > 0) {
      setSelected([...selected, ...addition]);
    }
  }, [schema, selected, setSelected]);

  const selectDependant = useCallback(() => {
    if (!schema || selected.length === 0) {
      return;
    }
    const addition = schema.graph.expandOutputs(selected).filter(id => !selected.includes(id));
    if (addition.length > 0) {
      setSelected([...selected, ...addition]);
    }
  }, [schema, selected, setSelected]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('alias', {
        id: 'alias',
        header: 'Имя',
        size: 65,
        cell: props => <ConstituentaBadge theme={colors} value={props.row.original} prefixID={prefixID} />
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
      <div className='flex gap-3 items-end mb-3'>
        <span className='w-[24ch] select-none whitespace-nowrap'>
          Выбраны {selected.length} из {schema?.items.length ?? 0}
        </span>
        <div className='flex gap-6 w-full text-sm'>
          <Button
            text='Поставщики'
            title='Добавить все конституенты, от которых зависят выбранные'
            className='w-[7rem]'
            onClick={selectBasis}
          />
          <Button
            text='Потребители'
            title='Добавить все конституенты, которые зависят от выбранных'
            className='w-[7rem]'
            onClick={selectDependant}
          />
        </div>
      </div>
      <DataTable
        id={id}
        dense
        noFooter
        rows={rows}
        contentHeight='1.3rem'
        className={clsx(
          'min-h-[16rem]', // prettier: split lines
          'overflow-y-auto',
          'border',
          'text-sm',
          'select-none'
        )}
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

export default ConstituentaMultiPicker;
