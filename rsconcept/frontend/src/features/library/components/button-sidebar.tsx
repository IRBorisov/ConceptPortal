import { MiniButton } from '@/components/control';
import { cn } from '@/components/utils';

import { IconShowSidebar } from './icon-show-sidebar';

interface ButtonSidebarProps {
  title: string;
  show: boolean;
  isNarrow: boolean;
  onClick: () => void;
  className?: string;
}

export function ButtonSidebar({ show, title, isNarrow, onClick, className }: ButtonSidebarProps) {
  return (
    <MiniButton
      title={title}
      icon={<IconShowSidebar value={show} isBottom={isNarrow} size='1.25rem' />}
      onClick={onClick}
      className={cn(
        'z-10',
        'opacity-100 md:opacity-0 md:hover:opacity-100 md:focus-visible:opacity-100',
        'transition-opacity duration-fade',
        className
      )}
    />
  );
}
