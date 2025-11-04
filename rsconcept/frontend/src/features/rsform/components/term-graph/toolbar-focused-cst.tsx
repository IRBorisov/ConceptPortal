'use client';

import clsx from 'clsx';

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
      <div
        className={clsx(
          'translate-x-1/2',
          'w-full text-right',
          'px-1',
          'select-none',
          'hover:bg-background',
          'text-accent-purple-foreground rounded-md'
        )}
      >
        <span aria-label='Фокус-конституента' className='whitespace-nowrap'>
          Фокус
          <b> {focus.alias} </b>
        </span>
      </div>
    </div>
  );
}
