'use client';

import { globalIDs } from '@/utils/constants';

import { type Styling, type Titled } from '../props';
import { cn } from '../utils';

const MAX_VISIBLE_VALUE = 99;

export type PillType = 'destructive' | 'info' | 'muted' | 'green' | 'orange' | 'purple' | 'teal' | 'blue';

interface IndicatorPillProps extends Styling, Titled {
  /** Value to display. */
  value: number | string;

  /** Disabled state. */
  disabled?: boolean;

  /** Icon to display. */
  icon: React.ReactNode;

  /** Color of the pill. */
  color: PillType;

  /** Click handler. */
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

/** Displays a value with an icon that can be clicked. */
export function IndicatorPill({
  icon,
  value,
  title,
  titleHtml,
  hideTitle,
  className,
  disabled,
  onClick,
  color
}: IndicatorPillProps) {
  const problematicBadgeLabel = typeof value === 'number' && value > MAX_VISIBLE_VALUE ? '99+' : `${value}`;
  return (
    <div
      className={cn(
        'min-h-4.5 min-w-5',
        'inline-flex items-center justify-center gap-0.5 pl-1 pr-1.5',
        'border rounded-full select-none',
        'text-[0.6875rem] font-semibold',
        onClick && !disabled && 'cursor-pointer',
        getPillColor(color),
        className
      )}
      data-tooltip-id={!!title || !!titleHtml ? globalIDs.tooltip : undefined}
      data-tooltip-html={titleHtml}
      data-tooltip-content={title}
      data-tooltip-hidden={hideTitle}
      aria-label={title}
      onClick={disabled ? undefined : onClick}
    >
      {icon}
      <span className='leading-none'>{problematicBadgeLabel}</span>
    </div>
  );
}

// ======== Internal =========
function getPillColor(color: PillType) {
  switch (color) {
    case 'destructive':
      return 'pill-red';
    case 'info':
      return 'pill-primary';
    case 'muted':
      return 'pill-muted';
    case 'green':
      return 'pill-green';
    case 'orange':
      return 'pill-orange';
    case 'purple':
      return 'pill-purple';
    case 'teal':
      return 'pill-teal';
    case 'blue':
      return 'pill-blue';
  }
}
