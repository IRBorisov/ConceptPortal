import { type ReactNode } from 'react';
import { create } from 'zustand';

/** Matches hover delay before the global value tooltip content is committed. */
export const VALUE_TOOLTIP_SHOW_DELAY = 500;

export interface ValueTooltipPosition {
  x: number;
  y: number;
}

let showTimer: ReturnType<typeof setTimeout> | null = null;

function clearShowTimer() {
  if (showTimer !== null) {
    clearTimeout(showTimer);
    showTimer = null;
  }
}

interface ValueTooltipStore {
  isOpen: boolean;
  /** Committed tooltip payload (shown after hover delay). */
  activeText: ReactNode | null;
  anchorPosition: ValueTooltipPosition | null;
  scheduleShow: (text: ReactNode, position: ValueTooltipPosition) => void;
  /** Start closing; content is kept until the tooltip finishes hiding. */
  hide: () => void;
  /** Drop content after the hide animation completes. */
  clearDisplayed: () => void;
}

export const useValueTooltipStore = create<ValueTooltipStore>()(set => ({
  isOpen: false,
  activeText: null,
  anchorPosition: null,
  scheduleShow: (text, position) => {
    clearShowTimer();
    set(state => ({
      isOpen: false,
      anchorPosition: position,
      activeText: state.isOpen ? state.activeText : null
    }));
    showTimer = setTimeout(() => {
      showTimer = null;
      set({ activeText: text, anchorPosition: position, isOpen: true });
    }, VALUE_TOOLTIP_SHOW_DELAY);
  },
  hide: () => {
    clearShowTimer();
    set({ isOpen: false });
  },
  clearDisplayed: () => set({ activeText: null, anchorPosition: null })
}));
