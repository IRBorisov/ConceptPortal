import { create } from 'zustand';

import { type Constituenta } from '../models/rsform';

interface CstTooltipStore {
  activeCst: Constituenta | null;
  setActiveCst: (value: Constituenta | null) => void;
}

export const useCstTooltipStore = create<CstTooltipStore>()(set => ({
  activeCst: null,
  setActiveCst: value => set({ activeCst: value })
}));
