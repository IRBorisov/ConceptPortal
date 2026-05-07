'use client';

import { useTx } from '@/i18n';

import { MiniButton } from '@/components/control';
import { IconGraphInputs, IconGraphOutputs, IconReset } from '@/components/icons';
import { cn } from '@/components/utils';

import { useTermGraphStore } from '../../stores/term-graph';

interface ToolbarFocusedCstProps {
  className?: string;
  resetFocus: () => void;
}

export function ToolbarFocusedCst({ resetFocus, className }: ToolbarFocusedCstProps) {
  const tx = useTx();
  const filter = useTermGraphStore(state => state.filter);
  const toggleFocusInputs = useTermGraphStore(state => state.toggleFocusInputs);
  const toggleFocusOutputs = useTermGraphStore(state => state.toggleFocusOutputs);

  return (
    <div className={cn('grid', className)}>
      <div className='flex items-center cc-icons'>
        <MiniButton
          title={tx('tx.termGraph.focus.reset')}
          icon={<IconReset size='1.25rem' className='icon-primary' />}
          onClick={resetFocus}
        />
        <MiniButton
          title={filter.focusShowInputs ? tx('tx.graph.node.parent.hide') : tx('tx.graph.node.parent.show')}
          icon={<IconGraphInputs size='1.25rem' className={filter.focusShowInputs ? 'icon-green' : 'icon-primary'} />}
          onClick={toggleFocusInputs}
        />
        <MiniButton
          title={filter.focusShowOutputs ? tx('tx.graph.node.child.hide') : tx('tx.graph.node.child.show')}
          icon={<IconGraphOutputs size='1.25rem' className={filter.focusShowOutputs ? 'icon-green' : 'icon-primary'} />}
          onClick={toggleFocusOutputs}
        />
      </div>
    </div>
  );
}
