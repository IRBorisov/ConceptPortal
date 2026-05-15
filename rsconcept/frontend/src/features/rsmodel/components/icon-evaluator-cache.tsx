import { type DomIconProps, IconDatabase, IconDatabaseOff } from '@/components/icons';
import { cn } from '@/components/utils';

/** Cache enabled when value is true. */
export function IconEvaluatorCache({ value, size = '1.25rem', className }: DomIconProps<boolean>) {
  if (value) {
    return <IconDatabase size={size} className={cn('icon-primary', className)} />;
  }
  return <IconDatabaseOff size={size} className={cn('text-muted-foreground', className)} />;
}
