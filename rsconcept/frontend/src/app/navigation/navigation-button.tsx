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

type NavigationButtonDomProps = Pick<
  React.ComponentProps<'button'>,
  'aria-controls' | 'aria-expanded' | 'aria-haspopup'
>;

export function NavigationButton({
  icon,
  title,
  hideTitle,
  className,
  style,
  onClick,
  text,
  'aria-controls': ariaControls,
  'aria-expanded': ariaExpanded,
  'aria-haspopup': ariaHasPopup
}: NavigationButtonProps & NavigationButtonDomProps) {
  return (
    <button
      type='button'
      tabIndex={0}
      aria-label={title}
      aria-controls={ariaControls}
      aria-expanded={ariaExpanded}
      aria-haspopup={ariaHasPopup}
      data-tooltip-id={!!title ? globalIDs.tooltip : undefined}
      data-tooltip-hidden={hideTitle}
      data-tooltip-content={title}
      onClick={onClick}
      className={cn(
        'p-2 flex items-center gap-2 rounded-xl',
        'cursor-pointer whitespace-nowrap',
        'font-math font-semibold text-sm',
        'text-muted-foreground hover:text-foreground',
        'transition-colors duration-move ease-(--ease-bezier)',
        'outline-hidden focus-outline',
        className
      )}
      style={style}
    >
      {icon ? icon : null}
      {text ? <span className='hidden lg:inline'>{text}</span> : null}
    </button>
  );
}
