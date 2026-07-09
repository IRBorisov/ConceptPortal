'use client';

import { useTx } from '@/i18n';

import { type HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components/badge-help';

import { MiniButton } from '@/components/control';
import { IconTree, IconTypeGraph } from '@/components/icons';
import { cn } from '@/components/utils';
import { usePreferencesStore } from '@/stores/preferences';

import { IconShowKeyboard } from '../icon-show-keyboard';

interface ToolbarRSExpressionProps {
  className?: string;
  disabled?: boolean;
  isProcessing?: boolean;
  helpTopic?: HelpTopic;
  hideTypeGraph?: boolean;
  showAST: (event: React.MouseEvent<Element>) => void;
  showTypeGraph: (event: React.MouseEvent<Element>) => void;
}

export function ToolbarRSExpression({
  className,
  disabled,
  isProcessing,
  helpTopic,
  hideTypeGraph,
  showTypeGraph,
  showAST
}: ToolbarRSExpressionProps) {
  const tx = useTx();
  const showControls = usePreferencesStore(state => state.showExpressionControls);
  const toggleControls = usePreferencesStore(state => state.toggleShowExpressionControls);

  return (
    <div className={cn('cc-icons', className)} data-tour='concept-tools'>
      {helpTopic ? <BadgeHelp topic={helpTopic} offset={4} /> : null}
      {!disabled || isProcessing ? (
        <MiniButton
          title={tx('tx.rsexpression.keyboard')}
          icon={<IconShowKeyboard value={showControls} size='1.25rem' className='hover:text-primary' />}
          onClick={toggleControls}
        />
      ) : null}
      {!hideTypeGraph ? (
        <MiniButton
          title={tx('tx.typeGraph.fromExpression')}
          icon={<IconTypeGraph size='1.25rem' className='hover:text-primary' />}
          onClick={showTypeGraph}
        />
      ) : null}
      <MiniButton
        title={tx('tx.rsexpression.ast.hint')}
        onClick={showAST}
        icon={<IconTree size='1.25rem' className='hover:text-primary' />}
      />
    </div>
  );
}
