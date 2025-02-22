import clsx from 'clsx';

import { globalIDs } from '@/utils/constants';

import { type Button as ButtonStyle, type Control } from '../props';

interface ButtonProps extends Control, ButtonStyle {
  /** Icon to display first. */
  icon?: React.ReactNode;

  /** Text to display second. */
  text?: string;

  /** Indicates whether to render the button in a dense style. */
  dense?: boolean;

  /** Indicates loading state to prevent interactions and change visual style. */
  loading?: boolean;
}

/**
 * Customizable `button` with text, icon, tooltips and various styles.
 */
export function Button({
  icon,
  text,
  title,
  titleHtml,
  hideTitle,
  loading,
  dense,
  disabled,
  noBorder,
  noOutline,
  className,
  ...restProps
}: ButtonProps) {
  return (
    <button
      type='button'
      disabled={disabled ?? loading}
      className={clsx(
        'inline-flex gap-2 items-center justify-center',
        'select-none disabled:cursor-auto',
        'clr-btn-default cc-animate-color',
        {
          'border rounded-sm': !noBorder,
          'px-1': dense,
          'px-3 py-1': !dense,
          'cursor-progress': loading,
          'cursor-pointer': !loading,
          'outline-hidden': noOutline,
          'clr-outline': !noOutline
        },
        className
      )}
      data-tooltip-id={!!title || !!titleHtml ? globalIDs.tooltip : undefined}
      data-tooltip-html={titleHtml}
      data-tooltip-content={title}
      data-tooltip-hidden={hideTitle}
      {...restProps}
    >
      {icon ? icon : null}
      {text ? <span className='font-medium'>{text}</span> : null}
    </button>
  );
}
