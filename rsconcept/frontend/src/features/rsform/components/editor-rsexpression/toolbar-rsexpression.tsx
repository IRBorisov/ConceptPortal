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
  showAST: (event: React.MouseEvent<Element>) => void;
  showTypeGraph: (event: React.MouseEvent<Element>) => void;
}

export function ToolbarRSExpression({
  className,
  disabled,
  isProcessing,
  helpTopic,
  showTypeGraph,
  showAST
}: ToolbarRSExpressionProps) {
  const tx = useTx();
  const showControls = usePreferencesStore(state => state.showExpressionControls);
  const toggleControls = usePreferencesStore(state => state.toggleShowExpressionControls);

  return (
    <div className={cn('cc-icons', className)}>
      {helpTopic ? <BadgeHelp topic={helpTopic} offset={4} /> : null}
      {!disabled || isProcessing ? (
        <MiniButton
          title={tx('ui.rsexpr.toolbar.symbolKeyboardTitle', 'Symbol keyboard')}
          icon={<IconShowKeyboard value={showControls} size='1.25rem' className='hover:text-primary' />}
          onClick={toggleControls}
        />
      ) : null}
      <MiniButton
        title={tx('ui.rsexpr.toolbar.typificationStructureTitle', 'Typing structure')}
        icon={<IconTypeGraph size='1.25rem' className='hover:text-primary' />}
        onClick={showTypeGraph}
      />
      <MiniButton
        title={tx('ui.rsexpr.toolbar.expressionStructureTitle', 'Expression structure')}
        onClick={showAST}
        icon={<IconTree size='1.25rem' className='hover:text-primary' />}
      />
    </div>
  );
}
