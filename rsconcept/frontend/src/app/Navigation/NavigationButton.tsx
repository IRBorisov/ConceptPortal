import clsx from 'clsx';

import { type Styling } from '@/components/props';
import { globalIDs } from '@/utils/constants';

interface NavigationButtonProps extends Styling {
  text?: string;
  title?: string;
  icon: React.ReactNode;
  onClick?: (event: React.MouseEvent<Element>) => void;
}

export function NavigationButton({ icon, title, className, style, onClick, text }: NavigationButtonProps) {
  return (
    <button
      type='button'
      tabIndex={-1}
      aria-label={title}
      data-tooltip-id={!!title ? globalIDs.tooltip : undefined}
      data-tooltip-content={title}
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
