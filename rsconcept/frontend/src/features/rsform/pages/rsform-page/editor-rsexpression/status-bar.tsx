'use client';

import clsx from 'clsx';

import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components/badge-help';

import { cn } from '@/components/utils';
import { globalIDs } from '@/utils/constants';
import { isMac, prepareTooltip } from '@/utils/utils';

import { colorStatusBar } from '../../../colors';
import { IconExpressionStatus } from '../../../components/icon-expression-status';
import { labelExpressionStatus } from '../../../labels';
import { type CstStatus } from '../../../models/rsform';

interface StatusBarProps {
  className?: string;
  status: CstStatus;
  onAnalyze: (event: React.MouseEvent<Element>) => void;
}

export function StatusBar({ className, status, onAnalyze }: StatusBarProps) {
  return (
    <div className={cn('pl-22 xs:pl-8 flex gap-1', className)}>
      <div
        tabIndex={0}
        className={clsx(
          'w-32 h-7',
          'px-2 flex items-center justify-center',
          'border',
          'select-none',
          'cursor-pointer',
          'focus-frame outline-none',
          'transition-colors duration-fade'
        )}
        style={{ backgroundColor: colorStatusBar(status) }}
        data-tooltip-id={globalIDs.tooltip}
        data-tooltip-html={prepareTooltip('Проверить определение', isMac() ? 'Cmd + Q' : 'Ctrl + Q')}
        onClick={onAnalyze}
      >
        <div className='cc-fade-in flex items-center gap-1'>
          <IconExpressionStatus size='1rem' value={status} />
          <span className='font-controls pr-1 text-sm'>{labelExpressionStatus(status)}</span>
        </div>
      </div>
      <BadgeHelp topic={HelpTopic.UI_CST_STATUS} offset={4} />
    </div>
  );
}
