'use client';

import clsx from 'clsx';

import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components/badge-help';

import { cn } from '@/components/utils';
import { globalIDs } from '@/utils/constants';

import { colorStatusBar } from '../../../colors';
import { IconEvalStatus } from '../../../components/icon-eval-status';
import { labelEvalStatus } from '../../../labels';
import { type EvalStatus } from '../../../models/rsmodel';

interface StatusBarProps {
  className?: string;
  status: EvalStatus;
  onCalculate?: (event: React.MouseEvent<Element>) => void;
}

// TODO: use different help ID for statuses

export function StatusBar({ className, status, onCalculate }: StatusBarProps) {
  return (
    <div className={cn('pl-22 xs:pl-8 flex gap-1', className)}>
      <div
        tabIndex={0}
        className={clsx(
          'w-42 h-6',
          'px-2 flex items-center justify-center',
          'border',
          'select-none',
          onCalculate && 'cursor-pointer',
          'focus-frame outline-none',
          'transition-colors duration-fade'
        )}
        style={{ backgroundColor: colorStatusBar(status) }}
        data-tooltip-id={onCalculate ? globalIDs.tooltip : undefined}
        data-tooltip-content='Вычислить значение'
        onClick={onCalculate}
      >
        <div className='cc-fade-in flex items-center gap-1'>
          <IconEvalStatus size='1rem' value={status} />
          <span className='font-controls pr-1 text-sm'>{labelEvalStatus(status)}</span>
        </div>
      </div>
      <BadgeHelp className='-mt-0.5' topic={HelpTopic.UI_CST_STATUS} offset={4} />
    </div>
  );
}
