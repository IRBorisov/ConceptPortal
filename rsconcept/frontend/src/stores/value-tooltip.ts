import { create } from 'zustand';

interface ValueTooltipStore {
  /** Full plain-text payload for the global value tooltip (last hovered cell). */
  activeText: string | null;
  setActiveText: (text: string | null) => void;
}

export const useValueTooltipStore = create<ValueTooltipStore>()(set => ({
  activeText: null,
  setActiveText: text => set({ activeText: text })
}));
