'use client';

import { MiniButton } from '@/components/Control';
import { IconGraphInputs, IconGraphOutputs, IconReset } from '@/components/Icons';
import { APP_COLORS } from '@/styling/colors';

import { IConstituenta } from '../../../models/rsform';
import { useRSEdit } from '../RSEditContext';

interface ToolbarFocusedCstProps {
  center: IConstituenta;
  showInputs: boolean;
  showOutputs: boolean;

  reset: () => void;
  toggleShowInputs: () => void;
  toggleShowOutputs: () => void;
}

export function ToolbarFocusedCst({
  center,
  reset,
  showInputs,
  showOutputs,
  toggleShowInputs,
  toggleShowOutputs
}: ToolbarFocusedCstProps) {
  const { deselectAll } = useRSEdit();

  function resetSelection() {
    reset();
    deselectAll();
  }

  return (
    <div className='items-center cc-icons'>
      <div className='w-[7.8rem] text-right select-none' style={{ color: APP_COLORS.fgPurple }}>
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
