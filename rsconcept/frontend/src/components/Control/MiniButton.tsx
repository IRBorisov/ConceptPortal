import clsx from 'clsx';

import { globals } from '@/utils/constants';

import { CProps } from '../props';

interface MiniButtonProps extends CProps.Button {
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
      className={clsx(
        'rounded-lg',
        'clr-text-controls cc-animate-color',
        'cursor-pointer disabled:cursor-auto',
        {
          'px-1 py-1': !noPadding,
          'outline-none': noHover,
          'clr-hover': !noHover
        },
        className
      )}
      data-tooltip-id={!!title || !!titleHtml ? globals.tooltip : undefined}
      data-tooltip-html={titleHtml}
      data-tooltip-content={title}
      data-tooltip-hidden={hideTitle}
      {...restProps}
    >
      {icon}
    </button>
  );
}
