import { type IConstituenta } from '@/features/rsform/models/rsform';

import { MiniButton } from '@/components/control';
import { IconGraphInputs, IconGraphOutputs, IconReset } from '@/components/icons';
import { cn } from '@/components/utils';

import { useTermGraphStore } from '../../stores/term-graph';

interface ToolbarFocusedCstProps {
  className?: string;
  focus: IConstituenta;
  resetFocus: () => void;
}

export function ToolbarFocusedCst({ focus, resetFocus, className }: ToolbarFocusedCstProps) {
  const filter = useTermGraphStore(state => state.filter);
  const toggleFocusInputs = useTermGraphStore(state => state.toggleFocusInputs);
  const toggleFocusOutputs = useTermGraphStore(state => state.toggleFocusOutputs);

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
        title={filter.focusShowInputs ? 'Скрыть поставщиков' : 'Отобразить поставщиков'}
        icon={<IconGraphInputs size='1.25rem' className={filter.focusShowInputs ? 'icon-green' : 'icon-primary'} />}
        onClick={toggleFocusInputs}
      />
      <MiniButton
        title={filter.focusShowOutputs ? 'Скрыть потребителей' : 'Отобразить потребителей'}
        icon={<IconGraphOutputs size='1.25rem' className={filter.focusShowOutputs ? 'icon-green' : 'icon-primary'} />}
        onClick={toggleFocusOutputs}
      />
    </div>
  );
}
