import { globalIDs } from '@/utils/constants';

import { type Button } from '../props';
import { cn } from '../utils';

interface MiniButtonProps extends Button {
  /** Button type. */
  type?: 'button' | 'submit';

  /** Icon to display in the button. */
  icon: React.ReactNode;

  /** Disable hover effect. */
  noHover?: boolean;

  /** Disable padding. */
  noPadding?: boolean;
}

/**
 * Displays small transparent button with an icon.
 */
export function MiniButton({
  icon,
  noHover,
  noPadding,
  tabIndex,
  title,
  titleHtml,
  hideTitle,
  type = 'button',
  className,
  ...restProps
}: MiniButtonProps) {
  return (
    <button
      type={type}
      tabIndex={tabIndex ?? -1}
      className={cn(
        'rounded-lg',
        'cc-controls cc-animate-background',
        'cursor-pointer disabled:cursor-auto',
        (!tabIndex || tabIndex === -1) && 'outline-hidden',
        !noHover && 'cc-hover-pulse',
        !noPadding && 'px-1 py-1',
        className
      )}
      data-tooltip-id={!!title || !!titleHtml ? globalIDs.tooltip : undefined}
      data-tooltip-html={titleHtml}
      data-tooltip-content={title}
      data-tooltip-hidden={hideTitle}
      aria-label={title}
      {...restProps}
    >
      {icon}
    </button>
  );
}
