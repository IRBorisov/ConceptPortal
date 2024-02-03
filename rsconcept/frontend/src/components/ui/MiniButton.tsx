import clsx from 'clsx';

import { globalIDs } from '@/utils/constants';

import { CProps } from '../props';

interface MiniButtonProps extends CProps.Button {
  icon: React.ReactNode;
  noHover?: boolean;
  hideTitle?: boolean;
}

function MiniButton({ icon, noHover, hideTitle, tabIndex, title, className, ...restProps }: MiniButtonProps) {
  return (
    <button
      type='button'
      tabIndex={tabIndex ?? -1}
      className={clsx(
        'px-1 py-1',
        'rounded-full',
        'clr-btn-clear',
        'cursor-pointer disabled:cursor-not-allowed',
        {
          'outline-none': noHover,
          'clr-hover': !noHover
        },
        className
      )}
      data-tooltip-id={title ? globalIDs.tooltip : undefined}
      data-tooltip-content={title}
      data-tooltip-hidden={hideTitle}
      {...restProps}
    >
      {icon}
    </button>
  );
}

export default MiniButton;
