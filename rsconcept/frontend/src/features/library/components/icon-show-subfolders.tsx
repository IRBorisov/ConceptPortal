import { type DomIconProps, IconSubfolders } from '@/components/icons1';

/** Icon for subfolders. */
export function IconShowSubfolders({ value, size = '1.25rem', className }: DomIconProps<boolean>) {
  if (value) {
    return <IconSubfolders size={size} className={className ?? 'text-ok-600'} />;
  } else {
    return <IconSubfolders size={size} className={className ?? 'text-sec-600'} />;
  }
}
