'use client';

import { useEffect, useEffectEvent } from 'react';

import { useOperationTooltipStore } from '@/features/oss/stores/operation-tooltip';
import { useCstTooltipStore } from '@/features/rsform/stores/cst-tooltip';

import { useValueTooltipStore } from '@/stores/value-tooltip';

function dismissStuckTooltips() {
  useValueTooltipStore.getState().hide();
  useCstTooltipStore.getState().setActiveCst(null);
  useOperationTooltipStore.getState().setHoverItem(null);

  document.querySelectorAll('[data-tooltip-id]').forEach(element => {
    element.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    element.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));
  });
}

/**
 * Clears hover tooltips after touch ends. Long-press on touch devices can
 * synthesize hover without a matching leave event, leaving tooltips stuck open.
 */
export function TouchTooltipGuard() {
  const dismiss = useEffectEvent(dismissStuckTooltips);

  useEffect(function listenForTouchEnd() {
    function handleTouchEnd() {
      dismiss();
    }
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('touchcancel', handleTouchEnd, { passive: true });
    return () => {
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, []);

  return null;
}
