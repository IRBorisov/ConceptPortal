import { type DomIconProps, IconMoveDown, IconMoveUp } from '@/components/icons';

/** Icon for relocation direction. */
export function IconRelocationUp({ value, size = '1.25rem', className }: DomIconProps<boolean>) {
  if (value) {
    return <IconMoveUp size={size} className={className ?? 'text-primary'} />;
  } else {
    return <IconMoveDown size={size} className={className ?? 'text-primary'} />;
  }
}
