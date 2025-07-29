import { type DomIconProps, IconCrucial } from '@/components/icons';
import { cn } from '@/components/utils';

export function IconCrucialValue({ value, size = '1.25rem', className }: DomIconProps<boolean>) {
  if (value) {
    return <IconCrucial size={size} className={cn('text-primary', className)} />;
  } else {
    return <IconCrucial size={size} className={cn('text-muted-foreground', className)} />;
  }
}
