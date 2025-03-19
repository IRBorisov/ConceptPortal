import clsx from 'clsx';

import { type Styling } from '@/components/props';
import { globalIDs } from '@/utils/constants';

interface NavigationButtonProps extends Styling {
  text?: string;
  title?: string;
  hideTitle?: boolean;
  icon: React.ReactNode;
  onClick?: (event: React.MouseEvent<Element>) => void;
}

export function NavigationButton({ icon, title, hideTitle, className, style, onClick, text }: NavigationButtonProps) {
  return (
    <button
      type='button'
      tabIndex={1}
      aria-label={title}
      data-tooltip-id={!!title ? globalIDs.tooltip : undefined}
      data-tooltip-hidden={hideTitle}
      data-tooltip-content={title}
      onClick={onClick}
      className={clsx('p-2 flex items-center gap-1', 'cc-btn-nav', 'font-controls clr-outline', className)}
      style={style}
    >
      {icon ? icon : null}
      {text ? <span className='hidden sm:inline'>{text}</span> : null}
    </button>
  );
}
