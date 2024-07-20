'use client';

import { useCallback } from 'react';

import { IconGraphInputs, IconGraphOutputs, IconReset } from '@/components/Icons';
import MiniButton from '@/components/ui/MiniButton';
import { useConceptOptions } from '@/context/ConceptOptionsContext';
import { IConstituenta } from '@/models/rsform';

import { useRSEdit } from '../RSEditContext';

interface ToolbarFocusedCstProps {
  center: IConstituenta;
  showInputs: boolean;
  showOutputs: boolean;

  reset: () => void;
  toggleShowInputs: () => void;
  toggleShowOutputs: () => void;
}

function ToolbarFocusedCst({
  center,
  reset,
  showInputs,
  showOutputs,
  toggleShowInputs,
  toggleShowOutputs
}: ToolbarFocusedCstProps) {
  const { colors } = useConceptOptions();
  const controller = useRSEdit();

  const resetSelection = useCallback(() => {
    reset();
    controller.setSelected([]);
  }, [reset, controller]);

  return (
    <div className='items-center cc-icons'>
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
        icon={<IconGraphInputs size='1.25rem' className={showInputs ? 'icon-green' : 'icon-primary'} />}
        onClick={toggleShowInputs}
      />
      <MiniButton
        title={showOutputs ? 'Скрыть потребителей' : 'Отобразить потребителей'}
        icon={<IconGraphOutputs size='1.25rem' className={showOutputs ? 'icon-green' : 'icon-primary'} />}
        onClick={toggleShowOutputs}
      />
    </div>
  );
}

export default ToolbarFocusedCst;
