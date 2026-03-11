import { type Position2D } from '@/features/oss/models/oss-layout';

import { cn } from '@/components/utils';

interface CoordinateDisplayProps {
  mouseCoords: Position2D;
  className: string;
}

export function CoordinateDisplay({ mouseCoords, className }: CoordinateDisplayProps) {
  return (
    <div className={cn('hover:bg-background backdrop-blur-xs text-sm font-math', className)}>
      {`X: ${mouseCoords.x.toFixed(0)} Y: ${mouseCoords.y.toFixed(0)}`}
    </div>
  );
}
