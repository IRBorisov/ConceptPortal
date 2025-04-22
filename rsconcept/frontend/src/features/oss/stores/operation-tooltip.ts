import { create } from 'zustand';

import { type IOssItem } from '../models/oss';

interface OperationTooltipStore {
  hoverItem: IOssItem | null;
  setHoverItem: (value: IOssItem | null) => void;
}

export const useOperationTooltipStore = create<OperationTooltipStore>()(set => ({
  hoverItem: null,
  setHoverItem: value => set({ hoverItem: value })
}));
