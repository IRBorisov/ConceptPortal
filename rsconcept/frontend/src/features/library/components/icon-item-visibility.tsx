import { type DomIconProps, IconHide, IconShow } from '@/components/icons';

/** Icon for visibility. */
export function IconItemVisibility({ value, size = '1.25rem', className }: DomIconProps<boolean>) {
  if (value) {
    return <IconShow size={size} className={className ?? 'text-constructive'} />;
  } else {
    return <IconHide size={size} className={className ?? 'text-destructive'} />;
  }
}
