import { type DomIconProps, IconText, IconTextOff } from '@/components/icons';
import { cn } from '@/components/utils';

export function IconShowDataText({ value, size = '1.25rem', className }: DomIconProps<boolean>) {
  if (value) {
    return <IconText size={size} className={cn('icon-primary', className)} />;
  } else {
    return <IconTextOff size={size} className={cn('text-muted-foreground', className)} />;
  }
}
