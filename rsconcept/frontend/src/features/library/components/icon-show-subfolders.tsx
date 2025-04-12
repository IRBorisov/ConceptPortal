import { type DomIconProps, IconSubfolders } from '@/components/icons';

/** Icon for subfolders. */
export function IconShowSubfolders({ value, size = '1.25rem', className }: DomIconProps<boolean>) {
  if (value) {
    return <IconSubfolders size={size} className={className ?? 'text-constructive'} />;
  } else {
    return <IconSubfolders size={size} className={className ?? 'text-primary'} />;
  }
}
