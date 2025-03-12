import { type DomIconProps, IconMoveDown, IconMoveUp } from '@/components/icons1';

/** Icon for relocation direction. */
export function IconRelocationUp({ value, size = '1.25rem', className }: DomIconProps<boolean>) {
  if (value) {
    return <IconMoveUp size={size} className={className ?? 'text-sec-600'} />;
  } else {
    return <IconMoveDown size={size} className={className ?? 'text-sec-600'} />;
  }
}
