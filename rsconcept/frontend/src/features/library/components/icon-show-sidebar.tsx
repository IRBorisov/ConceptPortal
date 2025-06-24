import { type DomIconProps, IconBottomClose, IconBottomOpen, IconLeftClose, IconLeftOpen } from '@/components/icons';

/** Icon for sidebar visibility. */
export function IconShowSidebar({
  value,
  size = '1.25rem',
  className,
  isBottom
}: DomIconProps<boolean> & { isBottom: boolean }) {
  if (isBottom) {
    if (value) {
      return <IconBottomClose size={size} className={className ?? 'icon-primary'} />;
    } else {
      return <IconBottomOpen size={size} className={className ?? 'icon-primary'} />;
    }
  } else {
    if (value) {
      return <IconLeftClose size={size} className={className ?? 'icon-primary'} />;
    } else {
      return <IconLeftOpen size={size} className={className ?? 'icon-primary'} />;
    }
  }
}
