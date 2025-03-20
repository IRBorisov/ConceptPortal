import clsx from 'clsx';

import { type Button } from '@/components/props';
import { globalIDs } from '@/utils/constants';

interface DropdownButtonProps extends Button {
  /** Icon to display first (not used if children are provided). */
  icon?: React.ReactNode;

  /** Text to display second (not used if children are provided). */
  text?: string;

  /** Custom children to display. */
  children?: React.ReactNode;
}

/**
 * `button` with optional text, icon, and click functionality styled for use in a {@link Dropdown}.
 * It supports optional children for custom content or the default text/icon display.
 */
export function DropdownButton({
  icon,
  text,
  className,
  title,
  titleHtml,
  hideTitle,
  onClick,
  children,
  ...restProps
}: DropdownButtonProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={clsx(
        'px-3 py-1 inline-flex items-center gap-2',
        'text-left text-sm text-ellipsis whitespace-nowrap',
        'disabled:clr-text-controls',
        'cc-animate-color',
        !!onClick ? 'clr-hover cursor-pointer disabled:cursor-auto' : 'clr-btn-default',
        className
      )}
      data-tooltip-id={!!title || !!titleHtml ? globalIDs.tooltip : undefined}
      data-tooltip-html={titleHtml}
      data-tooltip-content={title}
      data-tooltip-hidden={hideTitle}
      aria-label={title}
      {...restProps}
    >
      {icon ? icon : null}
      {text ? <span>{text}</span> : null}
      {children ? children : null}
    </button>
  );
}
