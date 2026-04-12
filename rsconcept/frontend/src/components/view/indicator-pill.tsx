'use client';

import { globalIDs } from '@/utils/constants';

import { type Styling, type Titled } from '../props';
import { cn } from '../utils';

const MAX_VISIBLE_VALUE = 99;

interface IndicatorPillProps extends Styling, Titled {
  /** Value to display. */
  value: number;

  /** Icon to display. */
  icon: React.ReactNode;

  /** Color of the pill. */
  color: 'destructive' | 'success' | 'info';

  /** Click handler. */
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

/**
 * Displays a value with an icon that can be clicked.
 */
export function IndicatorPill({
  icon,
  value,
  title,
  titleHtml,
  hideTitle,
  className,
  onClick,
  color
}: IndicatorPillProps) {
  const problematicBadgeLabel = value > MAX_VISIBLE_VALUE ? '99+' : `${value}`;
  return (
    <div
      className={cn(
        'min-h-4.5 min-w-5',
        'inline-flex items-center justify-center gap-0.5 pl-1 pr-1.5',
        'border rounded-full select-none',
        onClick && 'cursor-pointer',
        color === 'destructive' &&
          'border-destructive/45 bg-destructive/10 text-destructive dark:bg-destructive/20 dark:border-destructive/60',
        color === 'success' &&
          'border-constructive/45 bg-constructive/10 text-constructive dark:bg-constructive/20 dark:border-constructive/60',
        color === 'info' && 'border-primary/45 bg-primary/10 text-primary dark:bg-primary/20 dark:border-primary/60',
        className
      )}
      data-tooltip-id={!!title || !!titleHtml ? globalIDs.tooltip : undefined}
      data-tooltip-html={titleHtml}
      data-tooltip-content={title}
      data-tooltip-hidden={hideTitle}
      aria-label={title}
      onClick={onClick}
    >
      {icon}
      <span className='text-[0.6875rem] leading-none font-semibold'>{problematicBadgeLabel}</span>
    </div>
  );
}
