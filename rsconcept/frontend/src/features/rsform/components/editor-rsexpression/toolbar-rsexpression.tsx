'use client';

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
  const showControls = usePreferencesStore(state => state.showExpressionControls);
  const toggleControls = usePreferencesStore(state => state.toggleShowExpressionControls);

  return (
    <div className={cn('cc-icons', className)}>
      {helpTopic ? <BadgeHelp topic={helpTopic} offset={4} /> : null}
      {!disabled || isProcessing ? (
        <MiniButton
          title='Символьная клавиатура'
          icon={<IconShowKeyboard value={showControls} size='1.25rem' className='hover:text-primary' />}
          onClick={toggleControls}
        />
      ) : null}
      <MiniButton
        title='Структура типизации'
        icon={<IconTypeGraph size='1.25rem' className='hover:text-primary' />}
        onClick={showTypeGraph}
      />
      <MiniButton
        title='Структура выражения'
        onClick={showAST}
        icon={<IconTree size='1.25rem' className='hover:text-primary' />}
      />
    </div>
  );
}
