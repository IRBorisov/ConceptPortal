import { type Styling } from '@/components/props';
import { cn } from '@/components/utils';
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
      tabIndex={0}
      aria-label={title}
      data-tooltip-id={!!title ? globalIDs.tooltip : undefined}
      data-tooltip-hidden={hideTitle}
      data-tooltip-content={title}
      onClick={onClick}
      className={cn('p-2 flex items-center gap-1', 'cc-btn-nav', 'font-controls focus-outline', className)}
      style={style}
    >
      {icon ? icon : null}
      {text ? <span className='hidden md:inline'>{text}</span> : null}
    </button>
  );
}
