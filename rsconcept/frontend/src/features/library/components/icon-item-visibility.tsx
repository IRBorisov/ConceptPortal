import { type DomIconProps, IconHide, IconShow } from '@/components/icons1';

/** Icon for visibility. */
export function IconItemVisibility({ value, size = '1.25rem', className }: DomIconProps<boolean>) {
  if (value) {
    return <IconShow size={size} className={className ?? 'text-ok-600'} />;
  } else {
    return <IconHide size={size} className={className ?? 'text-warn-600'} />;
  }
}
