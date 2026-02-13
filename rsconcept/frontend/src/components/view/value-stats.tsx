import clsx from 'clsx';

import { type Styling, type Titled } from '@/components/props';
import { globalIDs } from '@/utils/constants';

// characters - threshold for small labels - small font
const SMALL_THRESHOLD = 3;

interface ValueStatsProps extends Styling, Titled {
  /** Id of the component. */
  id: string;

  /** Icon to display. */
  icon: React.ReactNode;

  /** Value to display. */
  value: string | number;
}

/** Displays statistics value with an icon. */
export function ValueStats({ id, icon, value, className, title, titleHtml, hideTitle, ...restProps }: ValueStatsProps) {
  const isSmall = String(value).length < SMALL_THRESHOLD;
  return (
    <div
      className={clsx('flex items-center gap-1', 'text-right font-math', 'hover:cursor-default', className)}
      data-tooltip-id={!!title || !!titleHtml ? globalIDs.tooltip : undefined}
      data-tooltip-html={titleHtml}
      data-tooltip-content={title}
      data-tooltip-hidden={hideTitle}
      aria-label={title}
      {...restProps}
    >
      {icon}
      <span id={id} className={clsx(!isSmall && 'text-xs', 'min-w-5')}>
        {value}
      </span>
    </div>
  );
}
