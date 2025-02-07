import clsx from 'clsx';

import { CProps } from '@/components/props';
import { globals } from '@/utils/constants';

interface SelectorButtonProps extends CProps.Button {
  /** Text to display in the button. */
  text?: string;

  /** Icon to display in the button. */
  icon?: React.ReactNode;

  /** Classnames for the colors of the button. */
  colors?: string;

  /** Indicates if button background should be transparent. */
  transparent?: boolean;
}

/**
 * Displays a button with an icon and text that opens a dropdown menu.
 */
export function SelectorButton({
  text,
  icon,
  title,
  titleHtml,
  colors = 'clr-btn-default',
  className,
  transparent,
  hideTitle,
  ...restProps
}: SelectorButtonProps) {
  return (
    <button
      type='button'
      tabIndex={-1}
      className={clsx(
        'px-1 flex flex-start items-center gap-1',
        'text-sm font-controls select-none',
        'text-btn clr-text-controls',
        'disabled:cursor-auto cursor-pointer',
        'cc-animate-color',
        {
          'clr-hover': transparent,
          'border': !transparent
        },
        className,
        !transparent && colors
      )}
      data-tooltip-id={!!title || !!titleHtml ? globals.tooltip : undefined}
      data-tooltip-html={titleHtml}
      data-tooltip-content={title}
      data-tooltip-hidden={hideTitle}
      {...restProps}
    >
      {icon ? icon : null}
      {text ? <div className='whitespace-nowrap'>{text}</div> : null}
    </button>
  );
}
