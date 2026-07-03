'use client';

import { type ComponentProps } from 'react';

import { useValueTooltipAnchor } from '@/hooks/use-value-tooltip-anchor';

interface SelectTreeItemProps extends ComponentProps<'div'> {
  description: string;
}

export function SelectTreeItem({
  description,
  children,
  onPointerEnter,
  onPointerLeave,
  ...restProps
}: SelectTreeItemProps) {
  const tooltipAnchor = useValueTooltipAnchor(description || null);

  return (
    <div
      {...restProps}
      {...tooltipAnchor}
      onPointerEnter={
        description || onPointerEnter
          ? event => {
              tooltipAnchor.onPointerEnter?.(event);
              onPointerEnter?.(event);
            }
          : onPointerEnter
      }
      onPointerLeave={
        description || onPointerLeave
          ? event => {
              tooltipAnchor.onPointerLeave?.(event);
              onPointerLeave?.(event);
            }
          : onPointerLeave
      }
    >
      {children}
    </div>
  );
}
