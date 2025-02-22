import clsx from 'clsx';

import { type Styling, type Titled } from '@/components/props';
import { globalIDs } from '@/utils/constants';

interface NavigationButtonProps extends Titled, Styling {
  text?: string;
  icon: React.ReactNode;
  onClick?: (event: React.MouseEvent<Element>) => void;
}

export function NavigationButton({
  icon,
  title,
  className,
  style,
  titleHtml,
  hideTitle,
  onClick,
  text
}: NavigationButtonProps) {
  return (
    <button
      type='button'
      tabIndex={-1}
      data-tooltip-id={!!title || !!titleHtml ? globalIDs.tooltip : undefined}
      data-tooltip-html={titleHtml}
      data-tooltip-content={title}
      data-tooltip-hidden={hideTitle}
      onClick={onClick}
      className={clsx(
        'mr-1 h-full',
        'flex items-center gap-1',
        'cursor-pointer',
        'clr-btn-nav cc-animate-color duration-500',
        'rounded-xl',
        'font-controls whitespace-nowrap',
        {
          'px-2': text,
          'px-4': !text
        },
        className
      )}
      style={style}
    >
      {icon ? <span>{icon}</span> : null}
      {text ? <span className='hidden sm:inline'>{text}</span> : null}
    </button>
  );
}
