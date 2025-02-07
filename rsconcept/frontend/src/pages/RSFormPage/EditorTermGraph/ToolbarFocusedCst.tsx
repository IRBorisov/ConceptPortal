'use client';

import { IconGraphInputs, IconGraphOutputs, IconReset } from '@/components/Icons';
import { MiniButton } from '@/components/ui/Control';
import { IConstituenta } from '@/models/rsform';
import { APP_COLORS } from '@/styling/color';

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
  const controller = useRSEdit();

  function resetSelection() {
    reset();
    controller.setSelected([]);
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

export default ToolbarFocusedCst;
