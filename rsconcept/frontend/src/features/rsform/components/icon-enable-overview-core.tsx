import { type DomIconProps, IconOverviewCore, IconTree } from '@/components/icons';
import { cn } from '@/components/utils';

/** On = axiomatic-core overview; off = full graph. */
export function IconEnableOverviewCore({ value, size = '1.25rem', className }: DomIconProps<boolean>) {
  if (value) {
    return <IconOverviewCore size={size} className={cn('icon-green', className)} />;
  }
  return <IconTree size={size} className={cn('icon-primary', className)} />;
}
