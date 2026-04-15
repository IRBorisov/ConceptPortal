'use client';

import clsx from 'clsx';

import { CstStatus } from '@/domain/library';

import { cn } from '@/components/utils';
import { globalIDs } from '@/utils/constants';
import { prepareTooltip } from '@/utils/format';
import { isMac } from '@/utils/utils';

import { labelExpressionStatus } from '../../labels';
import { IconExpressionStatus } from '../icon-expression-status';

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
          'border rounded-full',
          'select-none',
          'cursor-pointer',
          'focus-frame outline-none',
          'transition-colors duration-fade',
          'shadow-[8px_6px_16px_-12px]',
          'hover:shadow-none dark:shadow-none',
          'hover:translate-y-px',
          colorStatusBar(status)
        )}
        data-tooltip-id={globalIDs.tooltip}
        data-tooltip-html={prepareTooltip('Проверить определение', isMac() ? 'Cmd + Q' : 'Ctrl + Q')}
        onClick={onAnalyze}
      >
        <div className='cc-fade-in flex items-center gap-1'>
          <IconExpressionStatus size='1rem' value={status} />
          <span className='font-controls pr-1 text-sm'>{labelExpressionStatus(status)}</span>
        </div>
      </div>
    </div>
  );
}

/** Determines statusbar color for {@link CstStatus}. */
function colorStatusBar(status: CstStatus): string {
  // prettier-ignore
  switch (status) {
    case CstStatus.VERIFIED: return 'pill-green';
    case CstStatus.INCORRECT: return 'pill-red';
    case CstStatus.INCALCULABLE: return 'pill-orange';
    case CstStatus.PROPERTY: return 'pill-teal';
    case CstStatus.UNKNOWN: return 'pill-blue';
    case CstStatus.UNDEFINED: return 'pill-info';
  }
}
