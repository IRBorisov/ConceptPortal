import { type DomIconProps, IconClustering, IconClusteringOff } from '@/components/icons';
import { cn } from '@/components/utils';

export function IconEnableClustering({ value, size = '1.25rem', className }: DomIconProps<boolean>) {
  if (value) {
    return <IconClustering size={size} className={cn('icon-green', className)} />;
  } else {
    return <IconClusteringOff size={size} className={cn('icon-primary', className)} />;
  }
}