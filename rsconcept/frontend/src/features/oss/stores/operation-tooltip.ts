import { create } from 'zustand';

import { type OssItem } from '@rsconcept/domain/library';

interface OperationTooltipStore {
  hoverItem: OssItem | null;
  setHoverItem: (value: OssItem | null) => void;
}

export const useOperationTooltipStore = create<OperationTooltipStore>()(set => ({
  hoverItem: null,
  setHoverItem: value => set({ hoverItem: value })
}));
