import { globalIDs } from '@/utils/constants';

import { type Button } from '../props';
import { cn } from '../utils';

interface SelectorButtonProps extends Button {
  /** Text to display in the button. */
  text?: string;

  /** Icon to display in the button. */
  icon?: React.ReactNode;
}

/**
 * Displays a button with an icon and text that opens a dropdown menu.
 */
export function SelectorButton({
  text,
  icon,
  title,

  className,
  hideTitle,
  ...restProps
}: SelectorButtonProps) {
  return (
    <button
      type='button'
      tabIndex={-1}
      className={cn(
        'px-1 flex flex-start items-center gap-1',
        'text-sm font-controls select-none',
        'disabled:cursor-auto cursor-pointer outline-hidden',
        'text-muted-foreground disabled:opacity-75',
        'cc-hover-pulse cc-animate-color ',
        className
      )}
      data-tooltip-id={!!title ? globalIDs.tooltip : undefined}
      data-tooltip-content={title}
      data-tooltip-hidden={hideTitle}
      {...restProps}
    >
      {icon ? icon : null}
      {text ? <div className='whitespace-nowrap'>{text}</div> : null}
    </button>
  );
}
