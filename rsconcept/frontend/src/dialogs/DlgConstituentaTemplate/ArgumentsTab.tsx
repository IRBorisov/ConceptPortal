'use client';

import { createColumnHelper } from '@tanstack/react-table';
import clsx from 'clsx';
import { Dispatch, useCallback, useEffect, useMemo, useState } from 'react';

import MiniButton from '@/components/Common/MiniButton';
import DataTable, { IConditionalStyle } from '@/components/DataTable';
import { ArrowsRotateIcon, CheckIcon, CrossIcon } from '@/components/Icons';
import RSInput from '@/components/RSInput';
import ConstituentaPicker from '@/components/Shared/ConstituentaPicker';
import { useConceptTheme } from '@/context/ThemeContext';
import { IConstituenta, IRSForm } from '@/models/rsform';
import { IArgumentValue } from '@/models/rslang';
import { prefixes } from '@/utils/constants';

interface ArgumentsTabProps {
  state: IArgumentsState
  schema: IRSForm
  partialUpdate: Dispatch<Partial<IArgumentsState>>
}

export interface IArgumentsState {
  arguments: IArgumentValue[]
  definition: string
}

const argumentsHelper = createColumnHelper<IArgumentValue>();

function ArgumentsTab({ state, schema, partialUpdate  }: ArgumentsTabProps) {
  const { colors } = useConceptTheme();
  
  const [selectedCst, setSelectedCst] = useState<IConstituenta | undefined>(undefined);
  const [selectedArgument, setSelectedArgument] = useState<IArgumentValue | undefined>(undefined);

  const [argumentValue, setArgumentValue] = useState('');

  const selectedClearable = useMemo(
  () => {
    return argumentValue && !!selectedArgument && !!selectedArgument.value;
  }, [argumentValue, selectedArgument]);

  const isModified = useMemo(
  () => (selectedArgument && argumentValue !== selectedArgument.value),
  [selectedArgument, argumentValue]);

  useEffect(
  () => {
    if (!selectedArgument && state.arguments.length > 0) {
      setSelectedArgument(state.arguments[0]);
    }
  }, [state.arguments, selectedArgument]);

  const handleSelectArgument = useCallback(
  (arg: IArgumentValue) => {
    setSelectedArgument(arg);
    if (arg.value) {
      setArgumentValue(arg.value);
    }
  }, []);

  const handleSelectConstituenta = useCallback(
  (cst: IConstituenta) => {
    setSelectedCst(cst);
    setArgumentValue(cst.alias);
  }, []);

  const handleClearArgument = useCallback(
  (target: IArgumentValue) => {
    const newArg = { ...target, value: '' }
    partialUpdate({
      arguments: state.arguments.map((arg) => (arg.alias !== target.alias ? arg : newArg))
    });
    setSelectedArgument(newArg);
  }, [partialUpdate, state.arguments]);

  const handleReset = useCallback(
  () => {
    setArgumentValue(selectedArgument?.value ?? '');
  }, [selectedArgument]);

  const handleAssignArgument = useCallback(
  (target: IArgumentValue, value: string) => {
    const newArg = { ...target, value: value }
    partialUpdate({
      arguments: state.arguments.map((arg) => (arg.alias !== target.alias ? arg : newArg))
    });
    setSelectedArgument(newArg);
  }, [partialUpdate, state.arguments]);

  const columns = useMemo(
  () => [
    argumentsHelper.accessor('alias', {
      id: 'alias',
      header: 'Имя',
      size: 40,
      minSize: 40,
      maxSize: 40,
      cell: props => 
        <div className='w-full text-center'>
          {props.getValue()}
        </div>
    }),
    argumentsHelper.accessor(arg => arg.value || 'свободный аргумент', {
      id: 'value',
      header: 'Значение',
      size: 200,
      minSize: 200,
      maxSize: 200,
    }),
    argumentsHelper.accessor(arg => arg.typification, {
      id: 'type',
      header: 'Типизация',
      size: 150,
      minSize: 150,
      maxSize: 150,
      enableHiding: true,
      cell: props => 
        <div className={clsx(
          'min-w-[9.3rem] max-w-[9.3rem]',
          'text-sm break-words'
        )}>
          {props.getValue()}
        </div>
    }),
    argumentsHelper.display({
      id: 'actions',
      size: 50,
      minSize: 50,
      maxSize: 50,
      cell: props => 
        <div className='max-h-[1.2rem]'>
        {props.row.original.value ?
        <MiniButton
          tooltip='Очистить значение'
          icon={<CrossIcon size={3} color='clr-text-warning'/>}
          noHover
          onClick={() => handleClearArgument(props.row.original)}
        /> : null}
        </div>
    })
  ], [handleClearArgument]);

  const conditionalRowStyles = useMemo(
  (): IConditionalStyle<IArgumentValue>[] => [{
    when: (arg: IArgumentValue) => arg.alias === selectedArgument?.alias,
    style: { backgroundColor: colors.bgSelected },
  }], [selectedArgument, colors]);

  return (
  <div className='flex flex-col gap-3'>
    <div className={clsx(
      'max-h-[5.8rem] min-h-[5.8rem]',
      'overflow-y-auto',
      'text-sm',
      'border',
      'select-none'
    )}>
      <DataTable dense noFooter
        data={state.arguments}
        columns={columns}
        conditionalRowStyles={conditionalRowStyles}
        noDataComponent={
          <p className={clsx(
            'min-h-[3.6rem] w-full',
            'p-2',
            'text-center'
          )}>
            Аргументы отсутствуют
          </p>
        }
        onRowClicked={handleSelectArgument}
      />
    </div>

    <div className={clsx(
      'py-1 flex gap-2 justify-center items-center',
      'w-full',
      'select-none'
    )}>
      <span title='Выберите аргумент из списка сверху и значение из списка снизу'
        className='font-semibold text-center'
      >
        {selectedArgument?.alias || 'ARG'}
      </span>
      <span>=</span>
      <RSInput noTooltip
        dimensions='max-w-[12rem] w-full'
        value={argumentValue}
        onChange={newValue => setArgumentValue(newValue)}
      />
      <div className='flex'>
        <MiniButton
          tooltip='Подставить значение аргумента'
          icon={<CheckIcon size={5} color={!argumentValue || !selectedArgument ? 'text-disabled' : 'clr-text-success'} />}
          disabled={!argumentValue || !selectedArgument}
          onClick={() => handleAssignArgument(selectedArgument!, argumentValue)}
        />
        <MiniButton
          tooltip='Откатить значение'
          disabled={!isModified}
          onClick={handleReset}
          icon={<ArrowsRotateIcon size={5} color={isModified ? 'clr-text-primary' : ''} />}
        />
        <MiniButton
          tooltip='Очистить значение аргумента'
          disabled={!selectedClearable}
          icon={<CrossIcon size={5} color={!selectedClearable ? 'text-disabled' : 'clr-text-warning'}/>}
          onClick={() => selectedArgument ? handleClearArgument(selectedArgument) : undefined}
        />
      </div>
    </div>

    <ConstituentaPicker
      value={selectedCst}
      data={schema?.items}
      onSelectValue={handleSelectConstituenta}
      prefixID={prefixes.cst_modal_list}
      rows={7}
    />

    <RSInput id='result'
      placeholder='Итоговое определение'
      height='5.1rem'
      dimensions='w-full mt-[0.45rem]'
      value={state.definition}
      disabled
    />
  </div>);
}

export default ArgumentsTab;