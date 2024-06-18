import clsx from 'clsx';

import { globals } from '@/utils/constants';

import { CProps } from '../props';

interface SelectorButtonProps extends CProps.Button {
  text?: string;
  icon?: React.ReactNode;

  colors?: string;
  transparent?: boolean;
}

function SelectorButton({
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
      {text ? <div className={'whitespace-nowrap'}>{text}</div> : null}
    </button>
  );
}

export default SelectorButton;
