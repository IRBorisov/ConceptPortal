'use client';

import clsx from 'clsx';

import { EvalStatus } from '@/domain/library';

import { cn } from '@/components/utils';
import { globalIDs } from '@/utils/constants';

import { IconEvalStatus } from '../../components/icon-eval-status';
import { labelEvalStatus } from '../../labels';

interface StatusBarProps {
  className?: string;
  status: EvalStatus;
  onCalculate?: (event: React.MouseEvent<Element>) => void;
}

export function StatusBar({ className, status, onCalculate }: StatusBarProps) {
  return (
    <div className={cn('pl-22 xs:pl-8 flex gap-1', className)}>
      <div
        tabIndex={0}
        className={clsx(
          'w-42 h-7',
          'px-2 flex items-center justify-center',
          'border rounded-full',
          'select-none',
          onCalculate && 'cursor-pointer',
          'focus-frame outline-none',
          'transition-colors duration-fade',
          'shadow-[8px_6px_16px_-12px]',
          'hover:shadow-none dark:shadow-none',
          'hover:translate-y-px',
          colorStatusBar(status)
        )}
        data-tooltip-id={onCalculate ? globalIDs.tooltip : undefined}
        data-tooltip-content='Вычислить значение'
        onClick={onCalculate}
      >
        <div className='cc-fade-in flex items-center gap-1'>
          <IconEvalStatus size='1rem' value={status} />
          <span className='font-controls pr-1 text-sm'>{labelEvalStatus(status)}</span>
        </div>
      </div>
    </div>
  );
}

/** Determines statusbar color for {@link EvalStatus}. */
function colorStatusBar(status: EvalStatus): string {
  // prettier-ignore
  switch (status) {
    case EvalStatus.NO_EVAL: return 'bg-input';
    case EvalStatus.NOT_PROCESSED: return 'pill-blue';
    case EvalStatus.EVAL_FAIL: return 'pill-red';
    case EvalStatus.INVALID_DATA: return 'pill-purple';
    case EvalStatus.AXIOM_FALSE: return 'pill-orange';
    case EvalStatus.EMPTY: return 'pill-teal';
    case EvalStatus.HAS_DATA: return 'pill-green';
  }
}
