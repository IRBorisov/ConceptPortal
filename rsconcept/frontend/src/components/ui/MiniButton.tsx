import clsx from 'clsx';

import { globals } from '@/utils/constants';

import { CProps } from '../props';

interface MiniButtonProps extends CProps.Button {
  icon: React.ReactNode;
  noHover?: boolean;
  noPadding?: boolean;
}

function MiniButton({
  icon,
  noHover,
  noPadding,
  tabIndex,
  title,
  titleHtml,
  hideTitle,
  className,
  ...restProps
}: MiniButtonProps) {
  return (
    <button
      type='button'
      tabIndex={tabIndex ?? -1}
      className={clsx(
        'rounded-lg',
        'clr-btn-clear',
        'cursor-pointer disabled:cursor-not-allowed',
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

export default MiniButton;
