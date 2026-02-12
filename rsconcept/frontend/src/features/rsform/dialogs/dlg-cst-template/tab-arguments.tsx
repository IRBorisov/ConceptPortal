'use client';

import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { createColumnHelper } from '@tanstack/react-table';

import { MiniButton } from '@/components/control';
import { DataTable, type IConditionalStyle } from '@/components/data-table';
import { IconReset } from '@/components/icons';
import { NoData } from '@/components/view';

import { type CreateConstituentaDTO } from '../../backend/types';
import { PickConstituenta } from '../../components/pick-constituenta';
import { RSInput } from '../../components/rs-input';
import { type ArgumentValue, type Constituenta, type RSForm } from '../../models/rsform';
import { isFunctional, isLogical } from '../../models/rsform-api';

import { useTemplateContext } from './template-context';

const argumentsHelper = createColumnHelper<ArgumentValue>();

interface TabArgumentsProps {
  schema: RSForm;
}

export function TabArguments({ schema }: TabArgumentsProps) {
  const { control } = useFormContext<CreateConstituentaDTO>();
  const { args, onChangeArguments } = useTemplateContext();
  const definition = useWatch({ control, name: 'definition_formal' });

  const [selectedCst, setSelectedCst] = useState<Constituenta | null>(null);
  const [selectedArgument, setSelectedArgument] = useState<ArgumentValue | null>(args.length > 0 ? args[0] : null);

  function handleSelectArgument(arg: ArgumentValue) {
    setSelectedArgument(arg);
  }

  function handleSelectConstituenta(cst: Constituenta) {
    setSelectedCst(cst);
    handleAssignArgument(selectedArgument!, cst.alias);
  }

  function handleClearArgument(target: ArgumentValue) {
    const newArg = { ...target, value: '' };
    onChangeArguments(args.map(arg => (arg.alias !== target.alias ? arg : newArg)));
    setSelectedArgument(newArg);
  }

  function handleAssignArgument(target: ArgumentValue, argValue: string) {
    const newArg = { ...target, value: argValue };
    onChangeArguments(args.map(arg => (arg.alias !== target.alias ? arg : newArg)));
    setSelectedArgument(newArg);
  }

  function cstFilter(cst: Constituenta) {
    return cst.id === selectedCst?.id || (!isFunctional(cst.cst_type) && !isLogical(cst.cst_type));
  }

  const filteredItems = schema.items.filter(cstFilter);

  const columns = [
    argumentsHelper.accessor('alias', {
      id: 'alias',
      header: 'Имя',
      size: 40,
      minSize: 40,
      maxSize: 40,
      cell: props => <div className='text-center pr-2'>{props.getValue()}</div>
    }),
    argumentsHelper.accessor(arg => arg.value || 'свободный аргумент', {
      id: 'value',
      header: 'Значение',
      size: 200,
      minSize: 200,
      maxSize: 200
    }),
    argumentsHelper.accessor(arg => arg.typification, {
      id: 'type',
      header: 'Типизация',
      enableHiding: true,
      cell: props => <div className='w-36 text-sm wrap-break-word'>{props.getValue()}</div>
    }),
    argumentsHelper.display({
      id: 'actions',
      size: 0,
      cell: props => (
        <div className='w-6 flex justify-center'>
          {props.row.original.value ? (
            <MiniButton
              title='Очистить значение'
              noPadding
              className='align-middle'
              icon={<IconReset size='1rem' className='cc-remove' />}
              onClick={() => handleClearArgument(props.row.original)}
            />
          ) : null}
        </div>
      )
    })
  ];

  const conditionalRowStyles: IConditionalStyle<ArgumentValue>[] = [
    {
      when: (arg: ArgumentValue) => arg.alias === selectedArgument?.alias,
      className: 'bg-selected'
    }
  ];

  return (
    <div className='cc-fade-in'>
      <DataTable
        dense
        noFooter
        className='h-31 cc-scroll-y text-sm border select-none'
        data={args}
        columns={columns}
        conditionalRowStyles={conditionalRowStyles}
        noDataComponent={<NoData className='min-h-14'>Аргументы отсутствуют</NoData>}
        onRowClicked={handleSelectArgument}
      />

      <h2>Конституенты</h2>

      <PickConstituenta
        id='dlg_argument_picker'
        value={selectedCst}
        items={filteredItems}
        onChange={handleSelectConstituenta}
        rows={7}
      />

      <RSInput
        disabled
        noTooltip
        id='result'
        placeholder='Итоговое определение'
        className='mt-4'
        height='5.1rem'
        value={definition}
      />
    </div>
  );
}
