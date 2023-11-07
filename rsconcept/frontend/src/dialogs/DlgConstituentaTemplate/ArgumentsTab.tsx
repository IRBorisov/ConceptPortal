import { createColumnHelper } from '@tanstack/react-table';
import { Dispatch, useCallback, useEffect, useMemo, useState } from 'react';

import MiniButton from '../../components/Common/MiniButton';
import DataTable, { IConditionalStyle } from '../../components/DataTable';
import { CheckIcon, CrossIcon } from '../../components/Icons';
import RSInput from '../../components/RSInput';
import ConstituentaPicker from '../../components/Shared/ConstituentaPicker';
import { useConceptTheme } from '../../context/ThemeContext';
import { IConstituenta, IRSForm } from '../../models/rsform';
import { IArgumentValue } from '../../models/rslang';
import { prefixes } from '../../utils/constants';

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
    target.value = '';
    partialUpdate({
      arguments: [
        target,
        ...state.arguments.filter(arg => arg.alias !== target.alias)
      ]
    });
  }, [partialUpdate, state.arguments]);

  const handleAssignArgument = useCallback(
  (target: IArgumentValue, value: string) => {
    target.value = value;
    partialUpdate({
      arguments: [
        target,
        ...state.arguments.filter(arg => arg.alias !== target.alias)
      ]
    });
  }, [partialUpdate, state.arguments]);

  const columns = useMemo(
  () => [
    argumentsHelper.accessor('alias', {
      id: 'alias',
      header: 'Имя',
      size: 40,
      minSize: 40,
      maxSize: 40,
      cell: props => <div className='w-full text-center'>{props.getValue()}</div>
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
      cell: props => <div className='text-sm min-w-[9.3rem] max-w-[9.3rem] break-words'>{props.getValue()}</div>
    }),
    argumentsHelper.display({
      id: 'actions',
      size: 50,
      minSize: 50,
      maxSize: 50,
      cell: props => 
        <div className='max-h-[1.2rem]'>
        {props.row.original.value && 
        <MiniButton
          tooltip='Очистить значение'
          icon={<CrossIcon size={3} color='text-warning'/>}
          noHover
          onClick={() => handleClearArgument(props.row.original)}
        />}
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

    <div className='overflow-y-auto text-sm border select-none max-h-[5.8rem] min-h-[5.8rem]'>
      <DataTable dense noFooter
        data={state.arguments}
        columns={columns}
        conditionalRowStyles={conditionalRowStyles}
        noDataComponent={
          <span className='flex flex-col justify-center p-2 text-center min-h-[3.6rem]'>
            <p>Аргументы отсутствуют</p>
          </span>
        }
        onRowClicked={handleSelectArgument}
      />
    </div>

    <div className='flex items-center justify-center w-full gap-2 py-1 select-none'>
      <span title='Выберите аргумент из списка сверху и значение из списка снизу'
        className='font-semibold text-center'
      >
        {selectedArgument?.alias || 'ARG'}
      </span>
      <span>=</span>
      <RSInput
        dimensions='max-w-[12rem] w-full'
        value={argumentValue}
        noTooltip
        onChange={newValue => setArgumentValue(newValue)}
      />
      <MiniButton
        tooltip='Подставить значение аргумента'
        icon={<CheckIcon
          size={6}
          color={!argumentValue || !selectedArgument ? 'text-disabled' : 'text-success'}
        />}
        disabled={!argumentValue || !selectedArgument}
        onClick={() => handleAssignArgument(selectedArgument!, argumentValue)}
      />
    </div>

    <ConstituentaPicker
      value={selectedCst}
      data={schema?.items}
      onSelectValue={handleSelectConstituenta}
      prefixID={prefixes.cst_modal_list}
      rows={7}
    />

    <RSInput id='result'
      dimensions='w-full mt-[0.3rem]'
      placeholder='Итоговое определение'
      height='4.9rem'
      value={state.definition}
      disabled
    />
  </div>);
}

export default ArgumentsTab;
