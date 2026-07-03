'use client';

import { type PointerEventHandler, type ReactNode } from 'react';

import { useValueTooltipStore } from '@/stores/value-tooltip';
import { globalIDs } from '@/utils/constants';

export function isValueTooltipAnchor(target: EventTarget | null): target is Element {
  return target instanceof Element && target.closest(`[data-tooltip-id="${globalIDs.value_tooltip}"]`) !== null;
}

interface ValueTooltipAnchorProps {
  'data-tooltip-id'?: string;
  'onPointerEnter'?: PointerEventHandler<HTMLElement>;
  'onPointerLeave'?: PointerEventHandler<HTMLElement>;
}

/**
 * Hover handlers for anchors that share the global value tooltip.
 * Content is committed only after {@link VALUE_TOOLTIP_SHOW_DELAY}; switching
 * anchors resets the timer instead of updating visible content immediately.
 */
export function useValueTooltipAnchor(text: ReactNode | null | false | undefined): ValueTooltipAnchorProps {
  const scheduleShow = useValueTooltipStore(state => state.scheduleShow);
  const hide = useValueTooltipStore(state => state.hide);

  if (!text) {
    return {};
  }

  return {
    'data-tooltip-id': globalIDs.value_tooltip,
    'onPointerEnter': event => scheduleShow(text, { x: event.clientX, y: event.clientY }),
    'onPointerLeave': event => {
      if (isValueTooltipAnchor(event.relatedTarget)) {
        return;
      }
      hide();
    }
  };
}
