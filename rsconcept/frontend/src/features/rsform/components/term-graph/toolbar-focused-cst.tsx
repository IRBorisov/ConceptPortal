'use client';

import { MiniButton } from '@/components/control';
import { IconGraphInputs, IconGraphOutputs, IconReset } from '@/components/icons';
import { cn } from '@/components/utils';

import { useTermGraphStore } from '../../stores/term-graph';

interface ToolbarFocusedCstProps {
  className?: string;
  resetFocus: () => void;
}

export function ToolbarFocusedCst({ resetFocus, className }: ToolbarFocusedCstProps) {
  const filter = useTermGraphStore(state => state.filter);
  const toggleFocusInputs = useTermGraphStore(state => state.toggleFocusInputs);
  const toggleFocusOutputs = useTermGraphStore(state => state.toggleFocusOutputs);

  return (
    <div className={cn('grid', className)}>
      <div className='flex items-center cc-icons'>
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
    </div>
  );
}
