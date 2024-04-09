'use client';

import { useCallback } from 'react';

import { IconGraphInputs, IconGraphOutputs, IconReset } from '@/components/Icons';
import MiniButton from '@/components/ui/MiniButton';
import { useConceptOptions } from '@/context/OptionsContext';
import { IConstituenta } from '@/models/rsform';

import { useRSEdit } from '../RSEditContext';

interface FocusToolbarProps {
  center: IConstituenta;
  showInputs: boolean;
  showOutputs: boolean;

  reset: () => void;
  toggleShowInputs: () => void;
  toggleShowOutputs: () => void;
}

function FocusToolbar({
  center,
  reset,
  showInputs,
  showOutputs,
  toggleShowInputs,
  toggleShowOutputs
}: FocusToolbarProps) {
  const { colors } = useConceptOptions();
  const controller = useRSEdit();

  const resetSelection = useCallback(() => {
    reset();
    controller.setSelected([]);
  }, [reset, controller]);

  return (
    <div className='cc-icons items-center'>
      <div className='w-[7.8rem] text-right select-none' style={{ color: colors.fgPurple }}>
        Фокус
        <b className='px-1'> {center.alias} </b>
      </div>
      <MiniButton
        titleHtml='Сбросить фокус'
        icon={<IconReset size='1.25rem' className='icon-primary' />}
        onClick={resetSelection}
      />
      <MiniButton
        title={showInputs ? 'Скрыть поставщиков' : 'Отобразить поставщиков'}
        icon={
          showInputs ? (
            <IconGraphInputs size='1.25rem' className='icon-green' />
          ) : (
            <IconGraphInputs size='1.25rem' className='icon-primary' />
          )
        }
        onClick={toggleShowInputs}
      />
      <MiniButton
        title={showOutputs ? 'Скрыть потребителей' : 'Отобразить потребителей'}
        icon={
          showOutputs ? (
            <IconGraphOutputs size='1.25rem' className='icon-green' />
          ) : (
            <IconGraphOutputs size='1.25rem' className='icon-primary' />
          )
        }
        onClick={toggleShowOutputs}
      />
    </div>
  );
}

export default FocusToolbar;
