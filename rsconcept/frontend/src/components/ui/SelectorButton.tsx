import clsx from 'clsx';

import { globalIDs } from '@/utils/constants';

import { CProps } from '../props';

interface SelectorButtonProps extends CProps.Button {
  text?: string;
  titleHtml?: string;
  icon?: React.ReactNode;

  colors?: string;
  transparent?: boolean;
  hideTitle?: boolean;
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
      className={clsx(
        'px-1 flex flex-start items-center gap-1',
        'text-sm font-controls select-none',
        'text-btn clr-text-controls',
        'disabled:cursor-not-allowed cursor-pointer',
        {
          'clr-hover': transparent,
          'border': !transparent
        },
        className,
        !transparent && colors
      )}
      data-tooltip-id={!!title || !!titleHtml ? globalIDs.tooltip : undefined}
      data-tooltip-html={titleHtml}
      data-tooltip-content={title}
      data-tooltip-hidden={hideTitle}
      {...restProps}
    >
      {icon ? icon : null}
      {text ? <div className={'whitespace-nowrap pb-1'}>{text}</div> : null}
    </button>
  );
}

export default SelectorButton;
