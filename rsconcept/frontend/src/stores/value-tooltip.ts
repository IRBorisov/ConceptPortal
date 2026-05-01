import { type ReactNode } from 'react';
import { create } from 'zustand';

interface ValueTooltipStore {
  /** Full payload for the global value tooltip (last hovered cell). */
  activeText: ReactNode | null;
  setActiveText: (text: ReactNode | null) => void;
}

export const useValueTooltipStore = create<ValueTooltipStore>()(set => ({
  activeText: null,
  setActiveText: text => set({ activeText: text })
}));
