'use client';

import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { createColumnHelper } from '@tanstack/react-table';
import clsx from 'clsx';

import { MiniButton } from '@/components/Control';
import { DataTable, IConditionalStyle } from '@/components/DataTable';
import { IconAccept, IconRemove, IconReset } from '@/components/Icons';
import { NoData } from '@/components/View';
import { useDialogsStore } from '@/stores/dialogs';
import { APP_COLORS } from '@/styling/colors';

import { ICstCreateDTO } from '../../backend/types';
import { PickConstituenta } from '../../components/PickConstituenta';
import { RSInput } from '../../components/RSInput';
import { IConstituenta } from '../../models/rsform';
import { IArgumentValue } from '../../models/rslang';

import { DlgCstTemplateProps } from './DlgCstTemplate';
import { useTemplateContext } from './TemplateContext';

const argumentsHelper = createColumnHelper<IArgumentValue>();

export function TabArguments() {
  const { schema } = useDialogsStore(state => state.props as DlgCstTemplateProps);
  const { control } = useFormContext<ICstCreateDTO>();
  const { args, onChangeArguments } = useTemplateContext();
  const definition = useWatch({ control, name: 'definition_formal' });

  const [selectedCst, setSelectedCst] = useState<IConstituenta | null>(null);
  const [selectedArgument, setSelectedArgument] = useState<IArgumentValue | null>(args.length > 0 ? args[0] : null);

  const [argumentValue, setArgumentValue] = useState('');

  function handleSelectArgument(arg: IArgumentValue) {
    setSelectedArgument(arg);
    if (arg.value) {
      setArgumentValue(arg.value);
    }
  }

  function handleSelectConstituenta(cst: IConstituenta) {
    setSelectedCst(cst);
    setArgumentValue(cst.alias);
  }

  function handleClearArgument(target: IArgumentValue) {
    const newArg = { ...target, value: '' };
    onChangeArguments(args.map(arg => (arg.alias !== target.alias ? arg : newArg)));
    setSelectedArgument(newArg);
  }

  function handleReset() {
    setArgumentValue(selectedArgument?.value ?? '');
  }

  function handleAssignArgument(target: IArgumentValue, argValue: string) {
    const newArg = { ...target, value: argValue };
    onChangeArguments(args.map(arg => (arg.alias !== target.alias ? arg : newArg)));
    setSelectedArgument(newArg);
  }

  const columns = [
    argumentsHelper.accessor('alias', {
      id: 'alias',
      size: 40,
      minSize: 40,
      maxSize: 40,
      cell: props => <div className='text-center'>{props.getValue()}</div>
    }),
    argumentsHelper.accessor(arg => arg.value || 'свободный аргумент', {
      id: 'value',
      size: 200,
      minSize: 200,
      maxSize: 200
    }),
    argumentsHelper.accessor(arg => arg.typification, {
      id: 'type',
      enableHiding: true,
      cell: props => (
        <div
          className={clsx(
            'min-w-[9.3rem] max-w-[9.3rem]', //
            'text-sm break-words'
          )}
        >
          {props.getValue()}
        </div>
      )
    }),
    argumentsHelper.display({
      id: 'actions',
      size: 0,
      cell: props => (
        <div className='h-[1.25rem] w-[1.25rem]'>
          {props.row.original.value ? (
            <MiniButton
              title='Очистить значение'
              noPadding
              noHover
              icon={<IconRemove size='1.25rem' className='icon-red' />}
              onClick={() => handleClearArgument(props.row.original)}
            />
          ) : null}
        </div>
      )
    })
  ];

  const conditionalRowStyles: IConditionalStyle<IArgumentValue>[] = [
    {
      when: (arg: IArgumentValue) => arg.alias === selectedArgument?.alias,
      style: { backgroundColor: APP_COLORS.bgSelected }
    }
  ];

  return (
    <div className='cc-fade-in'>
      <DataTable
        dense
        noFooter
        noHeader
        className={clsx(
          'max-h-[5.8rem] min-h-[5.8rem]', //
          'cc-scroll-y',
          'text-sm',
          'border',
          'select-none'
        )}
        data={args}
        columns={columns}
        conditionalRowStyles={conditionalRowStyles}
        noDataComponent={<NoData className='min-h-[3.6rem]'>Аргументы отсутствуют</NoData>}
        onRowClicked={handleSelectArgument}
      />

      <div
        className={clsx(
          'my-4', //
          'flex gap-2 justify-center items-center',
          'select-none'
        )}
      >
        <span
          title='Выберите аргумент из списка сверху и значение из списка снизу'
          className='font-semibold text-center'
        >
          {selectedArgument?.alias || 'ARG'}
        </span>
        <span>=</span>
        <RSInput
          noTooltip
          className='w-[12rem]'
          value={argumentValue}
          onChange={newValue => setArgumentValue(newValue)}
        />
        <div className='flex'>
          <MiniButton
            title='Подставить значение аргумента'
            noHover
            className='py-0'
            icon={<IconAccept size='1.5rem' className='icon-green' />}
            disabled={!argumentValue || !selectedArgument}
            onClick={() => handleAssignArgument(selectedArgument!, argumentValue)}
          />
          <MiniButton
            title='Очистить поле'
            noHover
            className='py-0'
            onClick={handleReset}
            icon={<IconReset size='1.5rem' className='icon-primary' />}
          />
        </div>
      </div>

      <PickConstituenta
        id='dlg_argument_picker'
        value={selectedCst}
        items={schema.items}
        onChange={handleSelectConstituenta}
        rows={7}
      />

      <RSInput
        disabled
        noTooltip
        id='result'
        placeholder='Итоговое определение'
        className='mt-[1.2rem]'
        height='5.1rem'
        value={definition}
      />
    </div>
  );
}
