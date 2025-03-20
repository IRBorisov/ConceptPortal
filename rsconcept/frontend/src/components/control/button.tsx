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
      className={clsx(
        'inline-flex gap-2 items-center justify-center',
        'font-medium select-none disabled:cursor-auto',
        'clr-btn-default cc-animate-color',
        dense ? 'px-1' : 'px-3 py-1',
        loading ? 'cursor-progress' : 'cursor-pointer',
        noOutline ? 'outline-hidden' : 'focus-outline',
        !noBorder && 'border rounded-sm',
        className
      )}
      data-tooltip-id={!!title || !!titleHtml ? globalIDs.tooltip : undefined}
      data-tooltip-html={titleHtml}
      data-tooltip-content={title}
      data-tooltip-hidden={hideTitle}
      disabled={disabled ?? loading}
      aria-label={!text ? title : undefined}
      {...restProps}
    >
      {icon ? icon : null}
      {text ? <span>{text}</span> : null}
    </button>
  );
}
