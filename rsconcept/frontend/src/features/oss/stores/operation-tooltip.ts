import { create } from 'zustand';

import { type OssItem } from '../models/oss';

interface OperationTooltipStore {
  hoverItem: OssItem | null;
  setHoverItem: (value: OssItem | null) => void;
}

export const useOperationTooltipStore = create<OperationTooltipStore>()(set => ({
  hoverItem: null,
  setHoverItem: value => set({ hoverItem: value })
}));
