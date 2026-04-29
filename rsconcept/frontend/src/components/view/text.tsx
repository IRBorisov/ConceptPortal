'use client';

import { type ComponentProps } from 'react';
import clsx from 'clsx';

import { useValueTooltipStore } from '@/stores/value-tooltip';
import { globalIDs } from '@/utils/constants';

interface TextProps extends Omit<ComponentProps<'div'>, 'children'> {
  /** Text to display. */
  text: string;

  /** Tooltip text */
  title?: string;
}

/** Displays text with a tooltip. */
export function Text({ className, text, title, onPointerEnter, ...restProps }: TextProps) {
  const setActiveText = useValueTooltipStore(state => state.setActiveText);

  return (
    <div
      {...restProps}
      className={clsx('text-pretty', className)}
      data-tooltip-id={title ? globalIDs.value_tooltip : undefined}
      onPointerEnter={
        title
          ? event => {
              onPointerEnter?.(event);
              setActiveText(title);
            }
          : onPointerEnter
      }
    >
      {text}
    </div>
  );
}
