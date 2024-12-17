import clsx from 'clsx';

import { globals } from '@/utils/constants';

import { CProps } from '../props';

interface DropdownButtonProps extends CProps.Button {
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
function DropdownButton({
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
      tabIndex={-1}
      type='button'
      onClick={onClick}
      className={clsx(
        'px-3 py-1 inline-flex items-center gap-2',
        'text-left text-sm overflow-ellipsis whitespace-nowrap',
        'disabled:clr-text-controls',
        'cc-animate-color',
        {
          'clr-hover': onClick,
          'cursor-pointer disabled:cursor-auto': onClick,
          'cursor-default': !onClick
        },
        className
      )}
      data-tooltip-id={!!title || !!titleHtml ? globals.tooltip : undefined}
      data-tooltip-html={titleHtml}
      data-tooltip-content={title}
      data-tooltip-hidden={hideTitle}
      {...restProps}
    >
      {children ? children : null}
      {!children && icon ? icon : null}
      {!children && text ? <span>{text}</span> : null}
    </button>
  );
}

export default DropdownButton;
