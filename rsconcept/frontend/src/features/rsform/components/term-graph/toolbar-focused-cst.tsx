import { type IConstituenta } from '@/features/rsform/models/rsform';

import { MiniButton } from '@/components/control';
import { IconGraphInputs, IconGraphOutputs, IconReset } from '@/components/icons';
import { cn } from '@/components/utils';

interface ToolbarFocusedCstProps {
  className?: string;
  focus: IConstituenta | null;
  resetFocus: () => void;

  showInputs: boolean;
  toggleShowInputs: () => void;

  showOutputs: boolean;
  toggleShowOutputs: () => void;
}

export function ToolbarFocusedCst({
  focus,
  resetFocus,
  className,
  showInputs,
  toggleShowInputs,
  showOutputs,
  toggleShowOutputs
}: ToolbarFocusedCstProps) {
  if (!focus) {
    return null;
  }

  return (
    <div className={cn('flex items-center cc-icons', className)}>
      <div className='w-31 mt-0.5 text-right select-none text-(--acc-fg-purple)'>
        <span>
          Фокус
          <b> {focus.alias} </b>
        </span>
      </div>

      <MiniButton
        title='Сбросить фокус'
        icon={<IconReset size='1.25rem' className='icon-primary' />}
        onClick={resetFocus}
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
