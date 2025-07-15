import { type DomIconProps, IconPrivate, IconPublic } from '@/components/icons';

/** Icon for shared template flag. */
export function IconSharedTemplate({ value, size = '1.25rem', className }: DomIconProps<boolean>) {
  if (value) {
    return <IconPublic size={size} className={className ?? 'text-constructive'} />;
  } else {
    return <IconPrivate size={size} className={className ?? 'text-primary'} />;
  }
}
